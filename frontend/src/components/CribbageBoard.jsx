import React from 'react';
import useGameStore from '../store/gameStore';
import PegTrack from './PegTrack';
import styles from './CribbageBoard.module.css';

const PHASES = [
  { id: 'dealing', label: 'Deal', icon: '🎴' },
  { id: 'discard', label: 'Discard', icon: '✂️' },
  { id: 'pegging', label: 'Peg', icon: '🎯' },
  { id: 'counting', label: 'Count', icon: '🧮' },
];

export default function CribbageBoard() {
  const p1Nickname = useGameStore((s) => s.p1Nickname);
  const p2Nickname = useGameStore((s) => s.p2Nickname);
  const p1Score = useGameStore((s) => s.p1Score);
  const p2Score = useGameStore((s) => s.p2Score);
  const p1PegPosition = useGameStore((s) => s.p1PegPosition);
  const p2PegPosition = useGameStore((s) => s.p2PegPosition);
  const p1PrevPosition = useGameStore((s) => s.p1PrevPosition || 0);
  const p2PrevPosition = useGameStore((s) => s.p2PrevPosition || 0);
  const gamePhase = useGameStore((s) => s.gamePhase);
  const currentTurn = useGameStore((s) => s.currentTurn);
  const player = useGameStore((s) => s.player);
  const gameCode = useGameStore((s) => s.gameCode);
  const cribCards = useGameStore((s) => s.cribCards);

  // Determine whose turn it is
  const currentPlayerUuid = player?.uuid;
  const isMyTurn = currentTurn === currentPlayerUuid;
  
  // Get current phase index
  const currentPhaseIndex = PHASES.findIndex(p => p.id === gamePhase);
  
  // Get crib card count
  const cribCount = cribCards?.length || 0;

  return (
    <div className={styles.boardWrapper}>
      {/* Score Headers */}
      <div className={styles.scoreHeader}>
        <div className={`${styles.playerScoreBox} ${styles.p1}`}>
          <div className={styles.playerAvatar}>P1</div>
          <div className={styles.playerInfo}>
            <span className={styles.playerName}>{p1Nickname || 'Player 1'}</span>
            <span className={styles.playerPoints}>{p1Score}</span>
          </div>
        </div>
        
        <div className={styles.vsBox}>
          <span className={styles.vsText}>VS</span>
          {gameCode && <span className={styles.gameCode}>Game: {gameCode}</span>}
        </div>
        
        <div className={`${styles.playerScoreBox} ${styles.p2}`}>
          <div className={styles.playerAvatar}>P2</div>
          <div className={styles.playerInfo}>
            <span className={styles.playerName}>{p2Nickname || 'Player 2'}</span>
            <span className={styles.playerPoints}>{p2Score}</span>
          </div>
        </div>
      </div>

      {/* The Cribbage Board */}
      <div className={styles.cribbageBoard}>
        <PegTrack
          p1CurrentPosition={p1PegPosition}
          p1PreviousPosition={p1PrevPosition}
          p2CurrentPosition={p2PegPosition}
          p2PreviousPosition={p2PrevPosition}
        />
      </div>

      {/* Crib Indicator */}
      {cribCount > 0 && (
        <div className={styles.cribIndicator}>
          <span className={styles.cribIcon}>📦</span>
          <span>Crib: <span className={styles.cribCount}>{cribCount}</span> cards</span>
        </div>
      )}

      {/* Turn Banner */}
      {gamePhase === 'pegging' && (
        <div className={styles.turnBanner}>
          <span className={styles.turnDot}></span>
          <span style={{ color: '#93c5fd', fontWeight: 600 }}>
            {isMyTurn ? "Your Turn!" : `${p2Nickname || 'Opponent'}'s Turn`}
          </span>
        </div>
      )}

      {/* Phase Indicator */}
      <div className={styles.phaseBar}>
        {PHASES.map((phase, index) => {
          let status = '';
          if (gamePhase === phase.id) status = 'active';
          else if (index < currentPhaseIndex) status = 'completed';
          
          return (
            <div key={phase.id} className={`${styles.phaseStep} ${styles[status]}`}>
              <span className={styles.stepNum}>{index + 1}</span>
              <span>{phase.icon}</span>
              <span>{phase.label}</span>
            </div>
          );
        })}
        <div className={`${styles.phaseStep} ${gamePhase === 'gameover' ? styles.active : ''}`}>
          <span className={styles.stepNum}>5</span>
          <span>🏆</span>
          <span>End</span>
        </div>
      </div>
    </div>
  );
}
