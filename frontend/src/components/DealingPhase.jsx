import React, { useEffect } from 'react';
import useGameStore from '../store/gameStore';
import CardHand from './CardHand';
import styles from './DealingPhase.module.css';

export default function DealingPhase() {
  const playerHand = useGameStore((s) => s.playerHand);

  return (
    <div className={styles.container}>
      <div className={styles.animation}>
        <span className={styles.spinner}>🎴</span>
      </div>
      <h2>Dealing Cards...</h2>
      <p>You received 6 cards</p>
      {playerHand && playerHand.length > 0 && (
        <CardHand cards={playerHand} disabled={true} />
      )}
    </div>
  );
}
