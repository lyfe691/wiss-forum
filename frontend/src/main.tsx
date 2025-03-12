import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize theme based on localStorage or system preference
const initializeTheme = () => {
  // Check if theme exists in localStorage
  const storedTheme = localStorage.getItem('theme');
  
  // If theme exists in localStorage, use that
  if (storedTheme) {
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  // If no theme in localStorage, check system preference
  else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  }
};

// Run theme initialization immediately
initializeTheme();

// Add listener for theme preference changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  const newTheme = event.matches ? 'dark' : 'light';
  // Only update if user hasn't manually set a preference
  if (!localStorage.getItem('theme')) {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
