import { useState, useEffect } from 'react';
import { Moon, Sun, Plus, Link, ChevronDown, ChevronUp } from 'lucide-react';
import type { Language } from '../types';
import { LANGUAGES } from '../constants';
import { MessageBox } from '../components/MessageBox';

interface HomePageProps {
  setView: (view: string) => void;
  setGameData: (data: { gameId: string; playerId: string }) => void;
  actions: {
    createGame: (gameData: any, displayName: string) => Promise<{ gameId: string; playerId: string } | null>;
    joinGame: (gameId: string, displayName: string) => Promise<{ gameId: string; playerId: string } | null>;
    statusMessage: { text: string; type: 'info' | 'error' | 'success' };
    clearStatus: () => void;
  };
  t: (key: string) => string;
  lang: Language;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  theme: string;
  initialGameId?: string;
}

/**
 * HomePage component with create and join game forms.
 */
export const HomePage = ({
  setView,
  setGameData,
  actions,
  t,
  lang,
  setLanguage,
  toggleTheme,
  theme,
  initialGameId
}: HomePageProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: 'Osprey',
    displayName: '',
    story_name: '',
    deck_type: 'fibonacci' as 'fibonacci' | 'tshirt',
    auto_reveal: false,
  });
  const [joinForm, setJoinForm] = useState({
    gameId: '',
    displayName: '',
  });

  const [showLangMenu, setShowLangMenu] = useState(false);

  // Load display name from local storage on component mount
  useEffect(() => {
    const savedName = localStorage.getItem('displayName');
    if (savedName) {
      setCreateForm(f => ({ ...f, displayName: savedName }));
      setJoinForm(f => ({ ...f, displayName: savedName }));
    }
  }, []);

  // Pre-fill game ID if passed from URL
  useEffect(() => {
    if (initialGameId) {
      setJoinForm(f => ({ ...f, gameId: initialGameId }));
      setIsCreating(false); // Switch to join mode
    }
  }, [initialGameId]);

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  const handleJoinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJoinForm({ ...joinForm, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.displayName) return;

    localStorage.setItem('displayName', createForm.displayName);

    const result = await actions.createGame(createForm, createForm.displayName);
    if (result) {
      setGameData(result);
      setView('game');
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinForm.gameId || !joinForm.displayName) return;

    localStorage.setItem('displayName', joinForm.displayName);

    const result = await actions.joinGame(joinForm.gameId.trim(), joinForm.displayName);
    if (result) {
      setGameData(result);
      setView('game');
    }
  };

  const handleLangSelect = (newLang: Language) => {
    setLanguage(newLang);
    setShowLangMenu(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-950 transition-colors duration-500">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 md:p-10">
        {/* Header and Controls */}
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{t('WELCOME_TITLE')}</h1>
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5 text-gray-700" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            </button>
            {/* Language Picker */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-2 px-4 rounded-full bg-gray-200 dark:bg-gray-700 shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center"
                title="Change Language"
              >
                {LANGUAGES[lang]}
                {showLangMenu ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
              </button>
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
                  {Object.entries(LANGUAGES).map(([key, name]) => (
                    <button
                      key={key}
                      onClick={() => handleLangSelect(key as Language)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-500 hover:text-white rounded-md ${key === lang ? 'bg-indigo-100 dark:bg-indigo-600' : ''}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab/Action Selection */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
          <button
            type="button"
            className={`py-2 px-4 text-lg font-semibold transition-all ${
              isCreating ? 'text-indigo-600 dark:text-indigo-400 border-b-4 border-indigo-600 dark:border-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-5 h-5 inline mr-2" /> {t('CREATE_GAME')}
          </button>
          <button
            type="button"
            className={`py-2 px-4 text-lg font-semibold transition-all ${
              !isCreating ? 'text-indigo-600 dark:text-indigo-400 border-b-4 border-indigo-600 dark:border-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setIsCreating(false)}
          >
            <Link className="w-5 h-5 inline mr-2" /> {t('JOIN_GAME')}
          </button>
        </div>

        {/* Forms */}
        {isCreating ? (
          <form onSubmit={handleCreateSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="create-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('NAME')}</label>
                <input
                  id="create-name"
                  type="text"
                  name="displayName"
                  value={createForm.displayName}
                  onChange={handleCreateChange}
                  placeholder="e.g., Alice (Moderator)"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="game-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('GAME_NAME')}</label>
                <input
                  id="game-name"
                  type="text"
                  name="name"
                  value={createForm.name}
                  onChange={handleCreateChange}
                  placeholder="e.g., Project Alpha Estimates"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="story-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('STORY_NAME')}</label>
              <input
                id="story-name"
                type="text"
                name="story_name"
                value={createForm.story_name}
                onChange={handleCreateChange}
                placeholder="e.g., Implement user authentication feature"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="deck-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('DECK_TYPE')}</label>
                <select
                  id="deck-type"
                  name="deck_type"
                  value={createForm.deck_type}
                  onChange={handleCreateChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="fibonacci">{t('FIBONACCI')}</option>
                  <option value="tshirt">{t('TSHIRT')}</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="auto_reveal"
                    checked={createForm.auto_reveal}
                    onChange={(e) => setCreateForm({ ...createForm, auto_reveal: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 dark:text-indigo-500 border-gray-300 dark:border-gray-600 rounded mr-2"
                  />
                  Auto Reveal when all players vote
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
            >
              <Plus className="w-5 h-5 mr-2" /> {t('CREATE_GAME')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="join-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('NAME')}</label>
                <input
                  id="join-name"
                  type="text"
                  name="displayName"
                  value={joinForm.displayName}
                  onChange={handleJoinChange}
                  placeholder="e.g., Bob"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="game-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('GAME_ID')}</label>
                <input
                  id="game-id"
                  type="text"
                  name="gameId"
                  value={joinForm.gameId}
                  onChange={handleJoinChange}
                  placeholder="Paste Game ID or link here"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
            >
              <Link className="w-5 h-5 mr-2" /> {t('JOIN_GAME')}
            </button>
          </form>
        )}
        <MessageBox message={actions.statusMessage.text} type={actions.statusMessage.type} onClose={actions.clearStatus} />
      </div>
    </div>
  );
};
