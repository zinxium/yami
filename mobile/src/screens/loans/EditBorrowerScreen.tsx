import React, { useState } from 'react';
import { View, Text, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Button, Logo } from '../../components/common';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../hooks/useTheme';
import { borrowersApi } from '../../api/borrowers.api';
import type { EditBorrowerProps } from '../../navigation/types';

const RELATIONS = ['Ami(e)', 'Famille', 'Collègue', 'Voisin(e)', 'Autre'];

export function EditBorrowerScreen({ route, navigation }: EditBorrowerProps) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);
  const { colors } = useTheme();
  const { borrower } = route.params;
  const [fullname, setFullname] = useState(borrower.fullname);
  const [phone, setPhone] = useState(borrower.phone || '');
  const [relation, setRelation] = useState('Collègue');
  const [showRelationPicker, setShowRelationPicker] = useState(false);
  const [notes, setNotes] = useState(borrower.notes || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullname.trim()) {
      Alert.alert('Erreur', 'Le nom est requis.');
      return;
    }
    setLoading(true);
    try {
      await borrowersApi.update(borrower.id, {
        fullname: fullname.trim(),
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      Alert.alert('Modifié', `${fullname} a été mis à jour.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Supprimer', `Supprimer ${borrower.fullname} définitivement ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          try {
            await borrowersApi.delete(borrower.id);
            navigation.goBack();
          } catch (e: any) {
            Alert.alert('Erreur', e.message);
          }
        },
      },
    ]);
  };

  const inputClass = 'bg-white border border-[#E8E4DC] rounded-[12px] px-4 py-3.5 text-[15px] text-[#222222]';

  return (
    <View className="flex-1 bg-cream">
      {/* Header Ya Mi */}
      <View className="flex-row items-center justify-between px-5" style={{ paddingTop: insets.top + 8, paddingBottom: 8 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color="#222222" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-2">
          <Logo size="small" />
          <Text className="text-[16px] font-bold text-[#222222]">Modifier</Text>
        </View>
        <Avatar name={user?.fullname || 'U'} size="sm" />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled">
          {/* Titre */}
          <Text className="text-[#222222] text-[24px] font-bold mb-1" style={{ fontFamily: 'LibreCaslon-Bold' }}>Modifier l'Emprunteur</Text>
          <Text className="text-[#888888] text-[13px] mb-6">Mettez à jour les informations essentielles de votre contact d'emprunt.</Text>

          {/* Avatar photo */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 rounded-full bg-burgundy items-center justify-center">
              <Text className="text-white text-[32px] font-bold">{fullname.charAt(0).toUpperCase()}</Text>
            </View>
            <TouchableOpacity className="mt-2">
              <Text className="text-[#888888] text-[13px]">Changer la photo</Text>
            </TouchableOpacity>
          </View>

          {/* Nom */}
          <View className="mb-5">
            <Text className="text-[#222222] text-[14px] font-bold mb-2">Nom Complet</Text>
            <View className="flex-row items-center">
              <TextInput className={`${inputClass} flex-1`} value={fullname} onChangeText={setFullname} autoCapitalize="words" />
              <Ionicons name="person-outline" size={18} color="#CFCFCF" style={{ marginLeft: -36 }} />
            </View>
          </View>

          {/* Téléphone */}
          <View className="mb-5">
            <Text className="text-[#222222] text-[14px] font-bold mb-2">Numéro de Téléphone</Text>
            <View className="flex-row items-center">
              <TextInput className={`${inputClass} flex-1`} keyboardType="phone-pad" value={phone} onChangeText={setPhone} placeholder="+237 678 901 234" placeholderTextColor="#CFCFCF" />
              <Ionicons name="call-outline" size={18} color="#CFCFCF" style={{ marginLeft: -36 }} />
            </View>
          </View>

          {/* Relation (dropdown) */}
          <View className="mb-5">
            <Text className="text-[#222222] text-[14px] font-bold mb-2">Relation</Text>
            <TouchableOpacity
              onPress={() => setShowRelationPicker(!showRelationPicker)}
              className="flex-row items-center justify-between bg-white border border-[#E8E4DC] rounded-[12px] px-4 py-3.5"
            >
              <Text className="text-[#222222] text-[15px]">{relation}</Text>
              <Ionicons name="chevron-down" size={18} color="#CFCFCF" />
            </TouchableOpacity>
            {showRelationPicker && (
              <View className="bg-white border border-[#E8E4DC] rounded-[12px] mt-1">
                {RELATIONS.map(r => (
                  <TouchableOpacity key={r} onPress={() => { setRelation(r); setShowRelationPicker(false); }} className="px-4 py-3 border-b border-[#E8E4DC]">
                    <Text className={`text-[14px] ${r === relation ? 'text-burgundy font-bold' : 'text-[#222222]'}`}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Notes */}
          <View className="mb-8">
            <Text className="text-[#222222] text-[14px] font-bold mb-2">Notes (Optionnel)</Text>
            <TextInput
              className={`${inputClass} min-h-[90px]`}
              placeholder="Emprunteur fiable, projet de commerce de détail."
              placeholderTextColor="#CFCFCF"
              multiline
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>

          {/* Bouton Mettre à jour */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="bg-burgundy rounded-[12px] py-4 flex-row items-center justify-center mb-6"
            activeOpacity={0.8}
          >
            <Ionicons name="save-outline" size={18} color="#FFFFFF" />
            <Text className="text-white text-[16px] font-bold ml-2">{loading ? 'Mise à jour...' : 'Mettre à jour'}</Text>
          </TouchableOpacity>

          {/* Séparateur + Supprimer */}
          <View className="border-t border-[#E8E4DC] pt-4">
            <TouchableOpacity onPress={handleDelete} className="flex-row items-center justify-center py-3">
              <Ionicons name="trash-outline" size={16} color={Colors.danger} />
              <Text className="text-[#4D0013] text-[14px] font-bold ml-2">Supprimer cet emprunteur</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
