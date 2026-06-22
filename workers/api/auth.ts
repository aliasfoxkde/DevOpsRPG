/**
 * Auth utilities for Cloudflare Workers
 */

import type { Env } from './index';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  provider: 'google' | 'github';
  providerId: string;
  xp: number;
  level: number;
  streakDays: number;
  lastActive: string;
  theme: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  userId: string;
  token: string;
  expiresAt: string;
}

// Generate a unique token
export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Hash a string using Web Crypto
export async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Validate session token
export async function validateSession(
  request: Request,
  env: Env
): Promise<Session | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  const sessionKey = `session:${token}`;

  const sessionData = await env.SESSIONS.get(sessionKey);
  if (!sessionData) {
    return null;
  }

  try {
    const session: Session = JSON.parse(sessionData);

    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      await env.SESSIONS.delete(sessionKey);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

// Create a new session
export async function createSession(
  env: Env,
  userId: string
): Promise<Session> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  const session: Session = {
    userId,
    token,
    expiresAt,
  };

  await env.SESSIONS.put(`session:${token}`, JSON.stringify(session), {
    expirationTtl: 7 * 24 * 60 * 60, // 7 days in seconds
  });

  return session;
}

// Delete a session
export async function deleteSession(env: Env, token: string): Promise<void> {
  await env.SESSIONS.delete(`session:${token}`);
}

// Auth wrapper - ensures user is authenticated
export function withAuth<T extends (request: Request, env: Env, ctx: ExecutionContext, user: User) => Promise<Response>>(
  handler: T
) {
  return async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
    const session = await validateSession(request, env);

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user from database
    const userResult = await env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(session.userId).first<User>();

    if (!userResult) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return handler(request, env, ctx, userResult);
  };
}
