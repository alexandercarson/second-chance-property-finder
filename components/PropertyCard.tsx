import { guaranteeProviders } from "@/mocks/properties";
import { Property } from "@/types/property";
import {
  Bath,
  Bed,
  Globe,
  Heart,
  MapPin,
  Shield,
  Square,
} from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
  onSave: () => void;
  isSaved: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onPress,
  onSave,
  isSaved,
}) => {
  const guaranteeCount = property.guaranteeTypes.length;
  const isScrapedProperty = property.id.startsWith("scraped-");

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: property.images[0] }} style={styles.image} />
        <TouchableOpacity
          style={styles.saveButton}
          onPress={(e) => {
            e.stopPropagation();
            onSave();
          }}
        >
          <Heart
            size={22}
            color={isSaved ? "#EF4444" : "#FFF"}
            fill={isSaved ? "#EF4444" : "transparent"}
          />
        </TouchableOpacity>
        {property.acceptsGuarantee && (
          <View style={styles.guaranteeBadge}>
            <Shield size={14} color="#FFF" />
            <Text style={styles.guaranteeText}>Second Chance</Text>
          </View>
        )}
        {isScrapedProperty && (
          <View style={styles.webFoundBadge}>
            <Globe size={12} color="#FFF" />
            <Text style={styles.webFoundText}>Web Found</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ${property.price.toLocaleString()}/mo
          </Text>
          {property.creditScoreFlexible && (
            <View style={styles.flexibleBadge}>
              <Text style={styles.flexibleText}>Flexible Credit</Text>
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>

        <View style={styles.locationRow}>
          <MapPin size={14} color="#6B7280" />
          <Text style={styles.location}>
            {property.city}, {property.state}
          </Text>
        </View>

        <View style={styles.specs}>
          <View style={styles.spec}>
            <Bed size={16} color="#6B7280" />
            <Text style={styles.specText}>
              {property.bedrooms === 0 ? "Studio" : `${property.bedrooms} bed`}
            </Text>
          </View>
          <View style={styles.spec}>
            <Bath size={16} color="#6B7280" />
            <Text style={styles.specText}>{property.bathrooms} bath</Text>
          </View>
          <View style={styles.spec}>
            <Square size={16} color="#6B7280" />
            <Text style={styles.specText}>{property.sqft} sqft</Text>
          </View>
        </View>

        {guaranteeCount > 0 && (
          <View style={styles.guaranteeProviders}>
            <Text style={styles.guaranteeLabel}>Accepts:</Text>
            <View style={styles.providerBadges}>
              {property.guaranteeTypes.slice(0, 2).map((type) => {
                const provider = guaranteeProviders.find((p) => p.id === type);
                return (
                  <View
                    key={type}
                    style={[
                      styles.providerBadge,
                      {
                        backgroundColor: provider?.color
                          ? provider.color + "25"
                          : "#00000025",
                      },
                    ]}
                  >
                    <Text
                      style={[styles.providerName, { color: provider?.color }]}
                    >
                      {provider?.name.split(" ")[0]}
                    </Text>
                  </View>
                );
              })}
              {guaranteeCount > 2 && (
                <Text style={styles.moreProviders}>
                  +{guaranteeCount - 2} more
                </Text>
              )}
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  saveButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  guaranteeBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#10B981",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  guaranteeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  webFoundBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "#7C3AED",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  webFoundText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E40AF",
  },
  flexibleBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  flexibleText: {
    fontSize: 11,
    color: "#92400E",
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: "#6B7280",
  },
  specs: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  spec: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  specText: {
    fontSize: 14,
    color: "#6B7280",
  },
  guaranteeProviders: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  guaranteeLabel: {
    fontSize: 12,
    color: "#333436FF",
    fontWeight: "500",
  },
  providerBadges: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  providerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  providerName: {
    fontSize: 11,
    fontWeight: "600",
  },
  moreProviders: {
    fontSize: 11,
    color: "#6B7280",
    fontStyle: "italic",
  },
});
