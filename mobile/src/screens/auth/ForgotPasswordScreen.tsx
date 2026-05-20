import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common';
import { api } from '../../api/client';

export function ForgotPasswordScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email: email.trim() });
    } catch {}
    setSent(true);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-cream">
      {/* Back button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ paddingTop: insets.top + 8, paddingLeft: 16 }}
        className="w-10 h-10 rounded-full bg-white items-center justify-center"
      >
        <Ionicons name="chevron-back" size={20} color="#800020" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: insets.bottom + 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {!sent ? (
          /* Carte blanche centrale */
          <View className="bg-white rounded-[20px] px-6 py-10 mt-6" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }}>
            {/* Logo */}
            <View className="items-center mb-3">
              <View className="w-16 h-16 rounded-full bg-burgundy/10 items-center justify-center">
                <Text className="text-burgundy text-[28px] font-bold">Y</Text>
              </View>
            </View>
            <Text className="text-center text-burgundy text-[18px] font-bold mb-6" style={{ fontFamily: 'LibreCaslon-Bold' }}>Ya Mi</Text>

            {/* Titre */}
            <Text className="text-center text-[#222222] text-[28px] font-bold leading-[34px] mb-3" style={{ fontFamily: 'LibreCaslon-Bold' }}>
              Mot de passe{'\n'}oublié
            </Text>
            <Text className="text-center text-[#888888] text-[14px] mb-8 px-2">
              Entrez votre email pour recevoir un lien de réinitialisation
            </Text>

            {/* Input email avec icône */}
            <Text className="text-[#222222] text-[14px] font-bold mb-2">Adresse Email</Text>
            <View className="flex-row items-center bg-cream border border-[#E8E4DC] rounded-[12px] px-4 py-3.5 mb-6">
              <Ionicons name="mail-outline" size={18} color="#CFCFCF" />
              <TextInput
                className="flex-1 ml-3 text-[15px] text-[#222222]"
                placeholder="nom@exemple.com"
                placeholderTextColor="#CFCFCF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Bouton */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className="bg-burgundy rounded-[12px] py-4 flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Text className="text-white text-[16px] font-bold mr-2">
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </Text>
              {!loading && <Ionicons name="send" size={16} color="#FFFFFF" />}
            </TouchableOpacity>

            {/* Lien connexion */}
            <TouchableOpacity onPress={() => navigation.goBack()} className="items-center mt-6">
              <Text className="text-[#888888] text-[14px]">
                Vous vous en souvenez ? <Text className="text-burgundy font-bold">Connectez-vous</Text>
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* État envoyé */
          <View className="bg-white rounded-[20px] px-6 py-10 mt-6 items-center" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }}>
            <View className="w-20 h-20 rounded-full bg-[#2D6A4F]/10 items-center justify-center mb-4">
              <Ionicons name="mail-outline" size={40} color="#2D6A4F" />
            </View>
            <Text className="text-[#222222] text-[22px] font-bold mb-2">Email envoyé !</Text>
            <Text className="text-[#888888] text-[14px] text-center px-4 mb-8">
              Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation.
            </Text>
            <Button title="Retour à la connexion" onPress={() => navigation.goBack()} variant="primary" fullWidth />
          </View>
        )}

        {/* Footer support */}
        <View className="flex-row items-center justify-center mt-8">
          <Ionicons name="headset-outline" size={16} color="#CFCFCF" />
          <Text className="text-[#CFCFCF] text-[12px] ml-2">Besoin d'aide ? Contactez le support</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
