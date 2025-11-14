import { useState } from 'react';
import { Link as LinkIcon, Zap, RotateCw, ChevronDown, ChevronUp } from 'lucide-react';
import type { Game, Player, Language } from '../types';
import { GameStatus, LANGUAGES } from '../constants';
import { CardPicker } from '../components/CardPicker';
import { PlayerList } from '../components/PlayerList';
import { MessageBox } from '../components/MessageBox';

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
}

/**
 * GameSession component displays the active game interface.
 */
export const GameSession = ({ state, actions, setView, t, lang, setLanguage }: GameSessionProps) => {
  const { game, players, currentPlayer, loading, error, finishedCount, totalPlayers, canReveal, canReset } = state;
  const { vote, revealVotes, resetRound, statusMessage, clearStatus } = actions;
  const [copyStatus, setCopyStatus] = useState(t('COPY_LINK'));
  const [showLangMenu, setShowLangMenu] = useState(false);

  if (loading) return <div className="text-center p-8 text-gray-500 dark:text-gray-400">Loading Game...</div>;
  if (error || !game) return <div className="text-center p-8 text-red-500">Error: {error || 'Game data missing.'}</div>;

  const isRevealed = game.game_status === GameStatus.FINISHED;
  const revealProgress = totalPlayers > 0 ? (finishedCount / totalPlayers) * 100 : 0;
  const averageDisplay = isRevealed ? (game.average === null ? t('NO_VOTES') : game.average) : '...';

  const handleCopyLink = async () => {
    const joinUrl = `${window.location.origin}${window.location.pathname}?gameId=${game.id}`;
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
    <div className="min-h-screen p-4 md:p-8 bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Header and Controls */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{t('APP_TITLE')}</h1>
          <div className="flex items-center space-x-3">
            {/* Language Picker */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                title="Change Language"
              >
                {LANGUAGES[lang]}
                {showLangMenu ? <ChevronUp className="w-4 h-4 inline ml-1" /> : <ChevronDown className="w-4 h-4 inline ml-1" />}
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
            {/* Back to Home */}
            <button
              onClick={() => setView('home')}
              className="p-2 px-4 rounded-full bg-indigo-500 text-white shadow hover:bg-indigo-600 transition text-sm"
              title={t('BACK_TO_HOME')}
            >
              {t('BACK_TO_HOME')}
            </button>
          </div>
        </div>

        {/* Game Info and Moderation */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-2xl mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{game.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {t('GAME_CREATED_BY')}: {game.created_by_name} (<span className="text-xs">{game.created_by_id.substring(0, 8)}...</span>)
              </p>
              {game.story_name && (
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  <LinkIcon className="w-4 h-4 inline mr-1" /> {game.story_name}
                </p>
              )}
              <p className={`font-semibold mt-1 ${isRevealed ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                Status: {t(`${game.game_status.toUpperCase()}`)}
              </p>
            </div>

            {/* Moderation Actions */}
            <div className="flex flex-col space-y-2">
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
                  className="flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition shadow-md disabled:opacity-50"
                  disabled={!canReveal}
                  title={!canReveal ? t('NOT_AUTHORIZED') : ''}
                >
                  <Zap className="w-5 h-5 mr-2" /> {t('REVEAL')}
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
                  className="flex items-center justify-center bg-amber-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-600 transition shadow-md disabled:opacity-50"
                  disabled={!canReset}
                  title={!canReset ? t('NOT_AUTHORIZED') : ''}
                >
                  <RotateCw className="w-5 h-5 mr-2" /> {t('RESET_ROUND')}
                </button>
              )}
            </div>
          </div>

          {/* Progress and Average Display */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-indigo-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{t('AVERAGE')}</p>
              <p className="text-3xl font-extrabold mt-1">{averageDisplay}</p>
            </div>
            <div className="bg-indigo-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Vote Progress</p>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-extrabold">{finishedCount}/{totalPlayers}</span>
                <div className="flex-1 h-3 ml-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${revealProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        {/* Footer actions */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={handleCopyLink}
            className="flex items-center bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            <LinkIcon className="w-4 h-4 mr-2" /> {copyStatus}
          </button>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Game ID: <span className="font-mono text-xs">{game.id}</span>
          </p>
        </div>

      </div>
      <MessageBox message={statusMessage.text} type={statusMessage.type} onClose={clearStatus} />
    </div>
  );
};
