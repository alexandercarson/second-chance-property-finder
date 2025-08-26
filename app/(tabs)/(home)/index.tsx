import { FilterBar } from "@/components/FilterBar";
import { PropertyCard } from "@/components/PropertyCard";
import { useProperties } from "@/hooks/property-store";
import { router } from "expo-router";
import { Globe, X } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const {
    properties,
    scrapedProperties,
    filters,
    setFilters,
    saveProperty,
    unsaveProperty,
    isPropertySaved,
    isLoading,
  } = useProperties();

  const [showWebFoundBanner, setShowWebFoundBanner] = React.useState(true);

  const recentWebProperties = scrapedProperties.filter(
    (prop) =>
      new Date(prop.scrapedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
  ).length;

  const handlePropertyPress = (propertyId: string) => {
    router.push(`/(home)/${propertyId}`);
  };

  const handleSaveToggle = (propertyId: string) => {
    if (isPropertySaved(propertyId)) {
      unsaveProperty(propertyId);
    } else {
      saveProperty(propertyId);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {recentWebProperties > 0 && showWebFoundBanner && (
        <View style={styles.webFoundBanner}>
          <View style={styles.bannerContent}>
            <Globe size={20} color="#7C3AED" />
            <Text style={styles.bannerText}>
              {recentWebProperties} new properties found via web search!
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowWebFoundBanner(false)}
            style={styles.bannerClose}
          >
            <X size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={properties.length}
      />

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => handlePropertyPress(item.id)}
            onSave={() => handleSaveToggle(item.id)}
            isSaved={isPropertySaved(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No properties found</Text>
            <Text style={styles.emptyText}>Try adjusting your filters</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
  },
  webFoundBanner: {
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  bannerText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  bannerClose: {
    padding: 4,
  },
});
