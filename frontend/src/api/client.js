import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Players
export async function createPlayer(nickname) {
  const res = await client.post('/api/players', { nickname });
  return res.data;
}

export async function getPlayerStats(uuid) {
  const res = await client.get(`/api/players/${uuid}/stats`);
  return res.data;
}

// Games
export async function createGame(playerId) {
  const res = await client.post('/api/games', { playerId });
  return res.data;
}

export async function joinGame(gameCode, playerId) {
  const res = await client.post(`/api/games/${gameCode}/join`, { playerId });
  return res.data;
}

export async function getGame(gameCode) {
  const res = await client.get(`/api/games/${gameCode}`);
  return res.data;
}

export async function checkHealth() {
  const res = await client.get('/api/health');
  return res.data;
}

export default client;
