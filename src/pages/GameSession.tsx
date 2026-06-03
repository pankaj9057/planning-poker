import { useState } from 'react';
import { Header } from '../components/Header';
import { InteractiveLiquidBackground } from '../components/InteractiveLiquidBackground';
import { Link as LinkIcon, Zap, RotateCw, ChevronDown, ChevronUp } from 'lucide-react';
import type { Game, Player, Language } from '../types';
import { GameStatus, LANGUAGES } from '../constants';
import { CardPicker } from '../components/CardPicker';
import { PlayerList } from '../components/PlayerList';
import { MessageBox } from '../components/MessageBox';
import { QRCodeModal } from '../components/QRCodeModal';

interface GameSessionProps {
  state: {
    game: Game | null;
    players: Player[];
    currentPlayer: Player | undefined;
    loading: boolean;
    error: string | null;
    finishedCount: number;
    totalPlayers: number;
    isModerator: boolean;
    canReveal: boolean;
    canReset: boolean;
    canRevealOrReset: boolean;
  };
  actions: {
    vote: (gameId: string, playerId: string, card: string | number) => Promise<void>;
    revealVotes: (gameId: string, players: Player[], canReveal: boolean) => Promise<void>;
    resetRound: (gameId: string, players: Player[], canReset: boolean) => Promise<void>;
    statusMessage: { text: string; type: 'info' | 'error' | 'success' };
    clearStatus: () => void;
  };
  setView: (view: string) => void;
  t: (key: string) => string;
  lang: Language;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  theme: string;
}

/**
 * GameSession component displays the active game interface.
 */
export const GameSession = ({ state, actions, setView, t, lang, setLanguage, toggleTheme, theme }: GameSessionProps) => {
  const { game, players, currentPlayer, loading, error, finishedCount, totalPlayers, canReveal, canReset } = state;
  const { vote, revealVotes, resetRound, statusMessage, clearStatus } = actions;
  const [copyStatus, setCopyStatus] = useState(t('COPY_LINK'));
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  if (loading) return <div className="text-center p-8 text-gray-500 dark:text-gray-400">Loading Game...</div>;
  if (error || !game) return <div className="text-center p-8 text-red-500">Error: {error || 'Game data missing.'}</div>;

  const isRevealed = game.game_status === GameStatus.FINISHED;
  const revealProgress = totalPlayers > 0 ? (finishedCount / totalPlayers) * 100 : 0;
  const averageDisplay = isRevealed ? (game.average === null ? t('NO_VOTES') : game.average) : '...';
  const joinUrl = `${window.location.origin}${window.location.pathname}?gameId=${game.id}`;

  const handleCopyLink = async () => {
    setShowQRModal(true);
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopyStatus(t('COPIED'));
      setTimeout(() => setCopyStatus(t('COPY_LINK')), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = joinUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopyStatus(t('COPIED'));
        setTimeout(() => setCopyStatus(t('COPY_LINK')), 2000);
      } catch (err2) {
        console.error('Fallback copy failed:', err2);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleLangSelect = (newLang: Language) => {
    setLanguage(newLang);
    setShowLangMenu(false);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-4 md:p-8 bg-gradient-to-tr from-slate-50 via-indigo-50/20 to-purple-50/40 dark:from-[#0b0f19] dark:via-[#131a2e] dark:to-[#0f172a] transition-colors duration-500 isolate">
      {/* <InteractiveLiquidBackground theme={theme} /> */}
      <div className="relative z-10 max-w-7xl mx-auto w-full flex-grow flex flex-col justify-between">

        {/* Top Navigation */}
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          setView={setView}
          lang={lang}
          setLanguage={setLanguage}
          showLangMenu={showLangMenu}
          setShowLangMenu={setShowLangMenu}
          handleLangSelect={handleLangSelect}
        />

        {/* Game Board & Statistics */}
        <div className="glass-panel rounded-[32px] p-6 md:p-8 shadow-2xl mb-8 border border-white/60 dark:border-slate-800/40 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/5 dark:bg-indigo-500/2 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-violet-500/5 dark:bg-violet-500/2 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                <h2 className="text-2xl md:text-3xl font-heading font-black text-slate-800 dark:text-white">{game.name}</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isRevealed ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25'}`}>
                  {t(`${game.game_status.toUpperCase()}`)}
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {t('GAME_CREATED_BY')}: <span className="font-semibold text-slate-500 dark:text-slate-400">{game.created_by_name}</span> (<span className="font-mono">{game.created_by_id.substring(0, 8)}...</span>)
              </p>

              {game.story_name && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500/10 dark:bg-indigo-500/5 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/10 rounded-2xl font-heading font-semibold text-sm">
                  <LinkIcon className="w-4 h-4 shrink-0" />
                  <span>{game.story_name}</span>
                </div>
              )}
            </div>

            {/* Moderation Actions */}
            <div className="flex items-center gap-3 shrink-0">
              {canReveal && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await revealVotes(game.id, players, canReveal);
                    } catch (err) {
                      console.error('Reveal action failed:', err);
                    }
                  }}
                  className="inline-flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 px-5 py-3 rounded-xl font-heading font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                  disabled={!canReveal}
                  title={!canReveal ? t('NOT_AUTHORIZED') : ''}
                >
                  <Zap className="w-4.5 h-4.5 mr-2" /> {t('REVEAL')}
                </button>
              )}
              {canReset && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await resetRound(game.id, players, canReset);
                    } catch (err) {
                      console.error('Reset action failed:', err);
                    }
                  }}
                  className="inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 px-5 py-3 rounded-xl font-heading font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                  disabled={!canReset}
                  title={!canReset ? t('NOT_AUTHORIZED') : ''}
                >
                  <RotateCw className="w-4.5 h-4.5 mr-2 animate-spin-slow" /> {t('RESET_ROUND')}
                </button>
              )}
            </div>
          </div>

          {/* Progress and Average Display Cards */}
          <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/40 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className={`p-5 rounded-2xl transition-all duration-500 border ${isRevealed ? 'bg-gradient-to-br from-indigo-500/10 to-violet-500/15 border-indigo-500/20 shadow-lg shadow-indigo-500/5' : 'bg-slate-500/5 border-slate-500/10'}`}>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('AVERAGE')}</p>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className={`text-4xl font-heading font-black tracking-tight ${isRevealed ? 'bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent animate-pulse-glow' : 'text-slate-300 dark:text-slate-700'}`}>
                  {averageDisplay}
                </span>
                {isRevealed && <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold font-heading">points</span>}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-500/5 border border-slate-500/10">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Vote Progress</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-3xl font-heading font-black text-slate-700 dark:text-slate-200">{finishedCount}/{totalPlayers}</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-400">{Math.round(revealProgress)}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-900 rounded-full mt-3 overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
                <div
                  className="h-full bg-gradient-to-r from-indigo-50 to-violet-50 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-500"
                  style={{
                    width: `${revealProgress}%`,
                    backgroundImage: 'linear-gradient(90deg, var(--color-indigo-500) 0%, var(--color-violet-500) 100%)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Player List */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <PlayerList players={players} game={game} t={t} playerId={currentPlayer?.id || null} />
          </div>

          {/* Card Picker */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <CardPicker
              game={game}
              playerId={currentPlayer?.id || null}
              vote={vote}
              currentPlayer={currentPlayer}
            />
          </div>
        </div>

        {/* Footer controls */}
        <footer className="mt-8 pt-6 border-t border-slate-200/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center px-4 py-2.5 rounded-xl glass-card text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-md font-heading font-semibold text-xs transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <LinkIcon className="w-4 h-4 mr-2" /> {copyStatus}
          </button>

          <div className="inline-flex items-center px-4 py-2 bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-xl text-slate-400 font-mono text-[10px] select-all">
            Game ID: <span className="font-semibold text-slate-500 dark:text-slate-400 ml-1.5">{game.id}</span>
          </div>
        </footer>

      </div>
      <MessageBox message={statusMessage.text} type={statusMessage.type} onClose={clearStatus} />
      {showQRModal && (
        <QRCodeModal
          url={joinUrl}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  );
};

