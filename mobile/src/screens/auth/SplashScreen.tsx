import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { Logo } from '../../components/common';
import { Colors } from '../../constants/colors';

interface SplashScreenProps {
  onFinish: (isAuthenticated: boolean) => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const { restoreSession, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await restoreSession();
      // Splash visible 2 secondes max
      setTimeout(() => {
        onFinish(useAuthStore.getState().isAuthenticated);
      }, 1500);
    };
    init();
  }, []);

  return (
    <View
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.neutral }}
    >
      {/* Logo */}
      <Logo size="large" style={{ marginBottom: 16 }} />

      <Text
        style={{
          color: Colors.primary,
          fontSize: 28,
          fontWeight: 'bold',
          fontFamily: 'LibreCaslon',
          marginBottom: 8,
        }}
      >
        Ya Mi
      </Text>

      <Text
        style={{
          color: Colors.textSecondary,
          fontSize: 13,
          fontFamily: 'PlusJakartaSans',
          marginBottom: 32,
        }}
      >
        Gestion de prêts personnels
      </Text>

      <ActivityIndicator size="small" color={Colors.primary} />
    </View>
  );
}
