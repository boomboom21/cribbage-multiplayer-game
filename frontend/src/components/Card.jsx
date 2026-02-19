import React from 'react';
import styles from './Card.module.css';

const SUITS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const RANKS = {
  A: 'A',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  J: 'J',
  Q: 'Q',
  K: 'K',
};

export default function Card({ suit, rank, value, onClick, selected, disabled, faceDown, className = '' }) {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const suitSymbol = SUITS[suit] || suit;
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const colorClass = isRed ? 'red' : 'black';

  if (faceDown) {
    return (
      <div 
        className={`${styles.card} ${styles.faceDown} ${className}`}
        onClick={handleClick}
      />
    );
  }

  return (
    <div
      className={`${styles.card} ${styles[colorClass]} ${selected ? styles.selected : ''} ${disabled ? styles.disabled : ''} ${className}`}
      onClick={handleClick}
    >
      {/* Top left pip */}
      <div className={styles.cardPip}>
        <span className={styles.pipRank}>{RANKS[rank] || rank}</span>
        <span className={styles.pipSuit}>{suitSymbol}</span>
      </div>

      {/* Center suit */}
      <div className={styles.cardCenter}>
        <span className={styles.centerSuit}>{suitSymbol}</span>
      </div>

      {/* Bottom right pip (rotated) */}
      <div className={`${styles.cardPip} ${styles.bottom}`}>
        <span className={styles.pipRank}>{RANKS[rank] || rank}</span>
        <span className={styles.pipSuit}>{suitSymbol}</span>
      </div>
    </div>
  );
}
