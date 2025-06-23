'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'theme-default' | 'theme-forest' | 'theme-ocean' | 'theme-sunset';

export const themes: {name: Theme, label: string}[] = [
    { name: 'theme-default', label: 'Default' },
    { name: 'theme-forest', label: 'Forest' },
    { name: 'theme-ocean', label: 'Ocean' },
    { name: 'theme-sunset', label: 'Sunset' },
];

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'theme-default',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'theme-default',
  storageKey = 'goal-track-ai-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    // We access localStorage only on the client side
    const storedTheme = (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    setTheme(storedTheme);
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleSetTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setTheme(newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all possible theme classes
    root.classList.remove(...themes.map(t => t.name));

    // Add the new theme class if it's not the default
    if (theme && theme !== 'theme-default') {
      root.classList.add(theme);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: handleSetTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
