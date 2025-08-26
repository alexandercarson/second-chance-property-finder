import { PropertyCard } from "@/components/PropertyCard";
import { useProperties } from "@/hooks/property-store";
import { router, Stack } from "expo-router";
import { Heart } from "lucide-react-native";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function SavedScreen() {
  const {
    getSavedPropertiesList,
    saveProperty,
    unsaveProperty,
    isPropertySaved,
  } = useProperties();
  const savedProperties = getSavedPropertiesList();

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

  return (
    <>
      <Stack.Screen
        options={{
          title: "Saved Properties",
          headerStyle: {
            backgroundColor: "#1E40AF",
          },
          headerTintColor: "#FFF",
          headerTitleStyle: {
            fontWeight: "700",
          },
        }}
      />

      <View style={styles.container}>
        <FlatList
          data={savedProperties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={() => handlePropertyPress(item.id)}
              onSave={() => handleSaveToggle(item.id)}
              isSaved={true}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Heart size={48} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>No saved properties</Text>
              <Text style={styles.emptyText}>
                Properties you save will appear here
              </Text>
            </View>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
  },
});
