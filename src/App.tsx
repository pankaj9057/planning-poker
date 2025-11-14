import { useState, useEffect } from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
import { useSupabase } from './hooks/useSupabase';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './hooks/useLanguage';
import { useGameData } from './hooks/useGameData';
import { useGameActions } from './hooks/useGameActions';
import { HomePage } from './pages/HomePage';
import { GameSession } from './pages/GameSession';
import './App.css';

const App = () => {
  const { supabase, userId, isAuthReady, configError } = useSupabase();
  const { theme, toggleTheme } = useTheme();
  const { lang, t, setLanguage } = useLanguage();
  const gameActions = useGameActions(supabase, userId, t);

  const [view, setView] = useState('home');
  const [gameData, setGameData] = useState({ gameId: null, playerId: null });
  const [initialGameId, setInitialGameId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameIdFromUrl = urlParams.get('gameId');
    if (gameIdFromUrl) {
      setInitialGameId(gameIdFromUrl);
      setView('home');
    }
  }, []);


  const gameSessionState = useGameData(supabase, gameData.gameId, gameData.playerId, t);

  useEffect(() => {
    if (view === 'game' && gameSessionState.error && gameSessionState.error !== 'Game not found.') {
      setView('home');
      gameActions.displayMessage('Connection error or game session issue. Please try again.', 'error');
    } else if (view === 'game' && gameSessionState.error === 'Game not found.') {
      setView('home');
      gameActions.displayMessage('Game not found. Check the ID.', 'error');
    }
  }, [view, gameSessionState.error, gameActions]);

  if (configError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
        <div className="max-w-2xl bg-white dark:bg-gray-900 p-8 rounded-xl shadow-2xl">
          <div className="text-center mb-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Configuration Required</h1>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200 mb-4">{configError}</p>
          </div>
          <div className="space-y-4 text-left text-gray-700 dark:text-gray-300">
            <h2 className="font-bold text-lg">Setup Instructions:</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Create a Supabase project</li>
              <li>Run the SQL schema from supabase-schema.sql</li>
              <li>Enable Anonymous authentication</li>
              <li>Get your credentials from Project Settings</li>
              <li>Update the .env file with your credentials</li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="text-center p-8 text-gray-500 dark:text-gray-400">
          <RotateCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-500" />
          Authenticating...
        </div>
      </div>
    );
  }

  const commonProps = {
    setView,
    setGameData,
    actions: gameActions,
    t,
    lang,
    setLanguage,
    toggleTheme,
    theme,
  };

  switch (view) {
    case 'game':
      return <GameSession state={gameSessionState} {...commonProps} />;
    case 'home':
    default:
      return <HomePage {...commonProps} initialGameId={initialGameId} />;
  }
};

export default App;
