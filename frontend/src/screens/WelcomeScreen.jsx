import React, { useState } from 'react';
import axios from 'axios';
import useGameStore from '../store/gameStore';
import styles from './WelcomeScreen.module.css';

export default function WelcomeScreen() {
  const [nickname, setNickname] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('home'); // 'home', 'create', 'join'
  const setPlayer = useGameStore((s) => s.setPlayer);
  const setScreen = useGameStore((s) => s.setScreen);
  const setToast = useGameStore((s) => s.setToast);

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setToast('Please enter a nickname', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/players', {
        nickname: nickname.trim(),
      });
      setPlayer(res.data);
      // After creating player, create a game
      const gameRes = await axios.post('/api/games', {
        playerId: res.data.uuid
      });
      setScreen('game');
      setToast(`Game created! Code: ${gameRes.data.game_code}`, 'success');
    } catch (err) {
      setToast('Failed to create game', 'error');
      console.error('Error:', err.message, err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setToast('Please enter a nickname', 'error');
      return;
    }
    if (!gameCode.trim()) {
      setToast('Please enter a game code', 'error');
      return;
    }

    setLoading(true);
    try {
      // Create player first
      const res = await axios.post('/api/players', {
        nickname: nickname.trim(),
      });
      setPlayer(res.data);
      
      // Then join the game
      await axios.post(`/api/games/${gameCode.trim()}/join`, {
        playerId: res.data.uuid
      });
      setScreen('game');
      setToast('Joined game successfully!', 'success');
    } catch (err) {
      setToast(err.response?.data?.error || 'Failed to join game', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>🎴 Cribbage</h1>
        <p className={styles.subtitle}>Two-Player Multiplayer</p>
        
        {view === 'home' && (
          <div className={styles.buttonGroup}>
            <button 
              className={styles.mainButton}
              onClick={() => setView('create')}
            >
              Create Game
            </button>
            <button 
              className={styles.secondaryButton}
              onClick={() => setView('join')}
            >
              Join Game
            </button>
          </div>
        )}

        {view === 'create' && (
          <form onSubmit={handleCreatePlayer} className={styles.form}>
            <button 
              type="button" 
              className={styles.backButton}
              onClick={() => setView('home')}
            >
              ← Back
            </button>
            <div className={styles.formGroup}>
              <label htmlFor="nickname">Your Nickname</label>
              <input
                id="nickname"
                type="text"
                placeholder="Enter your nickname..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Game'}
            </button>
          </form>
        )}

        {view === 'join' && (
          <form onSubmit={handleJoinGame} className={styles.form}>
            <button 
              type="button" 
              className={styles.backButton}
              onClick={() => setView('home')}
            >
              ← Back
            </button>
            <div className={styles.formGroup}>
              <label htmlFor="nickname">Your Nickname</label>
              <input
                id="nickname"
                type="text"
                placeholder="Enter your nickname..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="gameCode">Game Code</label>
              <input
                id="gameCode"
                type="text"
                placeholder="Enter game code (e.g., CRIB-ABC123)"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Joining...' : 'Join Game'}
            </button>
          </form>
        )}

        <div className={styles.info}>
          <h3>How to Play</h3>
          <ul>
            <li>Create a game and share the code with a friend</li>
            <li>Deal 6 cards, discard 2 to the crib</li>
            <li>Score for 15s, pairs, runs, and flushes</li>
            <li>First to 121 wins!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
