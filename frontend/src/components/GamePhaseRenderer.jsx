import React from 'react';
import useGameStore from '../store/gameStore';
import DealingPhase from './DealingPhase';
import DiscardPhase from './DiscardPhase';
import PeggingPhase from './PeggingPhase';
import CountingPhase from './CountingPhase';
import GameOverPhase from './GameOverPhase';
import styles from './GamePhaseRenderer.module.css';

export default function GamePhaseRenderer() {
  const gamePhase = useGameStore((s) => s.gamePhase);

  return (
    <div className={styles.renderer}>
      {gamePhase === 'welcome' && <div className={styles.placeholder}>Welcome</div>}
      {gamePhase === 'dealing' && <DealingPhase />}
      {gamePhase === 'discard' && <DiscardPhase />}
      {gamePhase === 'pegging' && <PeggingPhase />}
      {gamePhase === 'counting' && <CountingPhase />}
      {gamePhase === 'gameover' && <GameOverPhase />}
    </div>
  );
}
