import { PropertyContext } from "@/hooks/property-store";
import { Tabs } from "expo-router";
import { FileText, Heart, Home, Search, User } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  return (
    <PropertyContext>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#1E40AF",
          tabBarInactiveTintColor: "#9CA3AF",
          headerShown: false,
          tabBarStyle: {
            paddingTop: 8,
            paddingBottom: 8,
            height: 60,
          },
          animation: "fade",
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: "Browse",
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Web Search",
            tabBarIcon: ({ color }) => <Search size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            title: "Saved",
            tabBarIcon: ({ color }) => <Heart size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="applications"
          options={{
            title: "Applications",
            tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="+not-found"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </PropertyContext>
  );
}
