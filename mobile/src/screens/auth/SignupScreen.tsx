import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth.store';
import { Button, Logo } from '../../components/common';
import { Colors } from '../../constants/colors';
import type { SignupProps } from '../../navigation/types';

export function SignupScreen({ navigation }: SignupProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const register = useAuthStore((s) => s.register);
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignup = async () => {
    if (!fullname.trim() || !email.trim() || !phone.trim() || !password) {
      setError(t('signup.fillAllFields'));
      return;
    }
    if (password.length < 8) {
      setError(t('signup.passwordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('signup.passwordMismatch'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register({ fullname: fullname.trim(), email: email.trim(), phone: phone.trim(), password });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('signup.signupError'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'bg-white border border-[#E8E4DC] rounded-[10px] px-4 py-3.5 text-[15px] text-[#222222]';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-cream">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20, paddingHorizontal: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-4">
          <Logo size="medium" />
        </View>
        <Text className="text-center text-[#222222] text-[24px] font-bold mb-1">{t('signup.title')}</Text>
        <Text className="text-center text-[#888888] text-[14px] mb-8">{t('signup.subtitle')}</Text>

        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-[10px] p-3 mb-4">
            <Text className="text-red-600 text-[13px] text-center">{error}</Text>
          </View>
        ) : null}

        <View className="mb-4">
          <Text className="text-[#222222] text-[13px] font-bold mb-1.5">{t('signup.fullname')}</Text>
          <TextInput className={inputClass} placeholder="Ton nom" placeholderTextColor="#CFCFCF" value={fullname} onChangeText={setFullname} autoCapitalize="words" />
        </View>
        <View className="mb-4">
          <Text className="text-[#222222] text-[13px] font-bold mb-1.5">{t('login.email')}</Text>
          <TextInput className={inputClass} placeholder="ton@email.com" placeholderTextColor="#CFCFCF" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        </View>
        <View className="mb-4">
          <Text className="text-[#222222] text-[13px] font-bold mb-1.5">{t('signup.phone')}</Text>
          <TextInput className={inputClass} placeholder="+225 07 00 00 00" placeholderTextColor="#CFCFCF" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        </View>
        <View className="mb-4">
          <Text className="text-[#222222] text-[13px] font-bold mb-1.5">{t('signup.password')}</Text>
          <View className="flex-row items-center">
            <TextInput className={`${inputClass} flex-1 pr-12`} placeholder={t('signup.passwordHint')} placeholderTextColor="#CFCFCF" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12 }}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#CFCFCF" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="mb-6">
          <Text className="text-[#222222] text-[13px] font-bold mb-1.5">{t('signup.confirmPassword')}</Text>
          <View className="flex-row items-center">
            <TextInput className={`${inputClass} flex-1 pr-12`} placeholder={t('signup.confirmPasswordHint')} placeholderTextColor="#CFCFCF" secureTextEntry={!showConfirm} value={confirmPassword} onChangeText={setConfirmPassword} />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 12 }}>
              <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#CFCFCF" />
            </TouchableOpacity>
          </View>
        </View>

        <Button title={loading ? '' : t('signup.title')} onPress={handleSignup} variant="primary" fullWidth disabled={loading} />
        {loading && <ActivityIndicator color={Colors.primary} className="mt-2" />}

        <TouchableOpacity onPress={() => navigation.navigate('Login')} className="items-center mt-5">
          <Text className="text-[#888888] text-[14px]">
            {t('signup.haveAccount')} <Text className="text-burgundy font-bold">{t('signup.login')}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default SignupScreen;
