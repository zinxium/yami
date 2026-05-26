import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card, EmptyState, LoadingSpinner, Avatar, Logo } from '../../components/common';
import { notificationsApi, Notification } from '../../api/notifications.api';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../hooks/useTheme';

const TYPE_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; bgColor: string; iconColor: string; urgent?: boolean }> = {
  overdue:  { icon: 'alert-circle-outline',    bgColor: '#FFE5E5', iconColor: '#CC0000', urgent: true },
  payment:  { icon: 'checkmark-circle-outline', bgColor: '#E8F5E8', iconColor: '#2D6A4F' },
  created:  { icon: 'document-text-outline',    bgColor: '#FFF5E5', iconColor: '#7A5F00' },
  reminder: { icon: 'alarm-outline',            bgColor: '#E8F0FF', iconColor: '#1A56DB' },
};

export function NotificationsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data);
    } catch {}
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { fetch(); }, [fetch]));

  const onRefresh = async () => { setRefreshing(true); await fetch(); setRefreshing(false); };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) {
      try { await notificationsApi.markAsRead(n.id); } catch {}
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handlePress = async (notif: Notification) => {
    if (!notif.read) {
      await notificationsApi.markAsRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    }
    if (notif.loan_id) {
      navigation.navigate('Main', { screen: 'HomeTab', params: { screen: 'LoanDetail', params: { loanId: notif.loan_id } } });
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return t('notifications.timeAgo', { value: `${diffMin}${t('notifications.minutes')}` });
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return t('notifications.timeAgo', { value: `${diffH}${t('notifications.hours')}` });
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return t('notifications.yesterday');
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  // Séparer récentes et précédentes
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recent = notifications.filter(n => new Date(n.sent_at) >= oneDayAgo);
  const older = notifications.filter(n => new Date(n.sent_at) < oneDayAgo);

  if (loading) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-cream">
      {/* Header Ya Mi */}
      <View className="flex-row items-center justify-between px-5 pb-3" style={{ paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="menu" size={22} color="#222222" />
          </TouchableOpacity>
          <View className="w-6 h-6 rounded-full bg-burgundy items-center justify-center">
            <Text className="text-white text-[10px] font-bold">Y</Text>
          </View>
          <Text className="text-burgundy text-[16px] font-bold" style={{ fontFamily: 'LibreCaslon-Bold' }}>Ya Mi</Text>
        </View>
        <Avatar name={user?.fullname || 'U'} size="sm" />
      </View>

      {/* Titre + bouton tout marquer */}
      <View className="flex-row items-start justify-between px-5 mb-4">
        <View>
          <Text className="text-[#222222] text-[24px] font-bold" style={{ fontFamily: 'LibreCaslon-Bold' }}>{t('notifications.title')}</Text>
          <Text className="text-[#888888] text-[12px] mt-1">{t('notifications.subtitle')}</Text>
        </View>
        <TouchableOpacity onPress={markAllRead} className="border border-burgundy rounded-[8px] px-3 py-2 mt-1">
          <Text className="text-burgundy text-[11px] font-bold">{t('notifications.markAllRead')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item, index }) => {
          const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.created;
          const isFirstOlder = older.length > 0 && item.id === older[0].id;

          return (
            <>
              {isFirstOlder && (
                <View className="items-center my-4">
                  <View className="border border-[#E8E4DC] rounded-full px-4 py-1.5">
                    <Text className="text-[#AAAAAA] text-[12px]">{t('notifications.previous')}</Text>
                  </View>
                </View>
              )}
              <TouchableOpacity onPress={() => handlePress(item)} activeOpacity={0.7}>
                <Card
                  className={`${config.urgent && !item.read ? 'border-l-4 border-l-[#CC0000]' : ''}`}
                >
                  <View className="flex-row items-start">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: config.bgColor }}
                    >
                      <Ionicons name={config.icon} size={20} color={config.iconColor} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className={`text-[14px] flex-1 ${!item.read ? 'text-[#222222] font-bold' : 'text-[#666666]'}`}>
                          {item.title}
                        </Text>
                        <Text className="text-[#AAAAAA] text-[11px] ml-2">{formatTime(item.sent_at)}</Text>
                      </View>
                      <Text className="text-[#888888] text-[13px] leading-[18px]">{item.message}</Text>
                      {config.urgent && !item.read && (
                        <View className="mt-2 self-start border border-[#2D6A4F] rounded-full px-3 py-1">
                          <Text className="text-[#2D6A4F] text-[11px] font-bold">{t('notifications.actionRequired')}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            </>
          );
        }}
        ListEmptyComponent={
          <EmptyState icon="notifications-off-outline" title={t('notifications.none')} message={t('notifications.noneSubtitle')} />
        }
      />
    </View>
  );
}
