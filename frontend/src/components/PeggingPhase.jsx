import React from 'react';
import useGameStore from '../store/gameStore';
import CardHand from './CardHand';
import styles from './PeggingPhase.module.css';

export default function PeggingPhase() {
  const playerHand = useGameStore((s) => s.playerHand);
  const playedCards = useGameStore((s) => s.playedCards);
  const currentTotal = useGameStore((s) => s.currentTotal);
  const currentTurn = useGameStore((s) => s.currentTurn);
  const player = useGameStore((s) => s.player);
  const socket = useGameStore((s) => s.socket);

  const isPlayerTurn = currentTurn === player?.uuid;

  const handlePlayCard = (index) => {
    if (!isPlayerTurn) return;

    const card = playerHand[index];
    socket?.emit('play_card', {
      playerUuid: player.uuid,
      card,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Pegging</h2>
        <div className={styles.totalDisplay}>
          <span className={styles.label}>Total:</span>
          <span className={styles.value}>{currentTotal}</span>
        </div>
      </div>

      {playedCards && playedCards.length > 0 && (
        <div className={styles.playedCards}>
          <h3>Played Cards</h3>
          <div className={styles.cardsList}>
            {playedCards.map((card, idx) => (
              <span key={idx} className={styles.playedCard}>
                {card.rank}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className={styles.handSection}>
        <h3>{isPlayerTurn ? 'Your Turn - Play a Card' : 'Opponent Playing...'}</h3>
        <CardHand
          cards={playerHand}
          onSelect={isPlayerTurn ? handlePlayCard : undefined}
          disabled={!isPlayerTurn}
        />
      </div>

      <div className={styles.status}>
        {isPlayerTurn ? (
          <span className={styles.yourTurn}>Your Turn</span>
        ) : (
          <span className={styles.waiting}>Waiting for opponent...</span>
        )}
      </div>
    </div>
  );
}
