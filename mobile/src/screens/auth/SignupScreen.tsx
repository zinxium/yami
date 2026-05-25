import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/auth.store';
import { Button, Logo } from '../../components/common';
import { Colors } from '../../constants/colors';
import type { SignupProps } from '../../navigation/types';

export function SignupScreen({ navigation }: SignupProps) {
  const insets = useSafeAreaInsets();
  const register = useAuthStore((s) => s.register);
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!fullname.trim() || !email.trim() || !phone.trim() || !password) {
      setError('Remplis tous les champs.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register({ fullname: fullname.trim(), email: email.trim(), phone: phone.trim(), password });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'inscription.');
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
        <Text className="text-center text-[#222222] text-[24px] font-bold mb-1">Créer mon compte</Text>
        <Text className="text-center text-[#888888] text-[14px] mb-8">Rejoins Ya Mi pour gérer tes prêts.</Text>

        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-[10px] p-3 mb-4">
            <Text className="text-red-600 text-[13px] text-center">{error}</Text>
          </View>
        ) : null}

        <View className="mb-4">
          <Text className="text-[#222222] text-[13px] font-bold mb-1.5">Nom complet</Text>
          <TextInput className={inputClass} placeholder="Ton nom" placeholderTextColor="#CFCFCF" value={fullname} onChangeText={setFullname} autoCapitalize="words" />
        </View>
        <View className="mb-4">
          <Text className="text-[#222222] text-[13px] font-bold mb-1.5">Email</Text>
          <TextInput className={inputClass} placeholder="ton@email.com" placeholderTextColor="#CFCFCF" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        </View>
        <View className="mb-4">
          <Text className="text-[#222222] text-[13px] font-bold mb-1.5">Téléphone</Text>
          <TextInput className={inputClass} placeholder="+225 07 00 00 00" placeholderTextColor="#CFCFCF" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        </View>
        <View className="mb-4">
          <Text className="text-[#222222] text-[13px] font-bold mb-1.5">Mot de passe</Text>
          <TextInput className={inputClass} placeholder="Min. 8 caractères" placeholderTextColor="#CFCFCF" secureTextEntry value={password} onChangeText={setPassword} />
        </View>
        <View className="mb-6">
          <Text className="text-[#222222] text-[13px] font-bold mb-1.5">Confirmer</Text>
          <TextInput className={inputClass} placeholder="Confirme ton mot de passe" placeholderTextColor="#CFCFCF" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
        </View>

        <Button title={loading ? '' : 'Créer mon compte'} onPress={handleSignup} variant="primary" fullWidth disabled={loading} />
        {loading && <ActivityIndicator color={Colors.primary} className="mt-2" />}

        <TouchableOpacity onPress={() => navigation.navigate('Login')} className="items-center mt-5">
          <Text className="text-[#888888] text-[14px]">
            Déjà un compte ? <Text className="text-burgundy font-bold">Se connecter</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default SignupScreen;
