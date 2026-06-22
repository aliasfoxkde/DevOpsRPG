/**
 * Leaderboard API Handler
 */

import type { Env } from './index';
import { type User } from './auth';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl: string;
  level: number;
  xp: number;
  streakDays: number;
}

export async function handleLeaderboardRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);

  // GET /api/leaderboard - Get top users
  if (request.method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT id, name, avatar_url, level, xp, streak_days FROM users ORDER BY xp DESC LIMIT ?'
    ).bind(limit).all<User>();

    const leaderboard: LeaderboardEntry[] = results.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      userName: user.name,
      avatarUrl: user.avatarUrl,
      level: user.level,
      xp: user.xp,
      streakDays: user.streakDays,
    }));

    return new Response(JSON.stringify(leaderboard), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}
