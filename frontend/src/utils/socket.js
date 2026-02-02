import { io } from 'socket.io-client';

// Socket.IO will connect to same origin (current page) which is proxied by Vite to backend
export function createSocket() {
  return io(undefined, {
    path: '/socket.io',
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
    onCardsDelt,
    onWaitingForDiscard,
    onBothDiscarded,
    onPeggingStarted,
    onPegMoved,
    onPegMoveInvalid,
    onTurnChanged,
    onHandScored,
    onCribScored,
    onGameFinished,
    onOpponentJoined,
    onError,
  } = handlers;

  if (onGameState) socket.on('game_state', onGameState);
  if (onCardsDelt) socket.on('cards_dealt', onCardsDelt);
  if (onWaitingForDiscard) socket.on('waiting_for_discard', onWaitingForDiscard);
  if (onBothDiscarded) socket.on('both_discarded', onBothDiscarded);
  if (onPeggingStarted) socket.on('pegging_started', onPeggingStarted);
  if (onCardPlayed) socket.on('card_played', onCardPlayed);
  if (onPegMoved) socket.on('peg_moved', onPegMoved);
  if (onPegMoveInvalid) socket.on('peg_move_invalid', onPegMoveInvalid);
  if (onTurnChanged) socket.on('turn_changed', onTurnChanged);
  if (onHandScored) socket.on('hand_scored', onHandScored);
  if (onCribScored) socket.on('crib_scored', onCribScored);
  if (onGameFinished) socket.on('game_finished', onGameFinished);
  if (onOpponentJoined) socket.on('opponent_joined', onOpponentJoined);
  if (onError) socket.on('error', onError);
}

export function emitGameAction(socket, action, data) {
  socket.emit(action, data);
}
