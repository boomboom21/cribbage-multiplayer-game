import React from 'react';
import useGameStore from '../store/gameStore';
import styles from './GameOverPhase.module.css';

export default function GameOverPhase() {
  const p1Score = useGameStore((s) => s.p1Score);
  const p2Score = useGameStore((s) => s.p2Score);
  const p1Nickname = useGameStore((s) => s.p1Nickname);
  const p2Nickname = useGameStore((s) => s.p2Nickname);
  const player = useGameStore((s) => s.player);

  const isWinner = p1Score > p2Score ? 'P1' : 'P2';
  const playerWon = (isWinner === 'P1' && player?.uuid) || (isWinner === 'P2' && player?.uuid);

  return (
    <div className={styles.container}>
      <div className={styles.trophy}>🏆</div>
      
      <h1 className={styles.title}>
        {playerWon ? 'You Won!' : 'Game Over'}
      </h1>

      <div className={styles.finalScores}>
        <div className={styles.scoreCard}>
          <h2>{p1Nickname || 'Player 1'}</h2>
          <div className={styles.score}>{p1Score}</div>
        </div>
        
        <span className={styles.divider}>-</span>
        
        <div className={styles.scoreCard}>
          <h2>{p2Nickname || 'Player 2'}</h2>
          <div className={styles.score}>{p2Score}</div>
        </div>
      </div>

      <div className={styles.winner}>
        <p>Winner: <strong>{isWinner === 'P1' ? p1Nickname : p2Nickname}</strong></p>
      </div>

      <button
        className={styles.button}
        onClick={() => window.location.reload()}
      >
        Play Again
      </button>
    </div>
  );
}
