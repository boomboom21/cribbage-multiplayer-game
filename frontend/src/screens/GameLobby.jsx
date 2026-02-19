import React, { useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import useGameStore from '../store/gameStore';
import styles from './GameLobby.module.css';

export default function GameLobby() {
  const [mode, setMode] = useState(null); // 'create' or 'join'
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const player = useGameStore((s) => s.player);
  const setGame = useGameStore((s) => s.setGame);
  const setGameCode = useGameStore((s) => s.setGameCode);
  const setSocket = useGameStore((s) => s.setSocket);
  const setScreen = useGameStore((s) => s.setScreen);
  const setToast = useGameStore((s) => s.setToast);

  const handleCreateGame = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/games', {
        playerId: player.id,
      });
      setGameCode(res.data.game_code);
      setGame(res.data);
      
      // Connect socket
      const socket = io();
      setSocket(socket);
      
      socket.emit('join_game', {
        gameCode: res.data.game_code,
        playerId: player.id,
      });
      
      setToast(`Game created! Code: ${res.data.game_code}`, 'success');
      setScreen('game');
    } catch (err) {
      setToast('Failed to create game', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!joinCode.trim()) {
      setToast('Please enter a game code', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `/api/games/${joinCode.toUpperCase()}/join`,
        { playerId: player.id }
      );
      
      setGameCode(res.data.game_code);
      setGame(res.data);
      
      // Connect socket
      const socket = io();
      setSocket(socket);
      
      socket.emit('join_game', {
        gameCode: res.data.game_code,
        playerId: player.id,
      });
      
      setToast('Joined game!', 'success');
      setScreen('game');
    } catch (err) {
      setToast('Failed to join game (check code?)', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>Welcome, {player?.nickname}!</h2>
        <p className={styles.subtitle}>Start a new game or join an existing one</p>

        {!mode ? (
          <div className={styles.modeSelect}>
            <button 
              onClick={() => setMode('create')}
              className={styles.primaryBtn}
              disabled={loading}
            >
              Create New Game
            </button>
            <button 
              onClick={() => setMode('join')}
              className={styles.secondaryBtn}
              disabled={loading}
            >
              Join Game
            </button>
          </div>
        ) : mode === 'create' ? (
          <div className={styles.gameMode}>
            <h3>Create a Game</h3>
            <p>Send the game code to your opponent to let them join!</p>
            <button 
              onClick={handleCreateGame}
              disabled={loading}
              className={styles.actionBtn}
            >
              {loading ? 'Creating...' : 'Create Game'}
            </button>
            <button 
              onClick={() => setMode(null)}
              className={styles.backBtn}
            >
              Back
            </button>
          </div>
        ) : (
          <div className={styles.gameMode}>
            <h3>Join a Game</h3>
            <input
              type="text"
              placeholder="Enter 6-letter game code..."
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              disabled={loading}
              maxLength={6}
              autoFocus
            />
            <button 
              onClick={handleJoinGame}
              disabled={loading}
              className={styles.actionBtn}
            >
              {loading ? 'Joining...' : 'Join Game'}
            </button>
            <button 
              onClick={() => setMode(null)}
              className={styles.backBtn}
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
