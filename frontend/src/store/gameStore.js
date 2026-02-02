import { create } from 'zustand';

const useGameStore = create((set) => ({
  screen: 'welcome',
  player: null,
  game: null,
  gameCode: null,
  socket: null,
  gameState: null,
  toast: null,
  
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
}));

export default useGameStore;
