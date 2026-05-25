import './global.css';
import React, { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  LibreCaslonText_400Regular,
  LibreCaslonText_700Bold,
} from '@expo-google-fonts/libre-caslon-text';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { RootNavigator } from './src/navigation/RootNavigator';
import { OfflineBanner } from './src/components/common';
import { useNetworkStore } from './src/store/network.store';
import { syncAll } from './src/services/sync.service';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    LibreCaslon: LibreCaslonText_400Regular,
    'LibreCaslon-Bold': LibreCaslonText_700Bold,
    PlusJakartaSans: PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
  });

  // Initialize network listener
  const initNetwork = useNetworkStore((s) => s.init);
  useEffect(() => {
    const unsubscribe = initNetwork();
    return unsubscribe;
  }, []);

  // Sync when coming back online
  const isConnected = useNetworkStore((s) => s.isConnected);
  const wasOffline = useRef(false);
  useEffect(() => {
    if (!isConnected) {
      wasOffline.current = true;
    } else if (wasOffline.current) {
      wasOffline.current = false;
      syncAll();
    }
  }, [isConnected]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <View className="flex-1" onLayout={onLayoutRootView}>
        <NavigationContainer>
          <StatusBar style="dark" />
          <OfflineBanner />
          <RootNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}
