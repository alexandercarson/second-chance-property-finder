export interface Property {
  id: string
  title: string
  address: string
  city: string
  state: string
  zipCode: string
  price: number
  bedrooms: number
  bathrooms: number
  sqft: number
  images: string[]
  acceptsGuarantee: boolean
  guaranteeTypes: GuaranteeType[]
  availableDate: string
  description: string
  amenities: string[]
  petPolicy: string
  landlordName: string
  propertyManagement?: string
  applicationFee: number
  securityDeposit: number
  minimumIncome?: number
  creditScoreFlexible: boolean
}

export type GuaranteeType =
  // | 'liberty'
  // | 'theguarantors'
  'rhino' | 'insurent' | 'direct'

export interface GuaranteeProvider {
  id: GuaranteeType
  name: string
  description: string
  coverage: string
  cost: string
  color: string
}

export interface PropertyFilter {
  maxPrice?: number
  minBedrooms?: number
  minBathrooms?: number
  guaranteeTypes?: GuaranteeType[]
  creditScoreFlexible?: boolean
  city?: string
  moveInDate?: string
}

export interface SavedProperty {
  propertyId: string
  savedAt: string
  notes?: string
}

export interface Application {
  id: string
  propertyId: string
  status:
    | 'draft'
    | 'submitted'
    | 'under-review'
    | 'approved'
    | 'denied'
    | 'deleted'
  submittedAt?: string
  guaranteeType?: GuaranteeType
}

export interface ScrapedProperty {
  source: string
  sourceUrl: string
  title: string
  address: string
  city: string
  state: string
  price: number
  bedrooms: number
  bathrooms: number
  sqft?: number
  images: string[]
  description: string
  contactInfo: string
  scrapedAt: string
  guaranteeKeywords: string[]
}

export interface SearchResult {
  id: string
  query: string
  results: ScrapedProperty[]
  searchedAt: string
  totalFound: number
}
