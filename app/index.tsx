import { Redirect } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import useAuthStore from "@/store/authStore";

export default function Index() {
  const { user, role, initializeAuthListener, isLoading } = useAuthStore();

  useEffect(() => {
    initializeAuthListener();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If no user, redirect to home
  if (!user) {
    return <Redirect href="/home" />;
  }

  // Redirect based on role
  return role === "teacher"
    ? <Redirect href="/(tabs)/teacherdashboard" />
    : <Redirect href="/(tabs)/studentdashboard" />;
}