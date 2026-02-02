import React, { useState } from 'react';
import axios from 'axios';
import useGameStore from '../store/gameStore';
import styles from './WelcomeScreen.module.css';

export default function WelcomeScreen() {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const res = await axios.post(`${apiUrl}/api/players`, {
        nickname: nickname.trim(),
      });
      setPlayer(res.data);
      setScreen('lobby');
      setToast(`Welcome, ${nickname}!`, 'success');
    } catch (err) {
      setToast('Failed to create player', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>🎴 Cribbage</h1>
        <p className={styles.subtitle}>Two-Player Multiplayer</p>
        
        <form onSubmit={handleCreatePlayer} className={styles.form}>
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
            {loading ? 'Creating...' : 'Start Playing'}
          </button>
        </form>

        <div className={styles.info}>
          <h3>How to Play</h3>
          <ul>
            <li>Create a game and share the code with a friend</li>
            <li>Deal 6 cards, discard 2 to the crib</li>
            <li>Score for 15s, pairs, runs, and flushes</li>
            <li>Manually move your pegs as you score</li>
            <li>First to 121 wins!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
