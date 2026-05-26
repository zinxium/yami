import React, { useState } from 'react';
import { View, Text, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ScreenHeader, Button, Logo } from '../../components/common';
import { useTheme } from '../../hooks/useTheme';
import { borrowersApi } from '../../api/borrowers.api';
import type { AddBorrowerProps } from '../../navigation/types';
import { useNetworkStore } from '../../store/network.store';
import { useMutationQueueStore } from '../../store/mutationQueue.store';
import { useCacheStore } from '../../store/cache.store';

export function AddBorrowerScreen({ navigation }: AddBorrowerProps) {
  const { t } = useTranslation();
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
      Alert.alert(t('common.error'), t('addBorrower.nameRequired'));
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
        Alert.alert(t('addBorrower.successTitle'), t('addBorrower.successMessage', { name: fullname }), [
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
        Alert.alert(t('common.savedLocally'), t('addBorrower.offlineMessage', { name: fullname }), [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e: unknown) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
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
        <Text className="text-[18px] font-bold text-[#222222]">{t('addBorrower.title')}</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled">
          <View className="mb-5">
            <Text className="text-[#222222] text-[14px] font-bold mb-2">{t('addBorrower.fullname')}</Text>
            <TextInput className={inputClass} placeholder={t('addBorrower.fullname')} placeholderTextColor="#CFCFCF" value={fullname} onChangeText={setFullname} autoCapitalize="words" />
          </View>
          <View className="mb-5">
            <Text className="text-[#222222] text-[14px] font-bold mb-2">{t('addBorrower.phone')}</Text>
            <TextInput className={inputClass} placeholder="+225 07 00 00 00" placeholderTextColor="#CFCFCF" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          </View>
          <View className="mb-5">
            <Text className="text-[#222222] text-[14px] font-bold mb-2">{t('addBorrower.address')}</Text>
            <TextInput className={inputClass} placeholder="Ville, quartier" placeholderTextColor="#CFCFCF" value={address} onChangeText={setAddress} />
          </View>
          <View className="mb-6">
            <Text className="text-[#222222] text-[14px] font-bold mb-2">{t('addBorrower.notes')}</Text>
            <TextInput className={`${inputClass} min-h-[80px]`} placeholder="Notes..." placeholderTextColor="#CFCFCF" multiline value={notes} onChangeText={setNotes} textAlignVertical="top" />
          </View>

          <Button title={loading ? t('addBorrower.adding') : t('addBorrower.submit')} onPress={handleSubmit} variant="primary" fullWidth disabled={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
