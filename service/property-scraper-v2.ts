// Will need back end support to run this file evetually // Not in use currently //
// fast-scraper.ts
import Bottleneck from 'bottleneck'
import * as cheerio from 'cheerio'
import got from 'got'
import pLimit from 'p-limit'
import { URL } from 'url'

type ScrapedProperty = {
  source: string
  sourceUrl: string
  title: string
  address: string
  city: string
  state: string
  price?: number
  bedrooms?: number
  bathrooms?: number
  sqft?: number
  images: string[]
  description?: string
  contactInfo?: string
  guaranteeKeywords: string[]
  scrapedAt: string
}

type SearchResult = {
  id: string
  query: string
  results: ScrapedProperty[]
  searchedAt: string
  totalFound: number
}

type SearchTarget = {
  name: string
  // Return search/list URLs for the city/state.
  buildSearchUrls: (city: string, state: string) => string[]
  // Parse a list or detail page, returning either detail URLs or properties.
  parseList: (
    html: string,
    url: string,
  ) => { detailUrls?: string[]; properties?: ScrapedProperty[] }
  // Parse a detail page to properties.
  parseDetail?: (html: string, url: string) => ScrapedProperty[]
  // Optional: RSS feed URLs for near real-time pulls
  rssUrls?: (city: string, state: string) => string[]
}

const GUARANTEE_KEYWORDS = [
  'liberty rent',
  'liberty rental',
  'liberty lease',
  'rhino',
  'rhino insurance',
  'rhino deposit',
  'insurent',
  'the guarantors',
  'theguarantors',
  'second chance',
  'bad credit ok',
  'eviction ok',
  'credit flexible',
  'flexible credit',
  'poor credit ok',
  'lease guarantee',
  'rent guarantee',
  'guarantor accepted',
  'deposit alternative',
  'security deposit insurance',
  'broken lease ok',
  'past eviction ok',
]

const keywordMatcher = (text: string) => {
  const lower = text.toLowerCase()
  return GUARANTEE_KEYWORDS.filter((k) => lower.includes(k))
}

// --- Per-domain rate limiters (2 rps, burst 4) ---
const hostLimiter = new Map<string, Bottleneck>()
function limiterFor(url: string) {
  const { host } = new URL(url)
  if (!hostLimiter.has(host)) {
    hostLimiter.set(host, new Bottleneck({ minTime: 500, maxConcurrent: 4 }))
  }
  return hostLimiter.get(host)!
}

async function fetchHtml(url: string, timeoutMs = 10000): Promise<string> {
  const limiter = limiterFor(url)
  return limiter.schedule(async () =>
    got(url, {
      http2: true,
      timeout: { request: timeoutMs },
      headers: {
        'user-agent':
          'Mozilla/5.0 (compatible; RentBridgeBot/1.0; +https://rentbridge.example)',
        'accept-language': 'en-US,en;q=0.9',
      },
    }).text(),
  )
}

// --- Targets (examples) ---
const targets: SearchTarget[] = [
  // Craigslist via RSS (near real-time)
  {
    name: 'Craigslist',
    rssUrls: (city, state) => {
      // You’d map city/state to the right CL subdomain (e.g., austin.craigslist.org)
      // Here’s a naive example:
      const sub = city.toLowerCase().replace(/\s+/g, '')
      const base = `https://${sub}.craigslist.org`
      // Query keywords into RSS (CL supports query=)
      return GUARANTEE_KEYWORDS.map(
        (k) => `${base}/search/apa?format=rss&query=${encodeURIComponent(k)}`,
      )
    },
    buildSearchUrls: () => [], // we’ll prefer RSS for speed
    parseList: (xml, url) => {
      // Parse RSS quickly and return detail URLs
      // Simple regex fallback to avoid heavy XML libs in the snippet:
      const detailUrls = Array.from(xml.matchAll(/<link>(.*?)<\/link>/g))
        .map((m) => m[1])
        .filter((u) => u.startsWith('http'))
      return { detailUrls }
    },
    parseDetail: (html, url) => {
      const $ = cheerio.load(html)
      const title =
        $('#titletextonly').text().trim() || $('h1').first().text().trim()
      const desc =
        $('#postingbody').text() ||
        $('section#postingbody').text() ||
        $('body').text()
      const matched = keywordMatcher(`${title}\n${desc}`)
      if (matched.length === 0) return []
      const priceTxt = $('.price').first().text().replace(/[^\d]/g, '')
      const price = priceTxt ? parseInt(priceTxt, 10) : undefined
      const images = $('img')
        .map((_, el) => $(el).attr('src'))
        .get()
        .filter(Boolean) as string[]

      return [
        {
          source: 'Craigslist',
          sourceUrl: url,
          title: title || 'Listing',
          address: '',
          city: '',
          state: '',
          price,
          images,
          description: desc.slice(0, 2000),
          contactInfo: '',
          guaranteeKeywords: matched,
          scrapedAt: new Date().toISOString(),
        },
      ]
    },
  },

  // Apartments.com (example selectors; verify & adjust)
  {
    name: 'Apartments.com',
    buildSearchUrls: (city, state) => {
      // Precomputed city pages are faster than generic search.
      // Example: /[STATE]/[CITY]/?bb=... would be ideal, but as a placeholder:
      const q = encodeURIComponent(`${city}, ${state}`)
      return [`https://www.apartments.com/${q}/`]
    },
    parseList: (html, url) => {
      const $ = cheerio.load(html)
      const detailUrls = new Set<string>()
      $('a.property-link, a[href*="/property/"]').each((_, el) => {
        const href = $(el).attr('href')
        if (href && href.startsWith('http')) detailUrls.add(href)
      })
      return { detailUrls: Array.from(detailUrls) }
    },
    parseDetail: (html, url) => {
      const $ = cheerio.load(html)
      const title = $('h1, .propertyName').first().text().trim()
      const address = $('[data-test="property-address"], .propertyAddress')
        .first()
        .text()
        .trim()
      const desc = $(
        '[data-test="description"], .description, #description',
      ).text()
      const matched = keywordMatcher(`${title}\n${address}\n${desc}`)
      if (matched.length === 0) return []
      const images = $('img')
        .map((_, el) => $(el).attr('src'))
        .get()
        .filter(Boolean) as string[]
      return [
        {
          source: 'Apartments.com',
          sourceUrl: url,
          title: title || 'Property',
          address,
          city: '',
          state: '',
          images,
          description: desc.slice(0, 2000),
          contactInfo: '',
          guaranteeKeywords: matched,
          scrapedAt: new Date().toISOString(),
        },
      ]
    },
  },
]

// --- Core runner (parallel + streaming) ---
type OnResult = (prop: ScrapedProperty) => void

export async function fastSearch(
  city: string,
  state: string,
  onResult?: OnResult,
): Promise<SearchResult> {
  const id = Date.now().toString()
  const discoveredDetailUrls = new Set<string>()
  const results: ScrapedProperty[] = []
  const limit = pLimit(12) // total concurrency cap

  const addResult = (p: ScrapedProperty) => {
    // simple dedupe by URL + title
    const key = `${p.sourceUrl}|${p.title}`.toLowerCase()
    if ((addResult as any)._seen?.has(key)) return
    ;(addResult as any)._seen = (addResult as any)._seen || new Set()
    ;(addResult as any)._seen.add(key)
    results.push(p)
    onResult?.(p) // stream to UI immediately
  }

  // Build tasks: RSS fetch -> detail fetch, or List fetch -> detail fetch
  const listTasks: Array<() => Promise<void>> = []

  for (const t of targets) {
    // RSS first (fast path)
    const rssUrls = t.rssUrls ? t.rssUrls(city, state) : []
    for (const rssUrl of rssUrls) {
      listTasks.push(async () => {
        const xml = await fetchHtml(rssUrl)
        const { detailUrls } = t.parseList(xml, rssUrl)
        for (const du of detailUrls || []) discoveredDetailUrls.add(du)
      })
    }

    // Normal list pages
    const listUrls = t.buildSearchUrls(city, state)
    for (const listUrl of listUrls) {
      listTasks.push(async () => {
        const html = await fetchHtml(listUrl)
        const parsed = t.parseList(html, listUrl)
        for (const du of parsed.detailUrls || []) discoveredDetailUrls.add(du)
        for (const p of parsed.properties || []) addResult(p)
      })
    }
  }

  // Run list tasks in parallel
  await Promise.all(listTasks.map((task) => limit(task)))

  // Fetch & parse details in parallel
  const detailTasks: Array<() => Promise<void>> = []
  for (const du of discoveredDetailUrls) {
    // Find the right adapter by hostname
    const hostname = new URL(du).hostname
    const adapter = targets.find((t) =>
      hostname.includes('craigslist')
        ? t.name === 'Craigslist'
        : hostname.includes('apartments.com')
        ? t.name === 'Apartments.com'
        : undefined,
    )
    if (!adapter?.parseDetail) continue

    detailTasks.push(async () => {
      const html = await fetchHtml(du)
      const props = adapter.parseDetail!(html, du)
      for (const p of props) addResult(p)
    })
  }

  await Promise.all(detailTasks.map((task) => limit(task)))

  return {
    id,
    query: `${city}, ${state}`,
    results,
    searchedAt: new Date().toISOString(),
    totalFound: results.length,
  }
}

// --- Example usage ---\\

/*

1) Put the scraper in a NestJS service (backend)

Install server deps in the Nest app:

yarn add got cheerio bottleneck p-limit


2) Create a simple service (e.g., scraper.service.ts) and paste server-side scraper there (use got + cheerio, not fetch from the client). Expose it via a controller:

// scraper.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('api/property/search')
export class ScraperController {
  constructor(private readonly scraper: ScraperService) {}

  @Get()
  async search(@Query('city') city: string, @Query('state') state: string) {
    // return streaming later; start with JSON
    return this.scraper.fastSearch(city, state);
  }
}

Keep the cheerio/got code here in the backend. Do not import it in your Expo app!

3) Call it from the Expo app

Replace any direct imports of the scraper with a fetch:

// app/(property)/search.ts (client)
export async function searchProperties(city: string, state: string) {
  const url = `${process.env.EXPO_PUBLIC_API_BASE}/api/search?city=${city}&state=${state}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json();
}


Add EXPO_PUBLIC_API_BASE to the .env and app.config.* so it’s available at runtime in the EXPO application.

*/
