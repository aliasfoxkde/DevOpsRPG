/**
 * Progress API Handler
 */

import type { Env } from './index';
import { withAuth, type User } from './auth';
import { generateToken } from './auth';

export interface Progress {
  id: string;
  userId: string;
  technology: string;
  topic: string;
  completed: boolean;
  xpEarned: number;
  timeSpent: number;
  completedAt: string | null;
}

export async function handleProgressRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  user?: User
): Promise<Response> {
  const url = new URL(request.url);

  // GET /api/progress - Get all progress for user
  if (request.method === 'GET') {
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { results } = await env.DB.prepare(
      'SELECT * FROM progress WHERE user_id = ? ORDER BY completed_at DESC'
    ).bind(user.id).all<Progress>();

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // GET /api/progress/:technology - Get progress for specific technology
  if (request.method === 'GET' && url.pathname.includes('/progress/')) {
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const technology = url.pathname.split('/').pop();

    const { results } = await env.DB.prepare(
      'SELECT * FROM progress WHERE user_id = ? AND technology = ? ORDER BY completed_at DESC'
    ).bind(user.id, technology).all<Progress>();

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // POST /api/progress/complete - Mark a topic as complete
  if (request.method === 'POST' && url.pathname.endsWith('/complete')) {
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      const body = await request.json();
      const { technology, topic, xpEarned, timeSpent } = body;

      if (!technology || !topic) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Create progress entry
      const progressId = generateToken();
      const completedAt = new Date().toISOString();

      await env.DB.prepare(
        `INSERT INTO progress (id, user_id, technology, topic, completed, xp_earned, time_spent, completed_at)
         VALUES (?, ?, ?, ?, true, ?, ?, ?)`
      ).bind(progressId, user.id, technology, topic, xpEarned || 0, timeSpent || 0, completedAt).run();

      // Update user XP
      const previousXP = user.xp;
      const newXP = previousXP + (xpEarned || 0);
      const newLevel = Math.floor(Math.sqrt(newXP / 100));
      const leveledUp = newLevel > user.level;

      await env.DB.prepare(
        'UPDATE users SET xp = ?, level = ?, updated_at = ? WHERE id = ?'
      ).bind(newXP, newLevel, new Date().toISOString(), user.id).run();

      // Fetch updated progress
      const progressResult = await env.DB.prepare(
        'SELECT * FROM progress WHERE id = ?'
      ).bind(progressId).first<Progress>();

      return new Response(JSON.stringify({
        progress: progressResult,
        xpGained: xpEarned || 0,
        leveledUp,
        newLevel,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to record progress' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}
