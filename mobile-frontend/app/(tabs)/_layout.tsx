import { Tabs } from 'expo-router';
import React from 'react';
import { View, Platform } from 'react-native';
import twrnc from 'twrnc';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; // <-- INI DIA PENYELAMATNYA

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { usePushNotifications } from '@/src/hooks/usePushNotifications';

export default function TabLayout() {
  const activeTint = '#ffffff';
  const inactiveTint = 'rgba(255, 255, 255, 0.6)';

  // Initialize Push Notifications listener and get token
  usePushNotifications();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#740505',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 85 : 70, 
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="chat-ai"
        options={{
          title: 'Chat AI',
          tabBarIcon: ({ focused }) => (
            <LinearGradient
              colors={['#f8fafc', '#e2e8f0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={twrnc`h-10 w-10 items-center justify-center rounded-full shadow-sm`}>
              <Ionicons 
                name={focused ? "sparkles" : "sparkles-outline"} 
                size={20} 
                color="#0f172a" 
              />
            </LinearGradient>
          ),
        }}
      />

      <Tabs.Screen
        name="my-car"
        options={{
          title: 'MyCar',
          tabBarIcon: () => (
            <View style={twrnc`items-center justify-center`}>
              <View style={twrnc`absolute -top-8 h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg`}>
                <IconSymbol size={32} name="car.fill" color="#dc2626" />
              </View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="service-history"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="clock.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="person.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="spareparts"
        options={{
          href: null,
        }}
      />
      
      <Tabs.Screen name="produk" options={{ href: null }} />
      <Tabs.Screen name="test-drive" options={{ href: null }} />
      <Tabs.Screen name="trade-in" options={{ href: null }} />
      <Tabs.Screen name="emergency" options={{ href: null }} />
      <Tabs.Screen name="more" options={{ href: null }} />
    </Tabs>
  );
}