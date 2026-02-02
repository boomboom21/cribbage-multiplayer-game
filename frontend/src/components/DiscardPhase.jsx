import React, { useEffect } from 'react';
import useGameStore from '../store/gameStore';
import CardHand from './CardHand';
import styles from './DiscardPhase.module.css';

export default function DiscardPhase() {
  const playerHand = useGameStore((s) => s.playerHand);
  const selectedCardIndices = useGameStore((s) => s.selectedCardIndices);
  const toggleCardSelection = useGameStore((s) => s.toggleCardSelection);
  const setToast = useGameStore((s) => s.setToast);
  const socket = useGameStore((s) => s.socket);
  const player = useGameStore((s) => s.player);

  const handleConfirmDiscard = () => {
    if (selectedCardIndices.length !== 2) {
      setToast('Select exactly 2 cards to discard', 'error');
      return;
    }

    // Get the selected cards
    const discardedCards = selectedCardIndices.map((idx) => playerHand[idx]);

    // Emit to backend
    socket?.emit('discard_cards', {
      playerUuid: player.uuid,
      discardedCards,
    });

    setToast('Discard confirmed! Waiting for opponent...', 'info');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Select 2 Cards to Discard</h2>
        <p className={styles.subtitle}>These will go to the crib</p>
      </div>

      <CardHand
        cards={playerHand}
        selectedIndices={selectedCardIndices}
        onSelect={toggleCardSelection}
      />

      <div className={styles.selectedDisplay}>
        <h3>Selected: {selectedCardIndices.length}/2</h3>
        {selectedCardIndices.length > 0 && (
          <div className={styles.selectedCards}>
            {selectedCardIndices.map((idx) => {
              const card = playerHand[idx];
              return (
                <span key={idx} className={styles.selectedCard}>
                  {card.rank}♥
                </span>
              );
            })}
          </div>
        )}
      </div>

      <button
        className={styles.button}
        onClick={handleConfirmDiscard}
        disabled={selectedCardIndices.length !== 2}
      >
        {selectedCardIndices.length === 2 ? 'Confirm Discard' : 'Select 2 Cards'}
      </button>
    </div>
  );
}
