import React from 'react';
import useGameStore from '../store/gameStore';
import styles from './CountingPhase.module.css';

export default function CountingPhase() {
  const p1Score = useGameStore((s) => s.p1Score);
  const p2Score = useGameStore((s) => s.p2Score);
  const p1Nickname = useGameStore((s) => s.p1Nickname);
  const p2Nickname = useGameStore((s) => s.p2Nickname);

  return (
    <div className={styles.container}>
      <h2>Counting</h2>
      
      <div className={styles.scoringBox}>
        <div className={styles.playerScore}>
          <h3>{p1Nickname || 'Player 1'}</h3>
          <div className={styles.scoreValue}>{p1Score}</div>
        </div>
        
        <span className={styles.vs}>vs</span>
        
        <div className={styles.playerScore}>
          <h3>{p2Nickname || 'Player 2'}</h3>
          <div className={styles.scoreValue}>{p2Score}</div>
        </div>
      </div>

      <div className={styles.message}>
        <p>Scoring hands and crib...</p>
        <span className={styles.spinner}>✨</span>
      </div>
    </div>
  );
}
