import React from 'react';
import Card from './Card';
import styles from './CardHand.module.css';
import animStyles from './Animations.module.css';

export default function CardHand({ 
  cards, 
  selectedIndices = [], 
  onSelect, 
  disabled = false, 
  label = 'Your Hand',
  isDealing = false
}) {
  const handleCardClick = (index) => {
    if (onSelect) {
      onSelect(index);
    }
  };

  return (
    <div className={styles.hand}>
      {label && <div className={styles.handLabel}>{label}</div>}
      
      {cards && cards.length > 0 ? (
        cards.map((card, index) => (
          <div 
            key={index}
            className={`${isDealing ? animStyles.cardDealing : ''} ${animStyles[`dealDelay${index + 1}`] || ''}`}
          >
            <Card
              suit={card.suit}
              rank={card.rank}
              value={card.value}
              selected={selectedIndices.includes(index)}
              disabled={disabled}
              onClick={() => handleCardClick(index)}
            />
          </div>
        ))
      ) : (
        <p className={styles.empty}>No cards</p>
      )}
      
      {cards && cards.length > 0 && (
        <div className={styles.cardCount}>{cards.length}</div>
      )}
      
      {!disabled && cards && cards.length > 0 && (
        <div className={styles.selectionHint}>
          {selectedIndices.length < 2 ? 'Select cards to discard' : 'Ready to confirm'}
        </div>
      )}
    </div>
  );
}
