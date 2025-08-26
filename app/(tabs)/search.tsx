import { useProperties } from "@/hooks/property-store";
import { Stack } from "expo-router";
import { Clock, Globe, MapPin, Search, Zap } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function WebSearchScreen() {
  const {
    searchWebProperties,
    startPeriodicSearch,
    getSearchHistory,
    isSearching,
    scrapedProperties,
  } = useProperties();

  const [city, setCity] = useState("Austin");
  const [state, setState] = useState("TX");
  const [periodicEnabled, setPeriodicEnabled] = useState(false);
  const [intervalHours, setIntervalHours] = useState(6);

  const searchHistory = getSearchHistory();
  const recentScrapedCount = scrapedProperties.filter(
    (prop) =>
      new Date(prop.scrapedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
  ).length;

  const handleSearch = async () => {
    if (!city.trim() || !state.trim()) {
      Alert.alert("Error", "Please enter both city and state");
      return;
    }

    try {
      await searchWebProperties(city.trim(), state.trim());
      Alert.alert(
        "Search Complete",
        "Web search completed! Check the Home tab to see new properties."
      );
    } catch (error) {
      Alert.alert("Error", "Failed to search properties. Please try again.");
    }
  };

  const handlePeriodicToggle = async () => {
    if (!city.trim() || !state.trim()) {
      Alert.alert("Error", "Please enter both city and state");
      return;
    }

    try {
      if (!periodicEnabled) {
        await startPeriodicSearch(city.trim(), state.trim(), intervalHours);
        setPeriodicEnabled(true);
        Alert.alert(
          "Periodic Search Started",
          `Now searching for properties every ${intervalHours} hours in ${city}, ${state}`
        );
      } else {
        setPeriodicEnabled(false);
        Alert.alert(
          "Periodic Search Stopped",
          "Automatic searching has been disabled."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to configure periodic search.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Web Search",
          headerStyle: { backgroundColor: "#1E40AF" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "600" },
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Form */}
        <View style={styles.searchCard}>
          <View style={styles.cardHeader}>
            <Globe size={24} color="#1E40AF" />
            <Text style={styles.cardTitle}>Search the Web</Text>
          </View>

          <Text style={styles.description}>
            Automatically search rental websites for properties that accept
            second chance lease guarantees
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="Austin"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>State</Text>
              <TextInput
                style={styles.input}
                value={state}
                onChangeText={setState}
                placeholder="TX"
                placeholderTextColor="#9CA3AF"
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.searchButton,
              isSearching && styles.searchButtonDisabled,
            ]}
            onPress={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Search size={20} color="#FFFFFF" />
            )}
            <Text style={styles.searchButtonText}>
              {isSearching ? "Searching..." : "Search Now"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Periodic Search */}
        <View style={styles.periodicCard}>
          <View style={styles.cardHeader}>
            <Zap size={24} color="#059669" />
            <Text style={styles.cardTitle}>Automatic Search</Text>
          </View>

          <Text style={styles.description}>
            Enable periodic searching to continuously find new properties
          </Text>

          <View style={styles.periodicControls}>
            <View style={styles.intervalContainer}>
              <Text style={styles.inputLabel}>Search every (hours)</Text>
              <TextInput
                style={styles.intervalInput}
                value={intervalHours.toString()}
                onChangeText={(text) => setIntervalHours(parseInt(text) || 6)}
                keyboardType="numeric"
                placeholder="6"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.periodicButton,
                periodicEnabled
                  ? styles.periodicButtonActive
                  : styles.periodicButtonInactive,
              ]}
              onPress={handlePeriodicToggle}
            >
              <Text
                style={[
                  styles.periodicButtonText,
                  periodicEnabled
                    ? styles.periodicButtonTextActive
                    : styles.periodicButtonTextInactive,
                ]}
              >
                {periodicEnabled ? "Stop Auto Search" : "Start Auto Search"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{scrapedProperties.length}</Text>
              <Text style={styles.statLabel}>Total Found</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{recentScrapedCount}</Text>
              <Text style={styles.statLabel}>Last 24h</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{searchHistory.length}</Text>
              <Text style={styles.statLabel}>Searches</Text>
            </View>
          </View>
        </View>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <View style={styles.historyCard}>
            <View style={styles.cardHeader}>
              <Clock size={24} color="#6B7280" />
              <Text style={styles.cardTitle}>Recent Searches</Text>
            </View>

            {searchHistory.slice(0, 5).map((search) => (
              <View key={search.id} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyLocation}>
                    <MapPin size={16} color="#6B7280" />
                    <Text style={styles.historyQuery}>{search.query}</Text>
                  </View>
                  <Text style={styles.historyDate}>
                    {formatDate(search.searchedAt)}
                  </Text>
                </View>

                <Text style={styles.historyResults}>
                  Found {search.totalFound} properties
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodicCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  searchButton: {
    backgroundColor: "#1E40AF",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  searchButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  periodicControls: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
  },
  intervalContainer: {
    flex: 1,
  },
  intervalInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#FFFFFF",
    textAlign: "center",
  },
  periodicButton: {
    borderRadius: 8,
    padding: 16,
    minWidth: 140,
    alignItems: "center",
  },
  periodicButtonActive: {
    backgroundColor: "#DC2626",
  },
  periodicButtonInactive: {
    backgroundColor: "#059669",
  },
  periodicButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  periodicButtonTextActive: {
    color: "#FFFFFF",
  },
  periodicButtonTextInactive: {
    color: "#FFFFFF",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  historyLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  historyQuery: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  historyDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  historyResults: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "500",
  },
});
