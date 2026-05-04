'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
type ClockFormat = '12h' | '24h';

interface AppPreferences {
  theme: Theme;
  toggleTheme: () => void;
  clockFormat: ClockFormat;
  toggleClockFormat: () => void;
}

const ThemeContext = createContext<AppPreferences>({
  theme: 'dark', 
  toggleTheme: () => {},
  clockFormat: '12h',
  toggleClockFormat: () => {}
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [clockFormat, setClockFormat] = useState<ClockFormat>('12h');
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    const savedClock = localStorage.getItem('clockFormat') as ClockFormat | null;
    if (savedClock) {
      setClockFormat(savedClock);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleClockFormat = () => {
    const newFormat = clockFormat === '12h' ? '24h' : '12h';
    setClockFormat(newFormat);
    localStorage.setItem('clockFormat', newFormat);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, clockFormat, toggleClockFormat }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
