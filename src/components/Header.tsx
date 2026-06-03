import { Moon, Sun, Languages, ChevronDown, ChevronUp } from 'lucide-react';
import type { Language } from '../types';
import { LANGUAGES } from '../constants';

interface HeaderProps {
  theme?: string;
  toggleTheme?: () => void;
  lang: Language;
  setLanguage: (lang: Language) => void;
  showLangMenu: boolean;
  setShowLangMenu: (show: boolean) => void;
  handleLangSelect: (lang: Language) => void;
  setView?: (view: string) => void; // optional for back navigation
}

export const Header = ({
  theme,
  toggleTheme,
  lang,
  setLanguage,
  showLangMenu,
  setShowLangMenu,
  handleLangSelect,
  setView,
}: HeaderProps) => {
  return (
    <header className="w-full mx-auto flex justify-between items-center py-4 mb-4">
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <span className="font-heading font-black text-white text-base">P</span>
        </div>
        <span className="font-heading font-black text-xl md:text-2xl bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
          Planning Poker
        </span>
      </div>
      <div className="flex items-center space-x-3">
        {toggleTheme && theme && (
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl glass-card text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-yellow-400 animate-pulse" />}
          </button>
        )}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="p-2.5 px-4 rounded-xl glass-card text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-md hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-1.5 font-heading font-semibold text-sm cursor-pointer"
            title="Change Language"
          >
            <Languages className="w-4 h-4" />
            {LANGUAGES[lang]}
            {showLangMenu ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-40 rounded-xl shadow-2xl glass-card border border-slate-200/50 dark:border-slate-800/50 z-20 overflow-hidden animate-fade-in">
              {Object.entries(LANGUAGES).map(([key, name]) => (
                <button
                  key={key}
                  onClick={() => handleLangSelect(key as Language)}
                  className={`block w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gradient-to-r hover:from-indigo-600 hover:to-violet-600 hover:text-white transition-colors duration-150 ${key === lang ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
        {setView && (
          <button
            onClick={() => setView('home')}
            className="p-2.5 px-4 rounded-xl glass-card hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 shadow-md font-heading font-semibold text-sm cursor-pointer"
            title="Back to Home"
          >
            Back
          </button>
        )}
      </div>
    </header>
  );
};
export default Header;
