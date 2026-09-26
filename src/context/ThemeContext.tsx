'use client';

import React, { createContext, useContext, useState } from 'react';

export type ThemeColor = 'emerald' | 'blue' | 'purple' | 'emerald-light' | 'blue-light' | 'purple-light';

interface ThemeContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const subscribeToHydration = () => () => {};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeState] = useState<ThemeColor>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('ec_theme') as ThemeColor) || 'emerald';
    }
    return 'emerald';
  });

  const [isDarkMode, setIsDarkState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ec_dark') === 'true';
    }
    return false;
  });

  // Utilizando useSyncExternalStore para gerir a hidratação sem warnings de useEffect
  const mounted = React.useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  const setThemeColor = (color: ThemeColor) => {
    setThemeState(color);
    localStorage.setItem('ec_theme', color);
  };

  const toggleDarkMode = () => {
    setIsDarkState((prev) => {
      const next = !prev;
      localStorage.setItem('ec_dark', String(next));
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor, isDarkMode, toggleDarkMode, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  return context;
}