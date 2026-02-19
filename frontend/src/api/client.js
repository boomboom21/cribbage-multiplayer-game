import axios from 'axios';

// Use relative API URLs - Vite dev proxy will forward to backend
const API_URL = '/api';

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Players
export async function createPlayer(nickname) {
  const res = await client.post('/players', { nickname });
  return res.data;
}

export async function getPlayerStats(uuid) {
  const res = await client.get(`/players/${uuid}/stats`);
  return res.data;
}

// Games
export async function createGame(playerId) {
  const res = await client.post('/games', { playerId });
  return res.data;
}

export async function joinGame(gameCode, playerId) {
  const res = await client.post(`/games/${gameCode}/join`, { playerId });
  return res.data;
}

export async function getGame(gameCode) {
  const res = await client.get(`/games/${gameCode}`);
  return res.data;
}

export async function checkHealth() {
  const res = await client.get('/health');
  return res.data;
}

export default client;
