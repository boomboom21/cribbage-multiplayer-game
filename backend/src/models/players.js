import { query } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

export async function createPlayer(nickname) {
  const uuid = uuidv4();
  const result = await query(
    'INSERT INTO players (uuid, nickname) VALUES ($1, $2) RETURNING id, uuid, nickname, created_at',
    [uuid, nickname]
  );
  return result.rows[0];
}

export async function getPlayerByUuid(uuid) {
  const result = await query(
    'SELECT id, uuid, nickname, created_at FROM players WHERE uuid = $1',
    [uuid]
  );
  return result.rows[0];
}

export async function getPlayerById(id) {
  const result = await query(
    'SELECT id, uuid, nickname, created_at FROM players WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

export async function getPlayerStats(id) {
  const result = await query(
    `SELECT 
      p.id, p.uuid, p.nickname,
      COUNT(g.id) as games_played,
      SUM(CASE WHEN g.winner_id = p.id THEN 1 ELSE 0 END) as wins,
      AVG(CASE WHEN g.player1_id = p.id THEN g.p1_score ELSE g.p2_score END) as avg_score
    FROM players p
    LEFT JOIN games g ON (g.player1_id = p.id OR g.player2_id = p.id) AND g.status = 'finished'
    WHERE p.id = $1
    GROUP BY p.id`,
    [id]
  );
  return result.rows[0];
}
