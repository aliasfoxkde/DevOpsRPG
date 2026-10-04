// Behavior tests for the persistence hook: dual-key saves, quota-error
// tolerance, and cross-tab storage-event merging — including the paths a
// hostile or broken browser storage takes.
// jsdom's Storage methods are unforgeable (spyOn cannot intercept them), so
// the suite stubs the localStorage global with a controllable fake.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { useGamePersistence } from './gameStorage'
import { createDefaultGame } from './defaultState'
import { STORAGE_KEYS } from '../../utils/gameUtils'
import type { GameState } from './types'

/** Installs a controllable localStorage stub; `fail` arms quota failures. */
function installStorage(): { fail: { current: boolean } } {
  const store = new Map<string, string>()
  const fail = { current: false }
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
    setItem: (key: string, value: string) => {
      if (fail.current && key === STORAGE_KEYS.GAME) {
        throw new DOMException('Insufficient space', 'QuotaExceededError')
      }
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
  })
  return { fail }
}

/** Mounts the hook over real state so persistence effects are observable. */
function Probe({ initial }: { initial: GameState }) {
  const [game, setGame] = useState(initial)
  useGamePersistence(game, setGame)
  return <div>xp:{game.character.xp}</div>
}

function storageEvent(key: string | null, newValue: string | null): void {
  act(() => {
    window.dispatchEvent(new StorageEvent('storage', { key, newValue }))
  })
}

describe('useGamePersistence', () => {
  let fail: { current: boolean }

  beforeEach(() => {
    ;({ fail } = installStorage())
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('writes every state change to the main and backup keys', () => {
    render(<Probe initial={createDefaultGame()} />)
    for (const key of [STORAGE_KEYS.GAME, STORAGE_KEYS.BACKUP]) {
      const saved = JSON.parse(localStorage.getItem(key) as string) as { character: { xp: number } }
      expect(saved.character.xp).toBe(0)
    }
  })

  it('survives a quota-exceeded save with a warning instead of crashing', () => {
    // The stub throws for the main key before any write happens
    fail.current = true
    render(<Probe initial={createDefaultGame()} />)
    expect(screen.getByText('xp:0')).toBeInTheDocument()
    expect(console.warn).toHaveBeenCalledWith(
      'Failed to save game state to localStorage:',
      expect.objectContaining({ name: 'QuotaExceededError' }),
    )
  })

  it('merges a cross-tab storage event into state through the defaults', () => {
    render(<Probe initial={createDefaultGame()} />)
    storageEvent(STORAGE_KEYS.GAME, JSON.stringify({ character: { xp: 555 } }))

    // The merged state replaced the probe's render and landed in storage
    expect(screen.getByText('xp:555')).toBeInTheDocument()
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME) as string) as {
      character: { xp: number }
    }
    expect(saved.character.xp).toBe(555)
  })

  it('keeps the other tab’s dynamic records when merging its storage event', () => {
    // Defaults-only merging strips keys that are not in the defaults object;
    // the event path must re-attach them or cross-tab play loses progress
    render(<Probe initial={createDefaultGame()} />)

    const foreign = createDefaultGame()
    foreign.skillXp.ci_cd = 4000
    foreign.character.skillAllocations.containerization = 2
    foreign.weakTopics.docker = {
      wrongCount: 2,
      lastReviewed: '2026-10-01',
      nextReview: '2026-10-04',
      masteryLevel: 1,
    }
    storageEvent(STORAGE_KEYS.GAME, JSON.stringify(foreign))

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME) as string) as GameState
    expect(saved.skillXp.ci_cd).toBe(4000)
    expect(saved.character.skillAllocations.containerization).toBe(2)
    expect(saved.weakTopics.docker).toEqual(foreign.weakTopics.docker)
  })

  it('ignores unparseable and non-object payloads from other tabs', () => {
    render(<Probe initial={createDefaultGame()} />)

    storageEvent(STORAGE_KEYS.GAME, '{broken')
    storageEvent(STORAGE_KEYS.GAME, '42')
    expect(screen.getByText('xp:0')).toBeInTheDocument()
  })

  it('ignores storage events for other keys and empty payloads', () => {
    render(<Probe initial={createDefaultGame()} />)

    storageEvent(STORAGE_KEYS.BACKUP, JSON.stringify({ character: { xp: 999 } }))
    storageEvent(STORAGE_KEYS.GAME, null)
    expect(screen.getByText('xp:0')).toBeInTheDocument()
  })

  it('stops listening after unmount', () => {
    const { unmount } = render(<Probe initial={createDefaultGame()} />)
    unmount()

    const foreign = createDefaultGame()
    foreign.character.xp = 555
    // No act() warning expected: nothing should react to the event
    fireEvent(
      window,
      new StorageEvent('storage', { key: STORAGE_KEYS.GAME, newValue: JSON.stringify(foreign) }),
    )
    expect(screen.queryByText(/xp:/)).not.toBeInTheDocument()
  })
})
