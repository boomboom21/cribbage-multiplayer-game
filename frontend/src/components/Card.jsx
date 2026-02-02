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

export default function Card({ suit, rank, value, onClick, selected, disabled }) {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const suitSymbol = SUITS[suit] || suit;
  const isRed = suit === 'hearts' || suit === 'diamonds';

  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ''} ${disabled ? styles.disabled : ''}`}
      onClick={handleClick}
      style={{
        color: isRed ? '#ef4444' : '#000',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div className={styles.top}>
        <span className={styles.rank}>{RANKS[rank] || rank}</span>
        <span className={styles.suit}>{suitSymbol}</span>
      </div>
      <div className={styles.center}>
        <span className={styles.largeSuit}>{suitSymbol}</span>
      </div>
      <div className={styles.bottom}>
        <span className={styles.suit}>{suitSymbol}</span>
        <span className={styles.rank}>{RANKS[rank] || rank}</span>
      </div>
      <div className={styles.value}>{value}</div>
    </div>
  );
}
