import React, { useEffect, useState } from 'react';
import Phaser from 'phaser';
import useGameStore from '../store/gameStore';
import CribbageBoard from '../components/CribbageBoard';
import styles from './GameBoard.module.css';

export default function GameBoard() {
  const [phaserGame, setPhaserGame] = useState(null);
  const gameCode = useGameStore((s) => s.gameCode);
  const player = useGameStore((s) => s.player);
  const socket = useGameStore((s) => s.socket);
  const gameState = useGameStore((s) => s.gameState);
  const setGameState = useGameStore((s) => s.setGameState);
  const setToast = useGameStore((s) => s.setToast);

  useEffect(() => {
    if (!socket) return;

    socket.on('game_state', (state) => {
      setGameState(state);
    });

    socket.on('card_played', (data) => {
      setGameState(data.gameState);
      if (data.score > 0) {
        setToast(`Scored ${data.score} points!`, 'success');
      }
    });

    socket.on('peg_moved', (data) => {
      setGameState(data.gameState);
    });

    socket.on('peg_move_invalid', (validation) => {
      setToast(validation.message, 'error');
    });

    socket.on('turn_changed', (data) => {
      // Highlight whose turn it is
    });

    socket.on('game_finished', (data) => {
      setToast(
        data.winner === player.id 
          ? 'You won! 🎉' 
          : 'Opponent won!',
        'info'
      );
    });

    socket.on('error', (message) => {
      setToast(message, 'error');
    });

    return () => {
      socket.off('game_state');
      socket.off('card_played');
      socket.off('peg_moved');
      socket.off('turn_changed');
      socket.off('game_finished');
      socket.off('error');
    };
  }, [socket, player, setGameState, setToast]);

  return (
    <div className={styles.container}>
      <div className={styles.gameCode}>
        Code: <strong>{gameCode}</strong>
      </div>
      
      <div className={styles.board}>
        <CribbageBoard />
      </div>

      <div className={styles.info}>
        <div className={styles.playerInfo}>
          <h3>{player?.nickname}</h3>
          <p>Score: {gameState?.p1Score || 0}</p>
        </div>
        <div className={styles.status}>
          <p>Phase: {gameState?.phase || 'deal'}</p>
        </div>
      </div>
    </div>
  );
}
