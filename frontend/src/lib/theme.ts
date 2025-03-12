// Simple utility to handle theme operations
export const themeUtils = {
  // Get the current theme from localStorage or system preference
  getTheme: (): 'dark' | 'light' => {
    const storedTheme = localStorage.getItem('theme');
    
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }
    
    // If no stored theme, check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },
  
  // Set the theme (dark or light)
  setTheme: (theme: 'dark' | 'light'): void => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('theme', theme);
  },
  
  // Toggle the current theme
  toggleTheme: (): 'dark' | 'light' => {
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