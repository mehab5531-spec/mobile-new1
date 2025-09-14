import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState('system');
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (theme === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(theme === 'dark');
    }
  }, [theme, systemColorScheme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async (newTheme) => {
    try {
      setTheme(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const colors = {
    light: {
      primary: '#007AFF',
      background: '#fff3f3ff',
      surface: '#F2F2F7',
      card: '#FFFFFF',
      text: '#000000',
      textSecondary: '#6D6D80',
      border: '#c4c4c4ff',
      accent: '#FF3B30',
      success: '#34C759',
      warning: '#FF9500',
      radius: 18,
    },
    dark: {
      primary: '#0A84FF',
      background: '#000000ff',
      surface: '#1C1C1E',
      card: '#2C2C2E',
      text: '#FFFFFF',
      textSecondary: '#8E8E93',
      border: '#38383A',
      accent: '#FF453A',
      success: '#30D158',
      warning: '#FF9F0A',
      radius: 18,
    },
  };

  const currentColors = isDark ? colors.dark : colors.light;

  const value = {
    theme,
    isDark,
    colors: currentColors,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};