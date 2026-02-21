import React from 'react';
import useGameStore from '../store/gameStore';
import styles from './DiscardPhase.module.css';

export default function DiscardPhase() {
  const playerHand = useGameStore(s => s.playerHand);
  const selectedCardIndices = useGameStore(s => s.selectedCardIndices);
  const setToast = useGameStore(s => s.setToast);
  const socket = useGameStore(s => s.socket);
  const player = useGameStore(s => s.player);

  const handleConfirmDiscard = () => {
    if (selectedCardIndices.length !== 2) {
      setToast('Select exactly 2 cards to discard', 'error');
      return;
    }
    const discardedCards = selectedCardIndices.map(idx => playerHand[idx]);
    socket?.emit('discard_cards', { playerUuid: player.uuid, discardedCards });
    setToast('Discard confirmed! Waiting for opponent...', 'info');
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={handleConfirmDiscard}
        disabled={selectedCardIndices.length !== 2}
      >
        {selectedCardIndices.length === 2
          ? `✓ Discard ${selectedCardIndices.length} Cards`
          : `Select 2 cards to discard (${selectedCardIndices.length}/2)`}
      </button>
    </div>
  );
}
