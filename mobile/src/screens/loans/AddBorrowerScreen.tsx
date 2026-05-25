import React, { useState } from 'react';
import { View, Text, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, Button, Logo } from '../../components/common';
import { useTheme } from '../../hooks/useTheme';
import { borrowersApi } from '../../api/borrowers.api';
import type { AddBorrowerProps } from '../../navigation/types';
import { useNetworkStore } from '../../store/network.store';
import { useMutationQueueStore } from '../../store/mutationQueue.store';
import { useCacheStore } from '../../store/cache.store';

export function AddBorrowerScreen({ navigation }: AddBorrowerProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const isConnected = useNetworkStore((s) => s.isConnected);
  const addMutation = useMutationQueueStore((s) => s.addMutation);
  const addCachedBorrower = useCacheStore((s) => s.addBorrower);

  const handleSubmit = async () => {
    if (!fullname.trim()) {
      Alert.alert('Erreur', 'Le nom est requis.');
      return;
    }
    const data = {
      fullname: fullname.trim(),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    setLoading(true);
    try {
      if (isConnected) {
        await borrowersApi.create(data);
        Alert.alert('Emprunteur ajouté', `${fullname} a été ajouté.`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const tempId = addMutation('CREATE_BORROWER', { ...data, tempId: `temp_b_${Date.now()}` });
        addCachedBorrower({
          id: tempId,
          user_id: '',
          fullname: data.fullname,
          phone: data.phone,
          address: data.address,
          notes: data.notes,
          created_at: new Date().toISOString(),
        });
        Alert.alert('Sauvegardé localement', `${fullname} sera synchronisé dès la reconnexion.`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e: unknown) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'bg-white border border-[#E8E4DC] rounded-[8px] px-4 py-3.5 text-[15px] text-[#222222]';

  return (
    <View className="flex-1 bg-cream">
      <View className="flex-row items-center gap-2 px-5" style={{ paddingTop: insets.top + 8 }}>
        <Ionicons name="arrow-back" size={22} color="#222222" onPress={() => navigation.goBack()} />
        <Logo size="small" />
        <Text className="text-[18px] font-bold text-[#222222]">Nouvel emprunteur</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled">
          <View className="mb-5">
            <Text className="text-[#222222] text-[14px] font-bold mb-2">Nom complet *</Text>
            <TextInput className={inputClass} placeholder="Nom complet" placeholderTextColor="#CFCFCF" value={fullname} onChangeText={setFullname} autoCapitalize="words" />
          </View>
          <View className="mb-5">
            <Text className="text-[#222222] text-[14px] font-bold mb-2">Téléphone</Text>
            <TextInput className={inputClass} placeholder="+225 07 00 00 00" placeholderTextColor="#CFCFCF" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          </View>
          <View className="mb-5">
            <Text className="text-[#222222] text-[14px] font-bold mb-2">Adresse</Text>
            <TextInput className={inputClass} placeholder="Ville, quartier" placeholderTextColor="#CFCFCF" value={address} onChangeText={setAddress} />
          </View>
          <View className="mb-6">
            <Text className="text-[#222222] text-[14px] font-bold mb-2">Notes</Text>
            <TextInput className={`${inputClass} min-h-[80px]`} placeholder="Notes..." placeholderTextColor="#CFCFCF" multiline value={notes} onChangeText={setNotes} textAlignVertical="top" />
          </View>

          <Button title={loading ? 'Ajout...' : 'Ajouter l\'emprunteur'} onPress={handleSubmit} variant="primary" fullWidth disabled={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
