import { describe, it, expect, beforeEach, vi } from 'vitest'
import worker from './index'

/**
 * In-memory KV fake covering the subset the router exercises
 * (`get(key, 'json')` and `put(key, value)`). The boundary casts below are
 * the only dishonesty: the full KVNamespace/D1Database platform interfaces
 * carry many unused members with no local stubs.
 */
class FakeKV {
  private store = new Map<string, string>()

  /** Matches real KV semantics: `'json'` parses, default/`'text'` returns raw. */
  get(key: string, type?: 'json' | 'text'): Promise<unknown> {
    const raw = this.store.get(key)
    if (raw === undefined) return Promise.resolve(null)
    return Promise.resolve(type === 'json' ? JSON.parse(raw) : raw)
  }

  put(key: string, value: string): Promise<void> {
    this.store.set(key, value)
    return Promise.resolve()
  }

  /** Stores a pre-serialized JSON value, as another writer would have. */
  seed(key: string, value: unknown): void {
    this.store.set(key, JSON.stringify(value))
  }
}

/** D1 fake covering `prepare(sql).all()` for the leaderboard query. */
class FakeD1 {
  constructor(
    private readonly rows: Array<Record<string, unknown>>,
    private readonly shouldThrow = false,
  ) {}

  prepare(sql: string) {
    return {
      all: () => {
        if (this.shouldThrow) return Promise.reject(new Error('d1 unavailable'))
        return Promise.resolve({ results: this.rows, meta: { sql, duration: 0 } })
      },
    }
  }
}

const asKV = (fake: FakeKV): KVNamespace => fake as unknown as KVNamespace
const asD1 = (fake: FakeD1): D1Database => fake as unknown as D1Database

interface Env {
  PROGRESS: KVNamespace
  DB?: D1Database
}

const env = (overrides: Partial<Env> = {}): Env => ({
  PROGRESS: asKV(new FakeKV()),
  ...overrides,
})

const authed = (body?: unknown): Request =>
  new Request('https://worker.example/api/progress', {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      Authorization: 'Bearer user-123',
      Origin: 'https://devopsquest.pages.dev',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('CORS', () => {
  it('preflight echoes an allowed origin', async () => {
    const res = await worker.fetch(
      new Request('https://worker.example/api/progress', {
        method: 'OPTIONS',
        headers: { Origin: 'https://devopsquest.pages.dev' },
      }),
      env(),
    )
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://devopsquest.pages.dev')
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST')
  })

  it('preflight falls back to the first allowed origin for unknown origins', async () => {
    const res = await worker.fetch(
      new Request('https://worker.example/api/progress', {
        method: 'OPTIONS',
        headers: { Origin: 'https://evil.example' },
      }),
      env(),
    )
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173')
  })

  it('JSON responses echo the allowed origin of the API caller', async () => {
    const res = await worker.fetch(
      new Request('https://worker.example/api/health', {
        headers: { Origin: 'https://devopsquest.pages.dev' },
      }),
      env(),
    )
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://devopsquest.pages.dev')
    expect(res.headers.get('Content-Type')).toBe('application/json')
  })

  it('JSON responses use the default allowed origin when none is sent', async () => {
    const res = await worker.fetch(new Request('https://worker.example/api/health'), env())
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173')
  })
})

describe('GET /api/health', () => {
  it('reports healthy with a version', async () => {
    const res = await worker.fetch(new Request('https://worker.example/api/health'), env())
    expect(res.status).toBe(200)
    const body = await res.json<{
      success: boolean
      data: { status: string; version: string }
    }>()
    expect(body.success).toBe(true)
    expect(body.data.status).toBe('healthy')
    expect(body.data.version).toBe('1.0.0')
  })
})

describe('GET /api/progress', () => {
  it('rejects requests without a bearer token', async () => {
    const res = await worker.fetch(new Request('https://worker.example/api/progress'), env())
    expect(res.status).toBe(401)
    const body = await res.json<{ success: boolean; error: string }>()
    expect(body.success).toBe(false)
    expect(body.error).toBe('Unauthorized')
  })

  it('rejects non-bearer authorization schemes', async () => {
    const res = await worker.fetch(
      new Request('https://worker.example/api/progress', {
        headers: { Authorization: 'Basic dXNlcjpwYXNz' },
      }),
      env(),
    )
    expect(res.status).toBe(401)
  })

  it('returns the default progress shape for unknown users', async () => {
    const res = await worker.fetch(authed(), env())
    expect(res.status).toBe(200)
    const body = await res.json<{
      success: boolean
      data: { xp: number; level: number; streakDays: number; completedTopics: unknown[] }
    }>()
    expect(body.success).toBe(true)
    expect(body.data).toMatchObject({ xp: 0, level: 1, streakDays: 0, completedTopics: [] })
  })

  it('returns stored progress for a known user', async () => {
    const kv = new FakeKV()
    kv.seed('progress:user-123', {
      xp: 420,
      level: 5,
      streakDays: 3,
      lastActive: '2026-09-01',
      completedTopics: [
        {
          topicId: 'html_intro',
          technologyId: 'html',
          completed: true,
          xpEarned: 50,
          completedAt: '2026-09-01',
        },
      ],
    })
    const res = await worker.fetch(authed(), { PROGRESS: asKV(kv) })
    expect(res.status).toBe(200)
    const body = await res.json<{ data: { xp: number; level: number } }>()
    expect(body.data.xp).toBe(420)
    expect(body.data.level).toBe(5)
  })
})

describe('POST /api/progress', () => {
  it('rejects requests without a bearer token', async () => {
    const res = await worker.fetch(
      new Request('https://worker.example/api/progress', {
        method: 'POST',
        body: JSON.stringify({ xp: 10 }),
      }),
      env(),
    )
    expect(res.status).toBe(401)
  })

  it('merges the payload over defaults and persists it', async () => {
    const kv = new FakeKV()
    const res = await worker.fetch(authed({ xp: 100, level: 2 }), { PROGRESS: asKV(kv) })
    expect(res.status).toBe(200)
    const body = await res.json<{ data: { xp: number; level: number; streakDays: number } }>()
    expect(body.data).toMatchObject({ xp: 100, level: 2, streakDays: 0 })

    const stored = (await kv.get('progress:user-123', 'json')) as { xp: number; level: number }
    expect(stored).toMatchObject({ xp: 100, level: 2 })
  })

  it('merges updates into existing progress instead of replacing it', async () => {
    const kv = new FakeKV()
    kv.seed('progress:user-123', {
      xp: 500,
      level: 6,
      streakDays: 4,
      lastActive: '2026-09-01',
      completedTopics: [],
    })
    await worker.fetch(authed({ xp: 550 }), { PROGRESS: asKV(kv) })
    const stored = (await kv.get('progress:user-123', 'json')) as {
      xp: number
      level: number
      streakDays: number
    }
    expect(stored.xp).toBe(550)
    expect(stored.level).toBe(6)
    expect(stored.streakDays).toBe(4)
  })

  it('responds 500 when the body is not valid JSON', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await worker.fetch(
      new Request('https://worker.example/api/progress', {
        method: 'POST',
        headers: { Authorization: 'Bearer user-123', 'Content-Type': 'application/json' },
        body: 'not json{',
      }),
      env(),
    )
    expect(res.status).toBe(500)
    const body = await res.json<{ error: string }>()
    expect(body.error).toBe('Failed to update progress')
    expect(errorSpy).toHaveBeenCalledOnce()
  })
})

describe('GET /api/leaderboard', () => {
  it('responds 503 when D1 is not bound', async () => {
    const res = await worker.fetch(new Request('https://worker.example/api/leaderboard'), env())
    expect(res.status).toBe(503)
    const body = await res.json<{ error: string }>()
    expect(body.error).toContain('D1 database is not configured')
  })

  it('returns query results when D1 is bound', async () => {
    const db = new FakeD1([
      { user_id: 'a', xp: 900, level: 9 },
      { user_id: 'b', xp: 400, level: 4 },
    ])
    const res = await worker.fetch(new Request('https://worker.example/api/leaderboard'), {
      PROGRESS: asKV(new FakeKV()),
      DB: asD1(db),
    })
    expect(res.status).toBe(200)
    const body = await res.json<{ data: Array<{ user_id: string; xp: number }> }>()
    expect(body.data).toHaveLength(2)
    expect(body.data[0]).toMatchObject({ user_id: 'a', xp: 900 })
  })

  it('responds 500 when the D1 query fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await worker.fetch(new Request('https://worker.example/api/leaderboard'), {
      PROGRESS: asKV(new FakeKV()),
      DB: asD1(new FakeD1([], true)),
    })
    expect(res.status).toBe(500)
    expect(errorSpy).toHaveBeenCalledOnce()
  })
})

describe('routing', () => {
  it('responds 404 with JSON for unknown routes', async () => {
    const res = await worker.fetch(
      new Request('https://worker.example/api/nope', {
        headers: { Origin: 'https://devopsquest.pages.dev' },
      }),
      env(),
    )
    expect(res.status).toBe(404)
    const body = await res.json<{ error: string }>()
    expect(body.error).toBe('Not found')
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://devopsquest.pages.dev')
  })

  it('responds 404 for unsupported methods on routed paths', async () => {
    const res = await worker.fetch(
      new Request('https://worker.example/api/progress', { method: 'DELETE' }),
      env(),
    )
    expect(res.status).toBe(404)
  })
})
