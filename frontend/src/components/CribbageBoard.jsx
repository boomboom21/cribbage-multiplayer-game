import React from 'react';
import useGameStore from '../store/gameStore';
import PegTrack from './PegTrack';
import styles from './CribbageBoard.module.css';

const SUITS = {
  hearts: { symbol: '♥️', color: '#ef4444' },
  diamonds: { symbol: '♦️', color: '#ef4444' },
  spades: { symbol: '♠️', color: '#1a1a1a' },
  clubs: { symbol: '♣️', color: '#1a1a1a' },
};

// Placeholder cards to show when no game is active
const PLACEHOLDER_HAND = [
  { rank: 'A', suit: 'spades' },
  { rank: 'K', suit: 'hearts' },
  { rank: 'Q', suit: 'clubs' },
  { rank: 'J', suit: 'diamonds' },
  { rank: '10', suit: 'spades' },
  { rank: '9', suit: 'hearts' },
];

const PlayingCard = ({ card, faceDown, onClick, selected }) => {
  if (faceDown) {
    return (
      <div className={styles.cardBack}>
        <div className={styles.cardInner}>🎴</div>
      </div>
    );
  }

  const { symbol, color } = SUITS[card.suit.toLowerCase()] || { symbol: card.suit, color: '#000' };

  return (
    <div 
      className={`${styles.card} ${selected ? styles.selected : ''}`} 
      onClick={onClick}
      style={{ color }}
    >
      <div className={styles.cardCornerTop}>
        <div className={styles.cardRank}>{card.rank}</div>
        <div className={styles.cardSuitSmall}>{symbol}</div>
      </div>
      <div className={styles.cardCenter}>{symbol}</div>
      <div className={styles.cardCornerBottom}>
        <div className={styles.cardRank}>{card.rank}</div>
        <div className={styles.cardSuitSmall}>{symbol}</div>
      </div>
    </div>
  );
};

export default function CribbageBoard() {
  const {
    p1Score, p1PegPosition, p2Score, p2PegPosition,
    playerHand, opponentHand, gamePhase, currentTurn,
    playedCards, cribCards, toggleCardSelection, selectedCardIndices,
    p1Nickname, p2Nickname
  } = useGameStore();

  // Use placeholder cards when hands are empty (no game started yet)
  const displayOpponentHand = opponentHand.length > 0 ? opponentHand : PLACEHOLDER_HAND;
  const displayPlayerHand = playerHand.length > 0 ? playerHand : PLACEHOLDER_HAND;

  return (
    <div className={styles.container}>
      {/* Board Section */}
      <div className={styles.boardSection}>
        <PegTrack 
          p1={p1PegPosition} 
          p1b={Math.max(0, p1PegPosition - 1)}
          p2={p2PegPosition} 
          p2b={Math.max(0, p2PegPosition - 1)} 
        />
      </div>

      {/* Card Play Area */}
      <div className={styles.playArea}>
        {/* Opponent Hand */}
        <div className={styles.opponentSection}>
          <div className={styles.sectionLabel}>
            {p2Nickname || 'Opponent'}'s Hand 
            {opponentHand.length === 0 && <span className={styles.waitingLabel}> (waiting)</span>}
          </div>
          <div className={styles.hand}>
            {displayOpponentHand.map((c, i) => (
              <PlayingCard key={i} card={c} faceDown={opponentHand.length === 0 || true} />
            ))}
          </div>
        </div>

        {/* Center: Crib and Play Pile */}
        <div className={styles.centerSection}>
          <div className={styles.pileContainer}>
            <div className={styles.sectionLabel}>Play Area</div>
            <div className={styles.playPile}>
              {playedCards.length > 0 ? (
                playedCards.map((c, i) => (
                  <div key={i} className={styles.stackedCard}>
                    <PlayingCard card={c} />
                  </div>
                ))
              ) : (
                <div className={styles.emptySlot}>—</div>
              )}
            </div>
          </div>
          <div className={styles.pileContainer}>
            <div className={styles.sectionLabel}>Crib</div>
            <div className={styles.cribPile}>
              {cribCards.length > 0 ? (
                <PlayingCard card={cribCards[0]} faceDown={true} />
              ) : (
                <div className={styles.emptySlot}>CRIB</div>
              )}
            </div>
          </div>
        </div>

        {/* Player Hand */}
        <div className={styles.playerSection}>
          <div className={styles.sectionLabel}>
            Your Hand 
            {gamePhase === 'discard' && '(Select 2 to Discard)'}
            {playerHand.length === 0 && <span className={styles.waitingLabel}> (waiting for deal)</span>}
          </div>
          <div className={styles.hand}>
            {displayPlayerHand.map((c, i) => (
              <PlayingCard 
                key={i} 
                card={c} 
                selected={selectedCardIndices.includes(i)}
                onClick={() => playerHand.length > 0 ? toggleCardSelection(i) : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}