import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { Sun, Moon } from 'lucide-react';
import { translations } from '../../i18n';

interface ThemeSwitcherProps {
  language: Language;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ language }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const t = translations[language];

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="bg-white hover:bg-beige-50 border border-beige-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-300 font-bold p-2 rounded-md transition-colors"
      aria-label={isDark ? t.themeToLight : t.themeToDark}
      title={isDark ? t.themeToLight : t.themeToDark}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-slate-600" />
      )}
    </button>
  );
};

export default ThemeSwitcher;
