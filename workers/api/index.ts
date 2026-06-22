/**
 * Cloudflare Workers API Handler
 * DevOpsQuest Backend API
 */

import { withAuth } from './auth';
import { handleUserRequest } from './user';
import { handleProgressRequest } from './progress';
import { handleAchievementsRequest } from './achievements';
import { handleLeaderboardRequest } from './leaderboard';

export interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  ENVIRONMENT: string;
}

const routes: Record<string, (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>> = {
  'GET /api/user': handleUserRequest,
  'PATCH /api/user': handleUserRequest,
  'GET /api/progress': handleProgressRequest,
  'POST /api/progress': handleProgressRequest,
  'POST /api/progress/complete': handleProgressRequest,
  'GET /api/achievements': handleAchievementsRequest,
  'POST /api/achievements/check': handleAchievementsRequest,
  'GET /api/leaderboard': handleLeaderboardRequest,
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Find matching route
    const routeKey = `${method} ${path}`;
    const handler = routes[routeKey];

    if (handler) {
      try {
        const response = await handler(request, env, ctx);
        // Add CORS headers
        const corsHeaders = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };
        return new Response(response.body, {
          status: response.status,
          headers: { ...Object.fromEntries(response.headers.entries()), ...corsHeaders },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 404 Not Found
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  },
};
