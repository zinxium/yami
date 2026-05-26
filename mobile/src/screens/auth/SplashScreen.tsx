import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth.store';
import { Logo } from '../../components/common';

interface SplashScreenProps {
  onFinish: (isAuthenticated: boolean) => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const { t } = useTranslation();
  const { restoreSession } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await restoreSession();
      setTimeout(() => {
        onFinish(useAuthStore.getState().isAuthenticated);
      }, 1500);
    };
    init();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF7F2' }}>
      <Logo size="large" style={{ marginBottom: 16 }} />
      <Text style={{ color: '#800020', fontSize: 28, fontWeight: 'bold', fontFamily: 'LibreCaslon-Bold', marginBottom: 8 }}>
        Ya Mi
      </Text>
      <Text style={{ color: '#888888', fontSize: 13, fontFamily: 'PlusJakartaSans', marginBottom: 32 }}>
        {t('splash.subtitle')}
      </Text>
      <ActivityIndicator size="small" color="#800020" />
    </View>
  );
}
