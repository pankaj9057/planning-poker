import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Moon, Sun, Plus, Link, ChevronDown, ChevronUp, Users2, Zap, Languages } from 'lucide-react';
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
    <div className="min-h-screen w-full flex flex-col justify-between p-4 md:p-8 bg-gradient-to-tr from-slate-50 via-indigo-50/20 to-purple-50/40 dark:from-[#0b0f19] dark:via-[#131a2e] dark:to-[#0f172a] transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          lang={lang}
          setLanguage={setLanguage}
          showLangMenu={showLangMenu}
          setShowLangMenu={setShowLangMenu}
          handleLangSelect={handleLangSelect}
        />

        {/* Main Container */}
        <main className="w-full max-w-xl mx-auto my-auto py-8">
          <div className="glass-panel rounded-[32px] shadow-2xl p-6 md:p-10 border border-white/60 dark:border-slate-800/40 relative overflow-hidden">
            {/* Decorative glows */}
            <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-3xl pointer-events-none" />

            {/* Form Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-heading font-extrabold tracking-tight text-slate-800 dark:text-white">
                {t('WELCOME_TITLE')}
              </h1>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                Collaborate and estimate agile stories with your team instantly.
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex p-1.5 bg-slate-200/50 dark:bg-slate-900/40 rounded-2xl mb-8 border border-slate-200/10">
              <button
                type="button"
                className={`w-1/2 py-3 rounded-xl font-heading font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${isCreating
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                onClick={() => setIsCreating(true)}
              >
                <Plus className="w-4 h-4" /> {t('CREATE_GAME')}
              </button>
              <button
                type="button"
                className={`w-1/2 py-3 rounded-xl font-heading font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${!isCreating
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                onClick={() => setIsCreating(false)}
              >
                <Link className="w-4 h-4" /> {t('JOIN_GAME')}
              </button>
            </div>

            {/* Forms */}
            {isCreating ? (
              <form onSubmit={handleCreateSubmit} className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label htmlFor="create-name" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 block">
                      {t('NAME')}
                    </label>
                    <input
                      id="create-name"
                      type="text"
                      name="displayName"
                      value={createForm.displayName}
                      onChange={handleCreateChange}
                      placeholder="e.g., Alice (Moderator)"
                      required
                      className="glass-input mt-1 block w-full rounded-xl border border-slate-200/80 dark:border-slate-800/85 text-slate-800 dark:text-slate-100 p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="game-name" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 block">
                      {t('GAME_NAME')}
                    </label>
                    <input
                      id="game-name"
                      type="text"
                      name="name"
                      value={createForm.name}
                      onChange={handleCreateChange}
                      placeholder="e.g., Sprint 12 Estimation"
                      required
                      className="glass-input mt-1 block w-full rounded-xl border border-slate-200/80 dark:border-slate-800/85 text-slate-800 dark:text-slate-100 p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="story-name" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 block">
                    {t('STORY_NAME')} (Optional)
                  </label>
                  <input
                    id="story-name"
                    type="text"
                    name="story_name"
                    value={createForm.story_name}
                    onChange={handleCreateChange}
                    placeholder="e.g., PROJ-204: Add search bar to navbar"
                    className="glass-input mt-1 block w-full rounded-xl border border-slate-200/80 dark:border-slate-800/85 text-slate-800 dark:text-slate-100 p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="deck-type" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 block">
                      {t('DECK_TYPE')}
                    </label>
                    <select
                      id="deck-type"
                      name="deck_type"
                      value={createForm.deck_type}
                      onChange={handleCreateChange}
                      className="glass-input mt-1 block w-full rounded-xl border border-slate-200/80 dark:border-slate-800/85 text-slate-800 dark:text-slate-100 p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-sm cursor-pointer"
                    >
                      <option value="fibonacci">{t('FIBONACCI')}</option>
                      <option value="tshirt">{t('TSHIRT')}</option>
                    </select>
                  </div>
                  <div className="flex items-center pb-2">
                    <label className="flex items-center text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="auto_reveal"
                        checked={createForm.auto_reveal}
                        onChange={(e) => setCreateForm({ ...createForm, auto_reveal: e.target.checked })}
                        className="h-4.5 w-4.5 text-indigo-600 border-slate-300 dark:border-slate-700 rounded-lg mr-2.5 focus:ring-0 cursor-pointer"
                      />
                      Auto Reveal on final vote
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-heading font-bold rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all duration-200 transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> {t('CREATE_GAME')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoinSubmit} className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label htmlFor="join-name" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 block">
                      {t('NAME')}
                    </label>
                    <input
                      id="join-name"
                      type="text"
                      name="displayName"
                      value={joinForm.displayName}
                      onChange={handleJoinChange}
                      placeholder="e.g., Bob"
                      required
                      className="glass-input mt-1 block w-full rounded-xl border border-slate-200/80 dark:border-slate-800/85 text-slate-800 dark:text-slate-100 p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="game-id" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 block">
                      {t('GAME_ID')}
                    </label>
                    <input
                      id="game-id"
                      type="text"
                      name="gameId"
                      value={joinForm.gameId}
                      onChange={handleJoinChange}
                      placeholder="Paste Game ID or session link"
                      required
                      className="glass-input mt-1 block w-full rounded-xl border border-slate-200/80 dark:border-slate-800/85 text-slate-800 dark:text-slate-100 p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-heading font-bold rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all duration-200 transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Link className="w-4 h-4" /> {t('JOIN_GAME')}
                </button>
              </form>
            )}
          </div>
        </main>

        {/* Feature Highlights Grid */}
        <footer className="w-full max-w-5xl mx-auto mt-8 py-4 border-t border-slate-200/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left mt-6">
            <div className="p-4 flex flex-col items-center md:items-start">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <Users2 className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-800 dark:text-slate-200 text-sm">Real-time Collaboration</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Instant updates on votes, session statuses, and participant connections.</p>
            </div>

            <div className="p-4 flex flex-col items-center md:items-start">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-800 dark:text-slate-200 text-sm">Rich Interactivity</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">3D card flips, subtle shadows, and clean hover transformations for maximum responsiveness.</p>
            </div>

            <div className="p-4 flex flex-col items-center md:items-start">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <Languages className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-800 dark:text-slate-200 text-sm">Localization Support</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Seamlessly toggle between languages to suit global cross-functional development teams.</p>
            </div>
          </div>
          <p className="text-center text-[10px] text-slate-400/60 dark:text-slate-600 mt-8">
            Planning Poker Estimate Tool &copy; {new Date().getFullYear()}. All Rights Reserved.
          </p>
        </footer>

        <MessageBox message={actions.statusMessage.text} type={actions.statusMessage.type} onClose={actions.clearStatus} />
      </div>
    </div>
  );
};
