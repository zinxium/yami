import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth.store';
import { Button, Logo } from '../../components/common';
import { Colors } from '../../constants/colors';
import type { LoginProps } from '../../navigation/types';

export function LoginScreen({ navigation }: LoginProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError(t('login.fillAllFields'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('login.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'bg-white border border-[#E8E4DC] rounded-[10px] px-4 py-3.5 text-[15px] text-[#222222]';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-cream">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20, paddingHorizontal: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View className="items-center mb-6">
          <Logo size="medium" style={{ marginBottom: 8 }} />
        </View>
        <Text className="text-center text-[#222222] text-[28px] font-bold mb-2">{t('login.welcomeBack')}</Text>
        <Text className="text-center text-[#888888] text-[14px] mb-10">{t('login.subtitle')}</Text>

        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-[10px] p-3 mb-4">
            <Text className="text-red-600 text-[13px] text-center">{error}</Text>
          </View>
        ) : null}

        <View className="mb-5">
          <Text className="text-[#222222] text-[14px] font-bold mb-2">{t('login.email')}</Text>
          <TextInput
            className={inputClass}
            placeholder="ton@email.com"
            placeholderTextColor="#CFCFCF"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View className="mb-6">
          <Text className="text-[#222222] text-[14px] font-bold mb-2">{t('login.password')}</Text>
          <View className="flex-row items-center">
            <TextInput
              className={`${inputClass} flex-1 pr-12`}
              placeholder="••••••••"
              placeholderTextColor="#CFCFCF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12 }}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#CFCFCF" />
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title={loading ? '' : t('login.submit')}
          onPress={handleLogin}
          variant="primary"
          fullWidth
          disabled={loading}
        />
        {loading && <ActivityIndicator color={Colors.white} style={{ position: 'absolute', alignSelf: 'center' }} />}

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} className="items-center mt-4">
          <Text className="text-burgundy text-[13px]">{t('login.forgotPassword')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')} className="items-center mt-4">
          <Text className="text-[#888888] text-[14px]">
            {t('login.noAccount')} <Text className="text-burgundy font-bold">{t('login.createAccount')}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;
