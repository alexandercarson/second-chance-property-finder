import { useProperties } from "@/hooks/property-store";
import { Stack } from "expo-router";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  XCircle,
} from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ApplicationsScreen() {
  const { applications, allProperties, removeApplication, updateApplication } =
    useProperties();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Clock size={20} color="#6B7280" />;
      case "submitted":
        return <AlertCircle size={20} color="#F59E0B" />;
      case "under-review":
        return <AlertCircle size={20} color="#3B82F6" />;
      case "approved":
        return <CheckCircle size={20} color="#10B981" />;
      case "denied":
        return <XCircle size={20} color="#EF4444" />;
      default:
        return <Clock size={20} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "#6B7280";
      case "submitted":
        return "#F59E0B";
      case "under-review":
        return "#3B82F6";
      case "approved":
        return "#10B981";
      case "denied":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Applications",
          headerStyle: {
            backgroundColor: "#1E40AF",
          },
          headerTintColor: "#FFF",
          headerTitleStyle: {
            fontWeight: "700",
          },
        }}
      />

      <ScrollView style={styles.container}>
        {applications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileText size={48} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No applications yet</Text>
            <Text style={styles.emptyText}>
              Your rental applications will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.applicationsList}>
            {applications
              .filter((app) => app.status !== "deleted") // 👈 exclude deleted apps
              .map((app) => {
                const property = allProperties.find(
                  (p) => p.id === app.propertyId
                );
                if (!property) return null;

                return (
                  <TouchableOpacity key={app.id} style={styles.applicationCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.statusBadge}>
                        {getStatusIcon(app.status)}
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(app.status) },
                          ]}
                        >
                          {formatStatus(app.status)}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.propertyTitle}>{property.title}</Text>
                    <Text style={styles.propertyAddress}>
                      {property.address}, {property.city}, {property.state}
                    </Text>

                    <View style={styles.cardFooter}>
                      <Text style={styles.priceText}>${property.price}/mo</Text>
                      {app.submittedAt && (
                        <Text style={styles.dateText}>
                          Submitted{" "}
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </Text>
                      )}
                    </View>

                    {app.status === "draft" && (
                      <TouchableOpacity
                        style={styles.completeButton}
                        onPress={() => {
                          updateApplication(app.id, {
                            status: "submitted",
                          });
                        }}
                      >
                        <Text style={styles.completeButtonText}>
                          Complete Application
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => {
                        removeApplication(app.id);
                      }}
                    >
                      <Text style={styles.completeButtonText}>
                        Remove Application
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
  applicationsList: {
    padding: 16,
    gap: 12,
  },
  applicationCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
  },
  dateText: {
    fontSize: 12,
    color: "#6B7280",
  },
  completeButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#1E40AF",
    alignItems: "center",
  },
  removeButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#CB2F0CFF",
    alignItems: "center",
  },
  completeButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
