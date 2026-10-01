// Behavior tests for the persistence hook: dual-key saves, quota-error
// tolerance, and cross-tab storage-event merging — including the paths a
// hostile or broken browser storage takes.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { useGamePersistence } from './gameStorage'
import { createDefaultGame } from './defaultState'
import { STORAGE_KEYS } from '../../utils/gameUtils'
import type { GameState } from './types'

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
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('writes every state change to the main and backup keys', () => {
    const game = createDefaultGame()
    render(<Probe initial={game} />)
    for (const key of [STORAGE_KEYS.GAME, STORAGE_KEYS.BACKUP]) {
      const saved = JSON.parse(localStorage.getItem(key) as string) as { character: { xp: number } }
      expect(saved.character.xp).toBe(0)
    }
  })

  it('survives a quota-exceeded save with a warning instead of crashing', () => {
    const setItem = localStorage.setItem.bind(localStorage)
    vi.spyOn(localStorage, 'setItem').mockImplementation((key, value) => {
      if (key === STORAGE_KEYS.GAME) throw new DOMException('full', 'QuotaExceededError')
      setItem(key, value)
    })
    render(<Probe initial={createDefaultGame()} />)
    expect(screen.getByText('xp:0')).toBeInTheDocument()
    expect(console.warn).toHaveBeenCalledWith(
      'Failed to save game state to localStorage:',
      expect.any(Error),
    )
    // The backup key still received its write
    expect(localStorage.getItem(STORAGE_KEYS.BACKUP)).not.toBeNull()
  })

  it('merges a cross-tab storage event into state through the defaults', () => {
    render(<Probe initial={createDefaultGame()} />)
    const foreign = createDefaultGame()
    foreign.character.xp = 555
    storageEvent(STORAGE_KEYS.GAME, JSON.stringify({ character: { xp: 555 } }))

    // The merged state replaced the probe's render and landed in storage
    expect(screen.getByText('xp:555')).toBeInTheDocument()
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME) as string) as {
      character: { xp: number }
    }
    expect(saved.character.xp).toBe(555)
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
