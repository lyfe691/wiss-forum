// Theme definitions

// using shadcn themeing
// ive got it from a doc

export type Theme = 'light' | 'dark' | 'system';

export const themes: Record<Theme, string> = {
  light: 'light',
  dark: 'dark',
  system: 'system'
};

// Simple utility to handle theme operations
export const themeUtils = {
  // Get the current theme from localStorage or default to system
  getTheme: (): Theme => {
    const storedTheme = localStorage.getItem('theme') as Theme;
    
    if (storedTheme && themes[storedTheme]) {
      return storedTheme;
    }
    
    // Default to system preference
    return 'system';
  },
  
  // Get the resolved theme (what should actually be applied)
  getResolvedTheme: (): 'light' | 'dark' => {
    const currentTheme = themeUtils.getTheme();
    
    if (currentTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    return currentTheme as 'light' | 'dark';
  },
  
  // Set the theme
  setTheme: (theme: Theme): void => {
    // Remove all theme classes
    document.documentElement.classList.remove('light', 'dark');
    
    const resolvedTheme = theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    
    // Add the resolved theme class
    document.documentElement.classList.add(resolvedTheme);
    
    localStorage.setItem('theme', theme);
  },
  
  // Cycle through themes: light -> dark -> system -> light...
  cycleTheme: (): Theme => {
    const currentTheme = themeUtils.getTheme();
    let newTheme: Theme;
    
    switch (currentTheme) {
      case 'light':
        newTheme = 'dark';
        break;
      case 'dark':
        newTheme = 'system';
        break;
      case 'system':
      default:
        newTheme = 'light';
        break;
    }
    
    themeUtils.setTheme(newTheme);
    return newTheme;
  },
  
  // Initialize theme based on stored preferences
  initialize: (): void => {
    const theme = themeUtils.getTheme();
    themeUtils.setTheme(theme);
  }
}; 