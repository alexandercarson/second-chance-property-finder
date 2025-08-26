import { mockProperties } from "@/mocks/properties";
import { propertyScraperService } from "@/service/property-scraper";
import {
  Application,
  Property,
  PropertyFilter,
  SavedProperty,
  ScrapedProperty,
  SearchResult,
} from "@/types/property";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import "react-native-get-random-values"; // required for uuid on RN
import { v4 as uuidv4 } from "uuid";

export const [PropertyContext, useProperties] = createContextHook(() => {
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [scrapedProperties, setScrapedProperties] = useState<ScrapedProperty[]>(
    []
  );
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filters, setFilters] = useState<PropertyFilter>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadSavedData();
    loadScrapedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const [saved, apps] = await Promise.all([
        AsyncStorage.getItem("savedProperties"),
        AsyncStorage.getItem("applications"),
      ]);

      if (saved) setSavedProperties(JSON.parse(saved));
      if (apps) setApplications(JSON.parse(apps));
    } catch (error) {
      console.error("Error loading saved data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadScrapedData = async () => {
    try {
      const [scraped, searches] = await Promise.all([
        AsyncStorage.getItem("scrapedProperties"),
        AsyncStorage.getItem("searchResults"),
      ]);

      if (scraped) setScrapedProperties(JSON.parse(scraped));
      if (searches) setSearchResults(JSON.parse(searches));
    } catch (error) {
      console.error("Error loading scraped data:", error);
    }
  };

  const saveProperty = async (propertyId: string) => {
    const newSaved: SavedProperty = {
      propertyId,
      savedAt: new Date().toISOString(),
    };

    const updated = [
      ...savedProperties.filter((s) => s.propertyId !== propertyId),
      newSaved,
    ];
    setSavedProperties(updated);
    await AsyncStorage.setItem("savedProperties", JSON.stringify(updated));
  };

  const unsaveProperty = async (propertyId: string) => {
    const updated = savedProperties.filter((s) => s.propertyId !== propertyId);
    setSavedProperties(updated);
    await AsyncStorage.setItem("savedProperties", JSON.stringify(updated));
  };

  const isPropertySaved = (propertyId: string) => {
    return savedProperties.some((s) => s.propertyId === propertyId);
  };

  const convertScrapedToProperty = (scraped: ScrapedProperty): Property => {
    const guaranteeTypes = scraped.guaranteeKeywords
      .map((keyword) => {
        // if (keyword.toLowerCase().includes("liberty")) return "liberty";
        // if (keyword.toLowerCase().includes("guarantor")) return "theguarantors";
        if (keyword.toLowerCase().includes("rhino")) return "rhino";
        if (keyword.toLowerCase().includes("insurent")) return "insurent";
        return "direct";
      })
      .filter((type, index, arr) => arr.indexOf(type) === index) as any[];

    return {
      id: `scraped-${scraped.source}-${Date.parse(scraped.scrapedAt)}`,
      title: scraped.title,
      address: scraped.address,
      city: scraped.city,
      state: scraped.state,
      zipCode: "",
      price: scraped.price,
      bedrooms: scraped.bedrooms,
      bathrooms: scraped.bathrooms,
      sqft: scraped.sqft || 0,
      images: scraped.images,
      acceptsGuarantee: true,
      guaranteeTypes,
      availableDate: new Date().toISOString().split("T")[0],
      description: scraped.description,
      amenities: [],
      petPolicy: "Contact for details",
      landlordName: scraped.source,
      applicationFee: 0,
      securityDeposit: scraped.price,
      creditScoreFlexible: true,
    };
  };

  const allProperties = useMemo(() => {
    const convertedScraped = scrapedProperties.map(convertScrapedToProperty);
    return [...properties, ...convertedScraped];
  }, [properties, scrapedProperties]);

  const filteredProperties = useMemo(() => {
    return allProperties.filter((property) => {
      if (filters.maxPrice && property.price > filters.maxPrice) return false;
      if (filters.minBedrooms && property.bedrooms < filters.minBedrooms)
        return false;
      if (filters.minBathrooms && property.bathrooms < filters.minBathrooms)
        return false;
      if (
        filters.creditScoreFlexible !== undefined &&
        property.creditScoreFlexible !== filters.creditScoreFlexible
      )
        return false;
      if (
        filters.city &&
        property.city.toLowerCase() !== filters.city.toLowerCase()
      )
        return false;
      if (filters.guaranteeTypes && filters.guaranteeTypes.length > 0) {
        const hasMatchingType = filters.guaranteeTypes.some((type) =>
          property.guaranteeTypes.includes(type)
        );
        if (!hasMatchingType) return false;
      }
      return true;
    });
  }, [allProperties, filters]);

  const getSavedPropertiesList = () => {
    return allProperties.filter((p) => isPropertySaved(p.id));
  };

  const searchWebProperties = async (city: string, state: string) => {
    setIsSearching(true);
    try {
      console.log(`Starting web search for properties in ${city}, ${state}`);
      const results = await propertyScraperService.searchForProperties(
        city,
        state
      );

      if (results.length > 0) {
        const latestResult = results[0];
        const updatedSearchResults = [...searchResults, latestResult];
        const updatedScrapedProperties = [
          ...scrapedProperties,
          ...latestResult.results,
        ];

        setSearchResults(updatedSearchResults);
        setScrapedProperties(updatedScrapedProperties);

        // Save to AsyncStorage
        await Promise.all([
          AsyncStorage.setItem(
            "searchResults",
            JSON.stringify(updatedSearchResults)
          ),
          AsyncStorage.setItem(
            "scrapedProperties",
            JSON.stringify(updatedScrapedProperties)
          ),
        ]);

        console.log(
          `Web search completed. Found ${latestResult.totalFound} new properties`
        );
      }
    } catch (error) {
      console.error("Error searching web properties:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const startPeriodicSearch = async (
    city: string,
    state: string,
    intervalHours: number = 6
  ) => {
    try {
      await propertyScraperService.startPeriodicSearch(
        city,
        state,
        intervalHours
      );
      console.log(`Started periodic search for ${city}, ${state}`);
    } catch (error) {
      console.error("Error starting periodic search:", error);
    }
  };

  const getSearchHistory = () => {
    return searchResults.sort(
      (a, b) =>
        new Date(b.searchedAt).getTime() - new Date(a.searchedAt).getTime()
    );
  };

  const startApplication = async (propertyId: string) => {
    setApps((prev) => {
      // check if there's already an active app for this property
      const existing = prev.find(
        (a) => a.propertyId === propertyId && a.status !== "deleted"
      );
      if (existing) {
        return prev; // nothing new added
      }
      const id =
        typeof crypto?.randomUUID === "function"
          ? crypto.randomUUID()
          : uuidv4();

      const newApp: Application = {
        id,
        propertyId,
        status: "draft",
      };

      return [...prev, newApp];
    });

    return propertyId; // id === propertyId
  };

  const updateApplication = async (
    appId: string,
    patch: Partial<Application>
  ) => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, ...patch } : a))
    );
    return appId;
  };

  const removeApplication = async (appId: string) => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: "deleted" } : a))
    );
    return appId;
  };

  // Functional setter that also persists (prevents stale state issues)
  const setApps = (updater: (prev: Application[]) => Application[]) => {
    setApplications((prev) => {
      const next = updater(prev);
      // fire-and-forget; optionally wrap with try/catch if you want
      persistApps(next);
      return next;
    });
  };

  // Single place to persist
  const persistApps = (apps: Application[]) =>
    AsyncStorage.setItem("applications", JSON.stringify(apps));

  return {
    properties: filteredProperties,
    allProperties,
    scrapedProperties,
    searchResults,
    savedProperties,
    applications,
    filters,
    setFilters,
    saveProperty,
    unsaveProperty,
    isPropertySaved,
    getSavedPropertiesList,
    startApplication,
    removeApplication,
    updateApplication,
    searchWebProperties,
    startPeriodicSearch,
    getSearchHistory,
    isLoading,
    isSearching,
  };
});
