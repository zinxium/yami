import React from 'react';
import { View, Text, Alert, Switch, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { documentDirectory, downloadAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../hooks/useTheme';
import { Avatar, Button, Card } from '../../components/common';
import { getInitials, formatPhone } from '../../utils/format';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode, colors } = useTheme();

  const handleExportExcel = async () => {
    try {
      const token = await (await import('expo-secure-store')).getItemAsync('access_token');
      const fileUri = documentDirectory + 'ya-mi-releve.xlsx';
      const result = await downloadAsync(`${API_URL}/api/reports/excel`, fileUri, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri);
      } else {
        Alert.alert('Exporté', 'Fichier téléchargé.');
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Te déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: logout },
    ]);
  };

  return (style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {/* Profile Header */}
        <View style={{ alignItems: 'center', paddingTop: insets.top + 32, paddingBottom: 24 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.primaryLight,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: colors.primary, fontSize: 28, fontWeight: 'bold' }}>
              {getInitials(user?.fullname || 'U')}
            </Text>
          </View>
          <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: 'bold' }}>
            {user?.fullname}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>{user?.email}</Text>
          {user?.phone && (
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
              {formatPhone(user.phone)}
            </Text>
          )}
        </View>

        {/* Settings */}
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            <Text style={{ color: colors.textPrimary, fontSize: 15, marginLeft: 12, flex: 1 }}>
              Exporter mes données
            </Text>
            <Button title="Excel" onPress={handleExportExcel} variant="outline" />
          </Card>

          <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name={isDarkMode ? 'moon-outline' : 'sunny-outline'}
                size={20}
                color={colors.primary}
              />
              <Text style={{ color: colors.textPrimary, fontSize: 15, marginLeft: 12 }}>
                {isDarkMode ? 'Mode sombre' : 'Mode clair'}
              </Text>
            </View>
          <ThemedSwitch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            primaryColor={colors.primary}
            secondaryColor={colors.borderLight}

        <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
          <Button title="Se déconnecter" onPress={handleLogout} variant="outline" fullWidth icon="log-out-outline" />
        </View>
      </Scroll<Button title="Se déconnecter" onPress={handleLogout} variant="outline" fullWidth icon="log-out-outline" />
      </View>
    </View>
  );
}
