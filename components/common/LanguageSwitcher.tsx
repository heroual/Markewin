import React from 'react';
import { Language } from '../../types';

interface LanguageSwitcherProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, onLanguageChange }) => {
  const toggleLanguage = () => {
    onLanguageChange(language === 'en' ? 'fr' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="bg-white hover:bg-beige-50 border border-beige-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-300 font-bold py-2 px-4 rounded-md transition-colors text-sm"
      aria-label={`Switch to ${language === 'en' ? 'French' : 'English'}`}
    >
      {language === 'en' ? 'FR' : 'EN'}
    </button>
  );
};

export default LanguageSwitcher;