import { create } from 'zustand';

const useGameStore = create((set) => ({
  screen: 'welcome',
  player: null,
  game: null,
  gameCode: null,
  socket: null,
  gameState: null,
  toast: null,
  
  // Game phases
  gamePhase: 'welcome', // welcome, dealing, discard, pegging, counting, gameover
  playerHand: [], // 6 cards initially
  discardedCards: [], // 2 cards to crib
  cribCards: [], // 4 in crib
  playedCards: [], // cards played in pegging
  currentTotal: 0, // running total
  p1Score: 0,
  p2Score: 0,
  p1PegPosition: 0,
  p2PegPosition: 0,
  p1Nickname: null,
  p2Nickname: null,
  currentTurn: null,
  selectedCardIndices: [], // for selecting 2 to discard
  
  // Base setters
  setScreen: (screen) => set({ screen }),
  setPlayer: (player) => set({ player }),
  setGame: (game) => set({ game }),
  setGameCode: (gameCode) => set({ gameCode }),
  setSocket: (socket) => set({ socket }),
  setGameState: (gameState) => set({ gameState }),
  setToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },
  
  // Game phase setters
  setGamePhase: (phase) => set({ gamePhase: phase }),
  setPlayerHand: (hand) => set({ playerHand: hand }),
  toggleCardSelection: (index) => set((state) => {
    const selected = [...state.selectedCardIndices];
    const idx = selected.indexOf(index);
    if (idx > -1) {
      selected.splice(idx, 1);
    } else if (selected.length < 2) {
      selected.push(index);
    }
    return { selectedCardIndices: selected };
  }),
  setDiscardedCards: (cards) => set({ discardedCards: cards }),
  setCribCards: (cards) => set({ cribCards: cards }),
  setPlayedCards: (cards) => set({ playedCards: cards }),
  setCurrentTotal: (total) => set({ currentTotal: total }),
  setP1Score: (score) => set({ p1Score: score }),
  setP2Score: (score) => set({ p2Score: score }),
  setP1PegPosition: (pos) => set({ p1PegPosition: pos }),
  setP2PegPosition: (pos) => set({ p2PegPosition: pos }),
  setP1Nickname: (name) => set({ p1Nickname: name }),
  setP2Nickname: (name) => set({ p2Nickname: name }),
  setCurrentTurn: (turn) => set({ currentTurn: turn }),
  clearSelectedCards: () => set({ selectedCardIndices: [] }),
}));

export default useGameStore;
