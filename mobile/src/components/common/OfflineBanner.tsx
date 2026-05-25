import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useMutationQueueStore } from '../../store/mutationQueue.store';

export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();
  const queue = useMutationQueueStore((s) => s.queue);
  const insets = useSafeAreaInsets();
  const pendingCount = queue.filter((m) => m.status === 'pending').length;

  if (!isOffline) return null;

  return (
    <View
      className="bg-[#4D0013] flex-row items-center justify-center px-4 py-2"
      style={{ paddingTop: insets.top > 0 ? 0 : 4 }}
    >
      <Ionicons name="cloud-offline-outline" size={14} color="#FFFFFF" />
      <Text className="text-white text-[12px] font-bold ml-2">
        Mode hors-ligne
        {pendingCount > 0 ? ` \u00B7 ${pendingCount} en attente` : ''}
      </Text>
    </View>
  );
}
