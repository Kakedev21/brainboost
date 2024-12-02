import { Tabs } from 'expo-router';
import React from 'react';
export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' } // Hide the tab bar
      }}
    >
      <Tabs.Screen
        name="studentdashboard"
        options={{
          title: 'studentdashboard',
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="teacherdashboard"
        options={{
          title: 'teacherdashboard',
          headerShown: false
        }}
      />
    </Tabs>
  );
}
