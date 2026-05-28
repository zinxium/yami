import React from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { documentDirectory, downloadAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../hooks/useTheme';
import { Avatar, Button, Card, ThemedSwitch } from '../../components/common';
import { getInitials, formatPhone } from '../../utils/format';
import i18n from '../../i18n';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://yami-production.up.railway.app';

export function ProfileScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
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
        Alert.alert(t('profile.exported'), t('profile.fileDownloaded'));
      }
    } catch (e: unknown) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    }
  };

  const handleLogout = () => {
    Alert.alert(t('profile.logoutConfirm'), t('profile.logoutMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.logoutConfirm'), style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
          <TouchableOpacity
            onPress={() => navigation.getParent()?.navigate('Borrowers')}
            activeOpacity={0.7}
          >
            <Card className="flex-row items-center">
              <Ionicons name="people-outline" size={20} color={colors.primary} />
              <Text style={{ color: colors.textPrimary, fontSize: 15, marginLeft: 12, flex: 1 }}>
                {t('profile.borrowers')}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Card>
          </TouchableOpacity>

          <Card className="flex-row items-center">
            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            <Text style={{ color: colors.textPrimary, fontSize: 15, marginLeft: 12, flex: 1 }}>
              {t('profile.exportData')}
            </Text>
            <Button title={t('profile.excel')} onPress={handleExportExcel} variant="outline" />
          </Card>

          <Card className="flex-row items-center justify-between py-3">
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name={isDarkMode ? 'moon-outline' : 'sunny-outline'}
                size={20}
                color={colors.primary}
              />
              <Text style={{ color: colors.textPrimary, fontSize: 15, marginLeft: 12 }}>
                {isDarkMode ? t('profile.darkMode') : t('profile.lightMode')}
              </Text>
            </View>
            <ThemedSwitch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              primaryColor={colors.primary}
              secondaryColor={colors.borderLight}
            />
          </Card>

          <Card className="flex-row items-center justify-between py-3">
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="language-outline" size={20} color={colors.primary} />
              <Text style={{ color: colors.textPrimary, fontSize: 15, marginLeft: 12 }}>
                {i18n.language === 'fr' ? 'Français' : 'English'}
              </Text>
            </View>
            <ThemedSwitch
              value={i18n.language === 'en'}
              onValueChange={() => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')}
              primaryColor={colors.primary}
              secondaryColor={colors.borderLight}
            />
          </Card>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
          <Button title={t('profile.logout')} onPress={handleLogout} variant="outline" fullWidth icon="log-out-outline" />
        </View>
      </ScrollView>
    </View>
  );
}
