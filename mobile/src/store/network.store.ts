import { create } from 'zustand';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  init: () => () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isConnected: true,
  isInternetReachable: null,

  init: () => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      set({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
      });
    });
    return unsubscribe;
  },
}));
