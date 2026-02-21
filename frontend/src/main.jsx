import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import useGameStore from './store/gameStore';

// Expose store in dev for Playwright testing
if (import.meta.env.DEV) {
  window.__gameStore = useGameStore;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
