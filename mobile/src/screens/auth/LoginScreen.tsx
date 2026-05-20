import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/auth.store';
import { Button, Logo } from '../../components/common';
import { Colors } from '../../constants/colors';
import type { LoginProps } from '../../navigation/types';

export function LoginScreen({ navigation }: LoginProps) {
  const insets = useSafeAreaInsets();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Remplis tous les champs.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      setError(e.message || 'Erreur de connexion.');
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
        <Text className="text-center text-[#222222] text-[28px] font-bold mb-2">Bon retour !</Text>
        <Text className="text-center text-[#888888] text-[14px] mb-10">Connecte-toi pour gérer tes prêts.</Text>

        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-[10px] p-3 mb-4">
            <Text className="text-red-600 text-[13px] text-center">{error}</Text>
          </View>
        ) : null}

        <View className="mb-5">
          <Text className="text-[#222222] text-[14px] font-bold mb-2">Email</Text>
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
          <Text className="text-[#222222] text-[14px] font-bold mb-2">Mot de passe</Text>
          <TextInput
            className={inputClass}
            placeholder="••••••••"
            placeholderTextColor="#CFCFCF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <Button
          title={loading ? '' : 'Se connecter'}
          onPress={handleLogin}
          variant="primary"
          fullWidth
          disabled={loading}
        />
        {loading && <ActivityIndicator color={Colors.white} style={{ position: 'absolute', alignSelf: 'center' }} />}

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} className="items-center mt-4">
          <Text className="text-burgundy text-[13px]">Mot de passe oublié ?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')} className="items-center mt-4">
          <Text className="text-[#888888] text-[14px]">
            Pas de compte ? <Text className="text-burgundy font-bold">Créer un compte</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;
