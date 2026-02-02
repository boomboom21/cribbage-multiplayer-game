import React from 'react';
import useGameStore from '../store/gameStore';
import PegTrack from './PegTrack';
import styles from './CribbageBoard.module.css';

export default function CribbageBoard() {
  const p1Nickname = useGameStore((s) => s.p1Nickname);
  const p2Nickname = useGameStore((s) => s.p2Nickname);
  const p1Score = useGameStore((s) => s.p1Score);
  const p2Score = useGameStore((s) => s.p2Score);
  const p1PegPosition = useGameStore((s) => s.p1PegPosition);
  const p2PegPosition = useGameStore((s) => s.p2PegPosition);
  const gamePhase = useGameStore((s) => s.gamePhase);

  return (
    <div className={styles.boardContainer}>
      <div className={styles.board}>
        {/* Player 1 Track */}
        <div className={styles.trackRow}>
          <div className={styles.playerLabel}>
            <div className={styles.name}>{p1Nickname || 'Player 1'}</div>
            <div className={styles.score}>{p1Score}</div>
          </div>
          <PegTrack
            pegPosition={p1PegPosition}
            playerColor="#3b82f6"
            playerName="P1"
          />
        </div>

        {/* Center divider */}
        <div className={styles.divider}></div>

        {/* Player 2 Track */}
        <div className={styles.trackRow}>
          <div className={styles.playerLabel}>
            <div className={styles.name}>{p2Nickname || 'Player 2'}</div>
            <div className={styles.score}>{p2Score}</div>
          </div>
          <PegTrack
            pegPosition={p2PegPosition}
            playerColor="#ef4444"
            playerName="P2"
          />
        </div>
      </div>

      {/* Phase indicator */}
      <div className={styles.phaseIndicator}>
        <span className={styles.phase}>
          {gamePhase === 'dealing' && '🎴 Dealing...'}
          {gamePhase === 'discard' && '♦️ Discard'}
          {gamePhase === 'pegging' && '♠️ Pegging'}
          {gamePhase === 'counting' && '🧮 Counting'}
          {gamePhase === 'gameover' && '🏆 Game Over'}
        </span>
      </div>
    </div>
  );
}
