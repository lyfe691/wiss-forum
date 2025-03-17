// Theme definitions
export type Theme = 'light' | 'dark' | 'steam';

export const themes: Record<Theme, string> = {
  light: 'light',
  dark: 'dark',
  steam: 'steam'
};

// Simple utility to handle theme operations
export const themeUtils = {
  // Get the current theme from localStorage or system preference
  getTheme: (): Theme => {
    const storedTheme = localStorage.getItem('theme') as Theme;
    
    if (storedTheme && themes[storedTheme]) {
      return storedTheme;
    }
    
    // If no stored theme, check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },
  
  // Set the theme
  setTheme: (theme: Theme): void => {
    // Remove all theme classes
    Object.values(themes).forEach(themeClass => {
      document.documentElement.classList.remove(themeClass);
    });
    
    // Add the selected theme class
    document.documentElement.classList.add(themes[theme]);
    
    localStorage.setItem('theme', theme);
  },
  
  // Toggle between light and dark themes
  toggleTheme: (): Theme => {
    const currentTheme = themeUtils.getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    themeUtils.setTheme(newTheme);
    return newTheme;
  },
  
  // Initialize theme based on stored preferences
  initialize: (): void => {
    const theme = themeUtils.getTheme();
    themeUtils.setTheme(theme);
  }
}; 