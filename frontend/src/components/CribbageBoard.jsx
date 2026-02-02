import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import useGameStore from '../store/gameStore';
import CribbageBoardScene from '../scenes/CribbageBoardScene';

export default function CribbageBoard() {
  const gameRef = useRef(null);
  const containerRef = useRef(null);
  const gameCode = useGameStore((s) => s.gameCode);
  const player = useGameStore((s) => s.player);
  const socket = useGameStore((s) => s.socket);
  const gameState = useGameStore((s) => s.gameState);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create Phaser game
    const config = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 800,
      height: 600,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
          gravity: { y: 0 },
        },
      },
      scene: [CribbageBoardScene],
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }
    };
  }, []);

  // Update scene with game state
  useEffect(() => {
    if (!gameRef.current || !gameState) return;

    const scene = gameRef.current.scene.getScene(CribbageBoardScene.key);
    if (scene) {
      scene.updateGameState(gameState, player.id);
    }
  }, [gameState, player]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
