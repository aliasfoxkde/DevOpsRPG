/**
 * Achievements API Handler
 */

import type { Env } from './index';
import { type User } from './auth';

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-steps', key: 'first_steps', name: 'First Steps', description: 'Complete your first topic', icon: '🎯', xpReward: 25 },
  { id: 'getting-started', key: 'getting_started', name: 'Getting Started', description: 'Complete 5 topics', icon: '🌟', xpReward: 50 },
  { id: 'streak-3', key: 'streak_3', name: 'On a Roll', description: 'Maintain a 3-day streak', icon: '🔥', xpReward: 30 },
  { id: 'streak-7', key: 'streak_7', name: 'Dedicated Learner', description: 'Maintain a 7-day streak', icon: '🔥', xpReward: 100 },
  { id: 'level-5', key: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: '⭐', xpReward: 100 },
];

export async function handleAchievementsRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  user?: User
): Promise<Response> {
  // GET /api/achievements - Get all achievements with earned status
  if (request.method === 'GET') {
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user's earned achievements
    const earnedResult = await env.DB.prepare(
      'SELECT achievement_key FROM achievements WHERE user_id = ?'
    ).bind(user.id).all<{ achievement_key: string }>();

    const earnedKeys = new Set(earnedResult.results.map(r => r.achievement_key));

    const achievementsWithStatus = ACHIEVEMENTS.map(a => ({
      ...a,
      earned: earnedKeys.has(a.key),
      earnedAt: null as string | null,
    }));

    return new Response(JSON.stringify(achievementsWithStatus), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // POST /api/achievements/check - Check and award new achievements
  if (request.method === 'POST') {
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Get user's earned achievements
      const earnedResult = await env.DB.prepare(
        'SELECT achievement_key FROM achievements WHERE user_id = ?'
      ).bind(user.id).all<{ achievement_key: string }>();

      const earnedKeys = new Set(earnedResult.results.map(r => r.achievement_key));

      // Get user's progress count
      const progressCount = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND completed = true'
      ).bind(user.id).first<{ count: number }>();

      const completedTopics = progressCount?.count || 0;

      // Check for new achievements
      const newAchievements: Achievement[] = [];

      for (const achievement of ACHIEVEMENTS) {
        if (earnedKeys.has(achievement.key)) continue;

        let earned = false;

        switch (achievement.key) {
          case 'first_steps':
            earned = completedTopics >= 1;
            break;
          case 'getting_started':
            earned = completedTopics >= 5;
            break;
          case 'streak_3':
            earned = user.streakDays >= 3;
            break;
          case 'streak_7':
            earned = user.streakDays >= 7;
            break;
          case 'level_5':
            earned = user.level >= 5;
            break;
        }

        if (earned) {
          // Award achievement
          await env.DB.prepare(
            'INSERT INTO achievements (id, user_id, achievement_key) VALUES (?, ?, ?)'
          ).bind(`${Date.now()}-${Math.random().toString(36).slice(2)}`, user.id, achievement.key).run();

          newAchievements.push(achievement);

          // Award XP if applicable
          if (achievement.xpReward > 0) {
            await env.DB.prepare(
              'UPDATE users SET xp = xp + ? WHERE id = ?'
            ).bind(achievement.xpReward, user.id).run();
          }
        }
      }

      return new Response(JSON.stringify({ newAchievements }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to check achievements' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}
