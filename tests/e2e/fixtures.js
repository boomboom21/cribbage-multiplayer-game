import { test as base, expect } from '@playwright/test';
import axios from 'axios';

const API_URL = 'http://localhost:3002';

export const test = base.extend({
  // Backend API helper
  apiClient: async ({}, use) => {
    const client = {
      async createPlayer(nickname) {
        const res = await axios.post(`${API_URL}/api/players`, { nickname });
        return res.data;
      },
      async getPlayerStats(uuid) {
        const res = await axios.get(`${API_URL}/api/players/${uuid}/stats`);
        return res.data;
      },
      async createGame(player1Uuid, player2Uuid = null) {
        const res = await axios.post(`${API_URL}/api/games`, { 
          player1_uuid: player1Uuid,
          player2_uuid: player2Uuid
        });
        return res.data;
      },
      async joinGame(gameCode, playerUuid) {
        const res = await axios.post(`${API_URL}/api/games/${gameCode}/join`, {
          player_uuid: playerUuid
        });
        return res.data;
      },
      async getGame(gameCode) {
        const res = await axios.get(`${API_URL}/api/games/${gameCode}`);
        return res.data;
      },
      async getHealth() {
        const res = await axios.get(`${API_URL}/api/health`);
        return res.data;
      },
    };
    await use(client);
  },

  // Two-browser context for multiplayer testing
  player1: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  player2: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect };
