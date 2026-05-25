import { useEffect } from 'react';
import { useNetworkStore } from '../store/network.store';

export function useNetworkStatus() {
  const { isConnected, isInternetReachable, init } = useNetworkStore();

  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, []);

  const isOffline = !isConnected || isInternetReachable === false;

  return { isConnected: !isOffline, isOffline };
}
