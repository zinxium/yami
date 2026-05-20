import { useMemo } from 'react';
import { useThemeStore } from '../store/theme.store';
import { getColors, Colors } from '../constants/colors';

export function useTheme() {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const toggleDarkMode = useThemeStore((s) => s.toggleDarkMode);
  const setDarkMode = useThemeStore((s) => s.setDarkMode);

  const colors = useMemo(() => getColors(isDarkMode), [isDarkMode]);

  return {
    isDarkMode,
    colors,
    toggleDarkMode,
    setDarkMode,
  };
}
