import { Stack } from "expo-router";
import {
  ChevronRight,
  CreditCard,
  FileText,
  HelpCircle,
  LogOut,
  Settings,
  Shield,
  Star,
  User,
} from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const menuItems = [
    {
      icon: Shield,
      title: "Guarantee Programs",
      subtitle: "Manage your guarantee providers",
      color: "#10B981",
    },
    {
      icon: FileText,
      title: "Documents",
      subtitle: "Upload required documents",
      color: "#3B82F6",
    },
    {
      icon: CreditCard,
      title: "Payment Methods",
      subtitle: "Manage payment options",
      color: "#8B5CF6",
    },
    {
      icon: Star,
      title: "Rental History",
      subtitle: "View your rental record",
      color: "#F59E0B",
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      subtitle: "Get assistance",
      color: "#6B7280",
    },
    {
      icon: Settings,
      title: "Settings",
      subtitle: "App preferences",
      color: "#6B7280",
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: "Profile",
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
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <User size={40} color="#FFF" />
          </View>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userEmail}>john.doe@example.com</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Applications</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>2</Text>
              <Text style={styles.statLabel}>Guarantees</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity key={index} style={styles.menuItem}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: item.color + "20" },
                  ]}
                >
                  <Icon size={20} color={item.color} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  profileHeader: {
    backgroundColor: "#FFF",
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1E40AF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E5E7EB",
  },
  menuSection: {
    backgroundColor: "#FFF",
    marginTop: 12,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFF",
    marginTop: 12,
    marginBottom: 24,
    padding: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#EF4444",
  },
});
