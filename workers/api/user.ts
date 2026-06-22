/**
 * User API Handler
 */

import type { Env } from './index';
import { withAuth, type User } from './auth';

export async function handleUserRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  user?: User
): Promise<Response> {
  // If no user (unauthenticated), return error for protected routes
  if (!user && request.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // GET /api/user - Get current user profile
  if (request.method === 'GET') {
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // PATCH /api/user - Update user profile
  if (request.method === 'PATCH') {
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      const body = await request.json();
      const { name, theme, avatarUrl } = body;

      // Build update query
      const updates: string[] = [];
      const values: (string | number)[] = [];

      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
      }
      if (theme !== undefined) {
        updates.push('theme = ?');
        values.push(theme);
      }
      if (avatarUrl !== undefined) {
        updates.push('avatar_url = ?');
        values.push(avatarUrl);
      }

      if (updates.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No updates provided' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      updates.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(user.id);

      await env.DB.prepare(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
      ).bind(...values).run();

      // Fetch updated user
      const updatedUser = await env.DB.prepare(
        'SELECT * FROM users WHERE id = ?'
      ).bind(user.id).first<User>();

      return new Response(JSON.stringify(updatedUser), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}
