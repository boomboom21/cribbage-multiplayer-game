import React, { useState, useEffect } from 'react';
import WelcomeScreen from './screens/WelcomeScreen';
import GameLobby from './screens/GameLobby';
import GameBoard from './screens/GameBoard';
import Toast from './components/Toast';
import useGameStore from './store/gameStore';

function App() {
  const { screen, player } = useGameStore();

  return (
    <div className="app">
      {screen === 'welcome' && <WelcomeScreen />}
      {screen === 'lobby' && <GameLobby />}
      {screen === 'game' && <GameBoard />}
      <Toast />
    </div>
  );
}

export default App;
