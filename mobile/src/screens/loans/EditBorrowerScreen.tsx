import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Logo } from '../../components/common';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../hooks/useTheme';
import { borrowersApi } from '../../api/borrowers.api';
import type { EditBorrowerProps } from '../../navigation/types';
import { useNetworkStore } from '../../store/network.store';
import { useMutationQueueStore } from '../../store/mutationQueue.store';

export function EditBorrowerScreen({ route, navigation }: EditBorrowerProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);
  const { colors } = useTheme();
  const { borrower } = route.params;
  const [fullname, setFullname] = useState(borrower.fullname);
  const [phone, setPhone] = useState(borrower.phone || '');
  const [showRelationPicker, setShowRelationPicker] = useState(false);
  const [notes, setNotes] = useState(borrower.notes || '');
  const [loading, setLoading] = useState(false);

  const RELATIONS = useMemo(() => [
    t('relations.friend'),
    t('relations.family'),
    t('relations.colleague'),
    t('relations.neighbor'),
    t('relations.other'),
  ], [t]);

  const [relation, setRelation] = useState(t('relations.colleague'));

  const isConnected = useNetworkStore((s) => s.isConnected);
  const addMutation = useMutationQueueStore((s) => s.addMutation);

  const handleSubmit = async () => {
    if (!fullname.trim()) {
      Alert.alert(t('common.error'), t('addBorrower.nameRequired'));
      return;
    }
    const data = {
      fullname: fullname.trim(),
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    setLoading(true);
    try {
      if (isConnected) {
        await borrowersApi.update(borrower.id, data);
        Alert.alert(t('editBorrower.successTitle'), t('editBorrower.successMessage', { name: fullname }), [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        addMutation('UPDATE_BORROWER', { id: borrower.id, ...data });
        Alert.alert(t('common.savedLocally'), t('editBorrower.offlineMessage', { name: fullname }), [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e: unknown) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(t('editBorrower.deleteTitle'), t('editBorrower.deleteConfirm', { name: borrower.fullname }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'), style: 'destructive', onPress: async () => {
          try {
            await borrowersApi.delete(borrower.id);
            navigation.goBack();
          } catch (e: unknown) {
            Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
          }
        },
      },
    ]);
  };

  const inputStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderWidth: 1,
    color: colors.textPrimary,
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header Ya Mi */}
      <View className="flex-row items-center justify-between px-5" style={{ paddingTop: insets.top + 8, paddingBottom: 8 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View className="flex-row items-center gap-2">
          <Logo size="small" />
          <Text className="text-[16px] font-bold" style={{ color: colors.textPrimary }}>{t('editBorrower.title')}</Text>
        </View>
        <Avatar name={user?.fullname || 'U'} size="sm" />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled">
          {/* Titre */}
          <Text className="text-[24px] font-bold mb-1" style={{ fontFamily: 'LibreCaslon-Bold', color: colors.textPrimary }}>{t('editBorrower.heading')}</Text>
          <Text className="text-[13px] mb-6" style={{ color: colors.textSecondary }}>{t('editBorrower.subtitle')}</Text>

          {/* Avatar photo */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 rounded-full bg-burgundy items-center justify-center">
              <Text className="text-white text-[32px] font-bold">{fullname.charAt(0).toUpperCase()}</Text>
            </View>
            <TouchableOpacity className="mt-2">
              <Text className="text-[13px]" style={{ color: colors.textSecondary }}>{t('editBorrower.changePhoto')}</Text>
            </TouchableOpacity>
          </View>

          {/* Nom */}
          <View className="mb-5">
            <Text className="text-[14px] font-bold mb-2" style={{ color: colors.textPrimary }}>{t('editBorrower.fullname')}</Text>
            <View className="flex-row items-center">
              <TextInput className="flex-1 rounded-[12px] px-4 py-3.5 text-[15px]" style={inputStyle} value={fullname} onChangeText={setFullname} autoCapitalize="words" />
              <Ionicons name="person-outline" size={18} color={colors.dustGrey} style={{ marginLeft: -36 }} />
            </View>
          </View>

          {/* Telephone */}
          <View className="mb-5">
            <Text className="text-[14px] font-bold mb-2" style={{ color: colors.textPrimary }}>{t('editBorrower.phone')}</Text>
            <View className="flex-row items-center">
              <TextInput className="flex-1 rounded-[12px] px-4 py-3.5 text-[15px]" style={inputStyle} keyboardType="phone-pad" value={phone} onChangeText={setPhone} placeholder="+237 678 901 234" placeholderTextColor={colors.dustGrey} />
              <Ionicons name="call-outline" size={18} color={colors.dustGrey} style={{ marginLeft: -36 }} />
            </View>
          </View>

          {/* Relation (dropdown) */}
          <View className="mb-5">
            <Text className="text-[14px] font-bold mb-2" style={{ color: colors.textPrimary }}>{t('editBorrower.relation')}</Text>
            <TouchableOpacity
              onPress={() => setShowRelationPicker(!showRelationPicker)}
              className="flex-row items-center justify-between rounded-[12px] px-4 py-3.5"
              style={{ backgroundColor: colors.surface, borderColor: colors.borderLight, borderWidth: 1 }}
            >
              <Text className="text-[15px]" style={{ color: colors.textPrimary }}>{relation}</Text>
              <Ionicons name="chevron-down" size={18} color={colors.dustGrey} />
            </TouchableOpacity>
            {showRelationPicker && (
              <View className="rounded-[12px] mt-1" style={{ backgroundColor: colors.surface, borderColor: colors.borderLight, borderWidth: 1 }}>
                {RELATIONS.map(r => (
                  <TouchableOpacity key={r} onPress={() => { setRelation(r); setShowRelationPicker(false); }} className="px-4 py-3" style={{ borderBottomColor: colors.borderLight, borderBottomWidth: 1 }}>
                    <Text className="text-[14px]" style={r === relation ? { color: colors.primary, fontWeight: 'bold' } : { color: colors.textPrimary }}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Notes */}
          <View className="mb-8">
            <Text className="text-[14px] font-bold mb-2" style={{ color: colors.textPrimary }}>{t('editBorrower.notes')}</Text>
            <TextInput
              className="rounded-[12px] px-4 py-3.5 text-[15px] min-h-[90px]"
              style={inputStyle}
              placeholder="Emprunteur fiable, projet de commerce de détail."
              placeholderTextColor={colors.dustGrey}
              multiline
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>

          {/* Bouton Mettre a jour */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="bg-burgundy rounded-[12px] py-4 flex-row items-center justify-center mb-6"
            activeOpacity={0.8}
          >
            <Ionicons name="save-outline" size={18} color="#FFFFFF" />
            <Text className="text-white text-[16px] font-bold ml-2">{loading ? t('editBorrower.updating') : t('editBorrower.submit')}</Text>
          </TouchableOpacity>

          {/* Separateur + Supprimer */}
          <View className="pt-4" style={{ borderTopColor: colors.borderLight, borderTopWidth: 1 }}>
            <TouchableOpacity onPress={handleDelete} className="flex-row items-center justify-center py-3">
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
              <Text className="text-[14px] font-bold ml-2" style={{ color: colors.danger }}>{t('common.delete')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
