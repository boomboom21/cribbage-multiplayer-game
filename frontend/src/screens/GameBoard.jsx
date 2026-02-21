import React, { useEffect } from 'react';
import useGameStore from '../store/gameStore';
import { setupGameListeners } from '../utils/socket';
import GamePhaseRenderer from '../components/GamePhaseRenderer';
import CribbageBoard from '../components/CribbageBoard';
import styles from './GameBoard.module.css';

export default function GameBoard() {
  const gameCode = useGameStore((s) => s.gameCode);
  const player = useGameStore((s) => s.player);
  const socket = useGameStore((s) => s.socket);
  const gamePhase = useGameStore((s) => s.gamePhase);
  const setGamePhase = useGameStore((s) => s.setGamePhase);
  const setToast = useGameStore((s) => s.setToast);
  const setPlayerHand = useGameStore((s) => s.setPlayerHand);
  const setP1Score = useGameStore((s) => s.setP1Score);
  const setP2Score = useGameStore((s) => s.setP2Score);
  const setP1PegPosition = useGameStore((s) => s.setP1PegPosition);
  const setP2PegPosition = useGameStore((s) => s.setP2PegPosition);
  const setCurrentTurn = useGameStore((s) => s.setCurrentTurn);
  const setP1Nickname = useGameStore((s) => s.setP1Nickname);
  const setP2Nickname = useGameStore((s) => s.setP2Nickname);
  const setPlayedCards = useGameStore((s) => s.setPlayedCards);
  const setCurrentTotal = useGameStore((s) => s.setCurrentTotal);
  const setCribCards = useGameStore((s) => s.setCribCards);

  useEffect(() => {
    if (!socket) return;

    setupGameListeners(socket, {
      onCardsDelt: (data) => {
        setPlayerHand(data.playerHand || data.hand || []);
        setP1Nickname(data.p1Nickname);
        setP2Nickname(data.p2Nickname);
        setGamePhase('discard');
      },
      onWaitingForDiscard: () => {
        setGamePhase('discard');
      },
      onBothDiscarded: (data) => {
        setPlayerHand(data.playerHand || data.hand || []);
        setCribCards(data.cribCards || data.crib || []);
        setGamePhase('pegging');
      },
      onPeggingStarted: () => {
        setGamePhase('pegging');
      },
      onCardPlayed: (data) => {
        setPlayedCards(data.playedCards || []);
        setCurrentTotal(data.runningTotal || data.currentTotal || 0);
        setCurrentTurn(data.nextTurn);
        if (data.score > 0) {
          setToast(`+${data.score} points!`, 'success');
        }
      },
      onHandScored: (data) => {
        const isP1 = data.playerUuid === player?.uuid;
        if (isP1) setP1Score(data.score);
        else setP2Score(data.score);
        setP1PegPosition(data.p1PegPosition || 0);
        setP2PegPosition(data.p2PegPosition || 0);
        setToast(`+${data.score} points!`, 'success');
      },
      onCribScored: (data) => {
        const isP1 = data.dealerUuid === player?.uuid;
        if (isP1) setP1Score(data.score);
        else setP2Score(data.score);
        setP1PegPosition(data.p1PegPosition || 0);
        setP2PegPosition(data.p2PegPosition || 0);
        setToast(`Crib: +${data.score}`, 'success');
      },
      onGameFinished: (data) => {
        setP1Score(data.p1Score);
        setP2Score(data.p2Score);
        setGamePhase('gameover');
        setToast(
          data.winner === player?.uuid ? 'You won! 🎉' : 'Opponent won!',
          'info'
        );
      },
      onError: (message) => {
        setToast(message, 'error');
      },
    });

    return () => {
      socket.off('cards_dealt');
      socket.off('waiting_for_discard');
      socket.off('both_discarded');
      socket.off('pegging_started');
      socket.off('card_played');
      socket.off('hand_scored');
      socket.off('crib_scored');
      socket.off('game_finished');
      socket.off('error');
    };
  }, [
    socket,
    player,
    setGamePhase,
    setPlayerHand,
    setToast,
    setP1Score,
    setP2Score,
    setP1PegPosition,
    setP2PegPosition,
    setCurrentTurn,
    setP1Nickname,
    setP2Nickname,
    setPlayedCards,
    setCurrentTotal,
    setCribCards,
  ]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🎴 Cribbage</h1>
        <span className={styles.gameCode}>Code: {gameCode}</span>
      </div>

      <div className={styles.gameArea}>
        <CribbageBoard />
      </div>
    </div>
  );
}
