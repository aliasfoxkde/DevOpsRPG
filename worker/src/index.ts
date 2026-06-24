/**
 * DevOpsQuest API - Cloudflare Worker Backend
 * Handles user progress, authentication state, and leaderboard data
 */

interface Env {
  PROGRESS: KVNamespace;
  DB?: D1Database;
}

interface UserProgress {
  xp: number;
  level: number;
  streakDays: number;
  lastActive: string;
  completedTopics: Array<{
    topicId: string;
    technologyId: string;
    completed: boolean;
    xpEarned: number;
    completedAt: string;
  }>;
}

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://devopsquest.pages.dev',
];

function corsHeaders(request: Request): Headers {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  const headers = new Headers({
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  });

  return headers;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...Object.fromEntries(corsHeaders(new Request('http://localhost'))),
    },
  });
}

async function handleOptions(request: Request): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

function getUserId(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  // In production, validate the JWT token and extract user ID
  // For now, return a mock user ID
  return authHeader.slice(7);
}

/**
 * GET /api/progress - Get user progress
 * Requires Authorization header with Bearer token
 */
async function getProgress(request: Request, env: Env): Promise<Response> {
  const userId = getUserId(request);
  if (!userId) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const progress = await env.PROGRESS.get(`progress:${userId}`, 'json') as UserProgress | null;

    if (!progress) {
      return jsonResponse({
        success: true,
        data: {
          xp: 0,
          level: 1,
          streakDays: 0,
          lastActive: new Date().toISOString().split('T')[0],
          completedTopics: [],
        },
      });
    }

    return jsonResponse({ success: true, data: progress });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return jsonResponse({ success: false, error: 'Failed to fetch progress' }, 500);
  }
}

/**
 * POST /api/progress - Update user progress
 */
async function updateProgress(request: Request, env: Env): Promise<Response> {
  const userId = getUserId(request);
  if (!userId) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const body = await request.json() as Partial<UserProgress>;

    const existingProgress = await env.PROGRESS.get(`progress:${userId}`, 'json') as UserProgress | null;
    const currentProgress: UserProgress = existingProgress || {
      xp: 0,
      level: 1,
      streakDays: 0,
      lastActive: new Date().toISOString().split('T')[0],
      completedTopics: [],
    };

    // Merge updates
    const updatedProgress: UserProgress = {
      ...currentProgress,
      ...body,
      lastActive: new Date().toISOString().split('T')[0],
    };

    await env.PROGRESS.put(`progress:${userId}`, JSON.stringify(updatedProgress));

    return jsonResponse({ success: true, data: updatedProgress });
  } catch (error) {
    console.error('Error updating progress:', error);
    return jsonResponse({ success: false, error: 'Failed to update progress' }, 500);
  }
}

/**
 * GET /api/leaderboard - Get top users
 */
async function getLeaderboard(request: Request, env: Env): Promise<Response> {
  // Check if D1 database is bound
  if (!env.DB) {
    return jsonResponse({
      success: false,
      error: 'Leaderboard is not available. D1 database is not configured.',
    }, 503);
  }

  try {
    // Query D1 for top users by XP
    const results = await env.DB.prepare(
      'SELECT user_id, xp, level FROM users ORDER BY xp DESC LIMIT 100'
    ).all();

    return jsonResponse({
      success: true,
      data: results.results,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return jsonResponse({ success: false, error: 'Failed to fetch leaderboard' }, 500);
  }
}

/**
 * GET /api/health - Health check endpoint
 */
async function healthCheck(): Promise<Response> {
  return jsonResponse({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    // Route handling
    if (path === '/api/health') {
      return healthCheck();
    }

    if (path === '/api/progress') {
      if (request.method === 'GET') {
        return getProgress(request, env);
      }
      if (request.method === 'POST') {
        return updateProgress(request, env);
      }
    }

    if (path === '/api/leaderboard' && request.method === 'GET') {
      return getLeaderboard(request, env);
    }

    // 404 for unmatched routes
    return jsonResponse({ success: false, error: 'Not found' }, 404);
  },

  // Scheduled event handler for cleanup tasks
  async scheduled(_event: ScheduledEvent, _env: Env, _ctx: ExecutionContext): Promise<void> {
    console.log('Running scheduled cleanup...');
    // Cleanup logic here
  },
};
