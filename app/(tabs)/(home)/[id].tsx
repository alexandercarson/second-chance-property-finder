import { useProperties } from "@/hooks/property-store";
import { guaranteeProviders } from "@/mocks/properties";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  Bath,
  Bed,
  Calendar,
  Check,
  Heart,
  MapPin,
  Phone,
  Shield,
  Square,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams();
  const {
    allProperties,
    isPropertySaved,
    saveProperty,
    unsaveProperty,
    startApplication,
  } = useProperties();

  const [selectedImage, setSelectedImage] = useState(0);

  const property = allProperties.find((p) => p.id === id);

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Property not found</Text>
      </View>
    );
  }

  const isSaved = isPropertySaved(property.id);

  const handleSave = () => {
    if (isSaved) {
      unsaveProperty(property.id);
    } else {
      saveProperty(property.id);
    }
  };

  const handleApply = async () => {
    const appId = await startApplication(property.id);
    Alert.alert(
      "Application Started",
      "Your application has been started. Complete your profile to submit.",
      [{ text: "OK" }]
    );
  };

  const handleContact = () => {
    Alert.alert(
      "Contact Landlord",
      `Would you like to contact ${property.landlordName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call", onPress: () => console.log("Calling...") },
        { text: "Email", onPress: () => console.log("Emailing...") },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={{ marginRight: 16 }}>
              <Heart
                size={24}
                color={isSaved ? "#EF4444" : "#111827"}
                fill={isSaved ? "#EF4444" : "transparent"}
              />
            </TouchableOpacity>
          ),
          animation: "fade",
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setSelectedImage(index);
          }}
        >
          {property.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.image} />
          ))}
        </ScrollView>

        <View style={styles.imageIndicators}>
          {property.images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === selectedImage && styles.indicatorActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.price}>
              ${property.price.toLocaleString()}/mo
            </Text>
            {property.acceptsGuarantee && (
              <View style={styles.guaranteeBadge}>
                <Shield size={16} color="#FFF" />
                <Text style={styles.guaranteeText}>Second Chance</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{property.title}</Text>

          <View style={styles.locationRow}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.location}>
              {property.address}, {property.city}, {property.state}{" "}
              {property.zipCode}
            </Text>
          </View>

          <View style={styles.specs}>
            <View style={styles.specItem}>
              <Bed size={20} color="#6B7280" />
              <Text style={styles.specText}>
                {property.bedrooms === 0
                  ? "Studio"
                  : `${property.bedrooms} Bedrooms`}
              </Text>
            </View>
            <View style={styles.specItem}>
              <Bath size={20} color="#6B7280" />
              <Text style={styles.specText}>
                {property.bathrooms} Bathrooms
              </Text>
            </View>
            <View style={styles.specItem}>
              <Square size={20} color="#6B7280" />
              <Text style={styles.specText}>{property.sqft} sqft</Text>
            </View>
            <View style={styles.specItem}>
              <Calendar size={20} color="#6B7280" />
              <Text style={styles.specText}>
                Available{" "}
                {new Date(property.availableDate).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>

          {property.guaranteeTypes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Accepted Guarantee Programs
              </Text>
              <View style={styles.guaranteeList}>
                {property.guaranteeTypes.map((type) => {
                  const provider = guaranteeProviders.find(
                    (p) => p.id === type
                  );
                  if (!provider) return null;

                  return (
                    <View key={type} style={styles.guaranteeItem}>
                      <View
                        style={[
                          styles.guaranteeIcon,
                          { backgroundColor: provider.color + "20" },
                        ]}
                      >
                        <Shield size={20} color={provider.color} />
                      </View>
                      <View style={styles.guaranteeInfo}>
                        <Text style={styles.guaranteeName}>
                          {provider.name}
                        </Text>
                        <Text style={styles.guaranteeDesc}>
                          {provider.description}
                        </Text>
                        <Text style={styles.guaranteeCost}>
                          {provider.cost}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenities}>
              {property.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Check size={16} color="#10B981" />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fees & Requirements</Text>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Application Fee:</Text>
              <Text style={styles.feeValue}>${property.applicationFee}</Text>
            </View>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Security Deposit:</Text>
              <Text style={styles.feeValue}>${property.securityDeposit}</Text>
            </View>
            {property.minimumIncome && (
              <View style={styles.feeItem}>
                <Text style={styles.feeLabel}>Minimum Income:</Text>
                <Text style={styles.feeValue}>
                  ${property.minimumIncome}/mo
                </Text>
              </View>
            )}
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Credit Requirements:</Text>
              <Text
                style={[
                  styles.feeValue,
                  property.creditScoreFlexible && styles.flexibleText,
                ]}
              >
                {property.creditScoreFlexible ? "Flexible" : "Standard"}
              </Text>
            </View>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Pet Policy:</Text>
              <Text style={styles.feeValue}>{property.petPolicy}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Landlord Information</Text>
            <Text style={styles.landlordName}>{property.landlordName}</Text>
            {property.propertyManagement && (
              <Text style={styles.managementName}>
                Managed by {property.propertyManagement}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
          <Phone size={20} color="#1E40AF" />
          <Text style={styles.contactText}>Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
  },
  image: {
    width: width,
    height: 300,
  },
  imageIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  indicatorActive: {
    backgroundColor: "#1E40AF",
    width: 24,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1E40AF",
  },
  guaranteeBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  guaranteeText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  location: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  specs: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  specText: {
    fontSize: 15,
    color: "#374151",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  guaranteeList: {
    gap: 12,
  },
  guaranteeItem: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  guaranteeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  guaranteeInfo: {
    flex: 1,
  },
  guaranteeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  guaranteeDesc: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  guaranteeCost: {
    fontSize: 14,
    color: "#1E40AF",
    fontWeight: "500",
  },
  amenities: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  amenityText: {
    fontSize: 14,
    color: "#065F46",
  },
  feeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  feeLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  feeValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  flexibleText: {
    color: "#10B981",
  },
  landlordName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  managementName: {
    fontSize: 14,
    color: "#6B7280",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1E40AF",
  },
  contactText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
  },
  applyButton: {
    flex: 2,
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
