import { query } from '../db.js';

function generateGameCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createGame(player1Id) {
  const gameCode = generateGameCode();
  const result = await query(
    `INSERT INTO games (game_code, player1_id, status) 
     VALUES ($1, $2, 'waiting') 
     RETURNING id, game_code, player1_id, player2_id, p1_score, p2_score, status, created_at`,
    [gameCode, player1Id]
  );
  return result.rows[0];
}

export async function getGameByCode(gameCode) {
  const result = await query(
    `SELECT id, game_code, player1_id, player2_id, winner_id, p1_score, p2_score, status, 
            current_turn, game_state, created_at, finished_at 
     FROM games WHERE game_code = $1`,
    [gameCode]
  );
  return result.rows[0];
}

export async function joinGame(gameCode, player2Id) {
  const result = await query(
    `UPDATE games 
     SET player2_id = $1, status = 'dealing' 
     WHERE game_code = $2 AND player2_id IS NULL
     RETURNING id, game_code, player1_id, player2_id, p1_score, p2_score, status, created_at`,
    [player2Id, gameCode]
  );
  return result.rows[0];
}

export async function updateGameState(gameId, gameState, p1Score, p2Score, currentTurn) {
  const result = await query(
    `UPDATE games 
     SET game_state = $1, p1_score = $2, p2_score = $3, current_turn = $4
     WHERE id = $5
     RETURNING id, game_code, player1_id, player2_id, p1_score, p2_score, status, current_turn`,
    [JSON.stringify(gameState), p1Score, p2Score, currentTurn, gameId]
  );
  return result.rows[0];
}

export async function finishGame(gameId, winnerId, p1Score, p2Score) {
  const result = await query(
    `UPDATE games 
     SET status = 'finished', winner_id = $1, p1_score = $2, p2_score = $3, finished_at = NOW()
     WHERE id = $4
     RETURNING id, game_code, player1_id, player2_id, winner_id, p1_score, p2_score, status, finished_at`,
    [winnerId, p1Score, p2Score, gameId]
  );
  return result.rows[0];
}

export async function getGameById(gameId) {
  const result = await query(
    `SELECT id, game_code, player1_id, player2_id, winner_id, p1_score, p2_score, status, 
            current_turn, game_state, created_at, finished_at 
     FROM games WHERE id = $1`,
    [gameId]
  );
  return result.rows[0];
}
