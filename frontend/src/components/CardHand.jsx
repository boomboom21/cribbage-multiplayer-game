import React from 'react';
import Card from './Card';
import styles from './CardHand.module.css';

export default function CardHand({ cards, selectedIndices = [], onSelect, disabled = false }) {
  const handleCardClick = (index) => {
    if (onSelect) {
      onSelect(index);
    }
  };

  return (
    <div className={styles.hand}>
      {cards && cards.length > 0 ? (
        cards.map((card, index) => (
          <Card
            key={index}
            suit={card.suit}
            rank={card.rank}
            value={card.value}
            selected={selectedIndices.includes(index)}
            disabled={disabled}
            onClick={() => handleCardClick(index)}
          />
        ))
      ) : (
        <p className={styles.empty}>No cards</p>
      )}
    </div>
  );
}
