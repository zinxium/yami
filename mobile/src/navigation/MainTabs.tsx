import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeStack } from './HomeStack';
import { LoansStack } from './LoansStack';
import { PayScreen } from '../screens/payments/PayScreen';
import { ProfileScreen } from '../screens/auth/ProfileScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  HomeTab:    { active: 'home',          inactive: 'home-outline' },
  LoansTab:   { active: 'document-text', inactive: 'document-text-outline' },
  PayTab:     { active: 'card',          inactive: 'card-outline' },
  ProfileTab: { active: 'person',        inactive: 'person-outline' },
};

const TAB_LABELS: Record<keyof MainTabParamList, string> = {
  HomeTab: 'Home',
  LoansTab: 'Loans',
  PayTab: 'Pay',
  ProfileTab: 'Profile',
};

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, size }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={22}
              color={focused ? '#800020' : '#CFCFCF'}
            />
          );
        },
        tabBarLabel: TAB_LABELS[route.name],
        tabBarActiveTintColor: '#800020',
        tabBarInactiveTintColor: '#CFCFCF',
        tabBarStyle: {
          backgroundColor: '#FAF7F2',
          borderTopColor: '#E8E4DC',
          borderTopWidth: 0.5,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} />
      <Tab.Screen name="LoansTab" component={LoansStack} />
      <Tab.Screen name="PayTab" component={PayScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
