import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, themeUtils } from '@/lib/theme';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(themeUtils.getTheme());

  const setTheme = (newTheme: Theme) => {
    themeUtils.setTheme(newTheme);
    setThemeState(newTheme);
  };

  const cycleTheme = () => {
    const newTheme = themeUtils.cycleTheme();
    setThemeState(newTheme);
  };

  useEffect(() => {
    // Initialize theme on mount
    themeUtils.initialize();
    setThemeState(themeUtils.getTheme());

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (themeUtils.getTheme() === 'system') {
        // Force re-application of system theme
        themeUtils.setTheme('system');
        // Theme state doesn't need to change since it's still 'system'
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 