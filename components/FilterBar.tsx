import { guaranteeProviders } from "@/mocks/properties";
import { GuaranteeType, PropertyFilter } from "@/types/property";
import { DollarSign, Filter, MapPin, Shield, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FilterBarProps {
  filters: PropertyFilter;
  onFiltersChange: (filters: PropertyFilter) => void;
  resultCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  resultCount,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [tempFilters, setTempFilters] = useState<PropertyFilter>(filters);

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== ""
  ).length;

  const applyFilters = () => {
    onFiltersChange(tempFilters);
    setShowModal(false);
  };

  const clearFilters = () => {
    setTempFilters({});
    onFiltersChange({});
    setShowModal(false);
  };

  const toggleGuaranteeType = (type: GuaranteeType) => {
    const current = tempFilters.guaranteeTypes || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setTempFilters({ ...tempFilters, guaranteeTypes: updated });
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowModal(true)}
        >
          <Filter size={18} color="#1E40AF" />
          <Text style={styles.filterText}>Filters</Text>
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.resultCount}>{resultCount} properties</Text>
      </View>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.filterOptions}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Max Monthly Rent</Text>
                <View style={styles.inputRow}>
                  <DollarSign size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter max rent"
                    keyboardType="numeric"
                    value={tempFilters.maxPrice?.toString() || ""}
                    onChangeText={(text) =>
                      setTempFilters({
                        ...tempFilters,
                        maxPrice: text ? parseInt(text) : undefined,
                      })
                    }
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bedrooms</Text>
                <View style={styles.buttonRow}>
                  {["Any", "Studio", "1+", "2+", "3+"].map((option, index) => {
                    const value =
                      index === 0 ? undefined : index === 1 ? 0 : index - 1;
                    const isSelected = value === tempFilters.minBedrooms;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.optionButton,
                          isSelected && styles.optionButtonActive,
                        ]}
                        onPress={() =>
                          setTempFilters({ ...tempFilters, minBedrooms: value })
                        }
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextActive,
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Guarantee Programs</Text>
                <View style={styles.guaranteeGrid}>
                  {guaranteeProviders.map((provider) => {
                    const isSelected = tempFilters.guaranteeTypes?.includes(
                      provider.id
                    );
                    return (
                      <TouchableOpacity
                        key={provider.id}
                        style={[
                          styles.guaranteeOption,
                          isSelected && {
                            backgroundColor: provider.color + "20",
                            borderColor: provider.color,
                          },
                        ]}
                        onPress={() => toggleGuaranteeType(provider.id)}
                      >
                        <Shield
                          size={16}
                          color={isSelected ? provider.color : "#6B7280"}
                        />
                        <Text
                          style={[
                            styles.guaranteeName,
                            isSelected && { color: provider.color },
                          ]}
                        >
                          {provider.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Credit Requirements</Text>
                <TouchableOpacity
                  style={[
                    styles.checkOption,
                    tempFilters.creditScoreFlexible && styles.checkOptionActive,
                  ]}
                  onPress={() =>
                    setTempFilters({
                      ...tempFilters,
                      creditScoreFlexible: !tempFilters.creditScoreFlexible,
                    })
                  }
                >
                  <View
                    style={[
                      styles.checkbox,
                      tempFilters.creditScoreFlexible && styles.checkboxActive,
                    ]}
                  >
                    {tempFilters.creditScoreFlexible && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.checkLabel}>
                    Only show flexible credit properties
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>City</Text>
                <View style={styles.inputRow}>
                  <MapPin size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter city name"
                    value={tempFilters.city || ""}
                    onChangeText={(text) =>
                      setTempFilters({ ...tempFilters, city: text })
                    }
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <Text style={styles.applyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E40AF",
  },
  badge: {
    backgroundColor: "#1D9208FF",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "600",
  },
  resultCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  filterOptions: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: "#111827",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  optionButtonActive: {
    backgroundColor: "#1E40AF",
    borderColor: "#1E40AF",
  },
  optionText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  optionTextActive: {
    color: "#FFF",
  },
  guaranteeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  guaranteeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  guaranteeName: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  checkOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  checkOptionActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#1E40AF",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: "#1E40AF",
    borderColor: "#1E40AF",
  },
  checkmark: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  checkLabel: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  clearText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#1E40AF",
    alignItems: "center",
  },
  applyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
});
