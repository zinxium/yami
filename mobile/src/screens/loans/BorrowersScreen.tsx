import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Card, EmptyState, LoadingSpinner, ScreenHeader, Logo } from '../../components/common';
import { useBorrowers } from '../../hooks/useLoans';
import { useTheme } from '../../hooks/useTheme';
import { borrowersApi } from '../../api/borrowers.api';

export function BorrowersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { borrowers, loading, refetch } = useBorrowers();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { refetch(); }, []));

  const onRefresh = async () => { setRefreshing(true); await refetch(); setRefreshing(false); };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Supprimer', `Supprimer ${name} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          try {
            await borrowersApi.delete(id);
            refetch();
          } catch (e: any) {
            Alert.alert('Erreur', e.message);
          }
        }
      },
    ]);
  };

  if (loading && borrowers.length === 0) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-cream">
      <View className="flex-row items-center gap-2 px-5 pt-3" style={{ paddingTop: insets.top + 8 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color="#222222" />
        </TouchableOpacity>
        <Logo size="small" />
        <Text className="text-[18px] font-bold text-[#222222]">Emprunteurs</Text>
      </View>

      <FlatList
        data={borrowers}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <Card className="flex-row items-center">
            <Avatar name={item.fullname} size="md" />
            <View className="flex-1 ml-3">
              <Text className="text-[#222222] text-[15px] font-bold">{item.fullname}</Text>
              {item.phone && <Text className="text-[#888888] text-[12px]">{item.phone}</Text>}
              {item.address && <Text className="text-[#888888] text-[12px]">{item.address}</Text>}
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => navigation.navigate('EditBorrower', { borrower: item })}>
                <Ionicons name="create-outline" size={18} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id, item.fullname)}>
                <Ionicons name="trash-outline" size={18} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState icon="people-outline" title="Aucun emprunteur" message="Crée un prêt pour ajouter un emprunteur." />
        }
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('AddBorrower')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-burgundy rounded-full items-center justify-center"
        style={{ shadowColor: '#800020', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
      >
        <Ionicons name="person-add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
