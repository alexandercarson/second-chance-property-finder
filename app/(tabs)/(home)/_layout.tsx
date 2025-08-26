import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Second Chance Housing Finder",
          headerStyle: {
            backgroundColor: "#1E40AF",
          },
          headerTintColor: "#FFF",
          headerTitleStyle: {
            fontWeight: "700",
          },
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Property Details",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
