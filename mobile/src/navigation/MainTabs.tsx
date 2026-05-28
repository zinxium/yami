import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { HomeStack } from './HomeStack';
import { LoansStack } from './LoansStack';
import { PayScreen } from '../screens/payments/PayScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { ProfileScreen } from '../screens/auth/ProfileScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  HomeTab:      { active: 'home',           inactive: 'home-outline' },
  LoansTab:     { active: 'document-text',  inactive: 'document-text-outline' },
  PayTab:       { active: 'card',           inactive: 'card-outline' },
  AnalyticsTab: { active: 'stats-chart',    inactive: 'stats-chart-outline' },
  ProfileTab:   { active: 'person',         inactive: 'person-outline' },
};

export function MainTabs() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const TAB_LABELS: Record<keyof MainTabParamList, string> = {
    HomeTab: t('tabs.home'),
    LoansTab: t('tabs.loans'),
    PayTab: t('tabs.pay'),
    AnalyticsTab: t('tabs.analytics'),
    ProfileTab: t('tabs.profile'),
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={22}
              color={focused ? colors.primary : colors.dustGrey}
            />
          );
        },
        tabBarLabel: TAB_LABELS[route.name],
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.dustGrey,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 64 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
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
      <Tab.Screen name="AnalyticsTab" component={AnalyticsScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
