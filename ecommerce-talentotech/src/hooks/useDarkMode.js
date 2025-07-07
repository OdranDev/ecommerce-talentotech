// hooks/useDarkMode.js
import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  // Función para obtener el tema del sistema
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Función para obtener el tema almacenado
  const getStoredTheme = () => {
    try {
      return localStorage.getItem('theme');
    } catch (error) {
      console.warn('Error accessing localStorage:', error);
      return null;
    }
  };

  // Función para obtener el tema inicial
  const getInitialTheme = () => {
    const stored = getStoredTheme();
    return stored || getSystemTheme();
  };

  // Estado del tema
  const [theme, setTheme] = useState(getInitialTheme);

  // Función para aplicar el tema al documento
  const applyTheme = (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Actualizar meta theme-color para móviles
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const colors = {
        light: '#f8fafc',
        dark: '#0f172a'
      };
      metaThemeColor.setAttribute('content', colors[newTheme]);
    }
  };

  // Función para guardar el tema
  const saveTheme = (newTheme) => {
    try {
      if (newTheme === 'system') {
        localStorage.removeItem('theme');
      } else {
        localStorage.setItem('theme', newTheme);
      }
    } catch (error) {
      console.warn('Error saving theme to localStorage:', error);
    }
  };

  // Función para cambiar el tema
  const setThemeMode = (newTheme) => {
    let actualTheme = newTheme;
    
    if (newTheme === 'system') {
      actualTheme = getSystemTheme();
    }
    
    setTheme(actualTheme);
    applyTheme(actualTheme);
    saveTheme(newTheme);
  };

  // Función para hacer toggle
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeMode(newTheme);
  };

  // Efecto para aplicar el tema inicial
  useEffect(() => {
    applyTheme(theme);
  }, []);

  // Efecto para escuchar cambios en el tema del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Solo actualizar si no hay tema guardado (usando tema del sistema)
      if (!getStoredTheme()) {
        const systemTheme = e.matches ? 'dark' : 'light';
        setTheme(systemTheme);
        applyTheme(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Efecto para manejar atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Shift + D
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleTheme();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [theme]);

  return {
    theme,
    setTheme: setThemeMode,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isSystemTheme: !getStoredTheme()
  };
};