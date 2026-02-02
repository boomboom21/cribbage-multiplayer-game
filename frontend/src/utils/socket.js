import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function createSocket() {
  return io(SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });
}

export function setupGameListeners(socket, handlers) {
  const {
    onGameState,
    onCardPlayed,
    onPegMoved,
    onPegMoveInvalid,
    onTurnChanged,
    onGameFinished,
    onOpponentJoined,
    onError,
  } = handlers;

  if (onGameState) socket.on('game_state', onGameState);
  if (onCardPlayed) socket.on('card_played', onCardPlayed);
  if (onPegMoved) socket.on('peg_moved', onPegMoved);
  if (onPegMoveInvalid) socket.on('peg_move_invalid', onPegMoveInvalid);
  if (onTurnChanged) socket.on('turn_changed', onTurnChanged);
  if (onGameFinished) socket.on('game_finished', onGameFinished);
  if (onOpponentJoined) socket.on('opponent_joined', onOpponentJoined);
  if (onError) socket.on('error', onError);
}

export function emitGameAction(socket, action, data) {
  socket.emit(action, data);
}
