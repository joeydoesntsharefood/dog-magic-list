import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'midnight' | 'planeswalker';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('dogmagic-theme') as Theme) || 'midnight';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('dogmagic-theme', newTheme);
  };

  useEffect(() => {
    const body = document.body;
    body.classList.remove('theme-planeswalker');
    
    if (theme === 'planeswalker') {
      body.classList.add('theme-planeswalker');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
