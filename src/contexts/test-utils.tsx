// Shared render harness for GameContext tests.
//
// The provider owns localStorage persistence and every state transition, so
// tests mount the REAL provider and talk to it through `useGame()`. The newest
// context value is mirrored into a ref from an effect: writing it during
// render trips react-hooks/globals.
import type { ReactElement } from 'react'
import { useEffect } from 'react'
import { render, screen, act } from '@testing-library/react'
import { GameProvider, useGame } from './GameContext'
import { BADGES } from '@/data/badges'
import { STORAGE_KEYS } from '@/utils/gameUtils'

export type GameApi = ReturnType<typeof useGame>

/**
 * Mounts GameProvider with a consumer probe and returns a reader for the
 * latest context value. Pass a UI element when the test also drives the DOM.
 *
 * @example
 * const getGame = renderGame()
 * act(() => { getGame().addXP(10) })
 * expect(getGame().game.character.xp).toBe(10)
 */
export function renderGame(ui?: ReactElement): () => GameApi {
  const latest: { current?: GameApi } = {}
  function Capture({ children }: { children?: ReactElement }) {
    const game = useGame()
    useEffect(() => {
      latest.current = game
    })
    return children ?? null
  }
  render(
    <GameProvider>
      <Capture>{ui}</Capture>
    </GameProvider>,
  )
  return () => latest.current as GameApi
}

/** Clicks a rendered button and flushes the resulting state update. */
export function click(label: string): Promise<void> {
  act(() => {
    screen.getByText(label).click()
  })
  return Promise.resolve()
}

/**
 * Runs a context action inside `act` and returns whatever the action returned.
 * Several GameContext actions capture their result from inside a state updater,
 * so the update has to run and flush before the value is readable; calling them
 * outside `act` leaves both the returned value and the state stale. Only use
 * this for actions that return a value — wrap void actions in `act` directly.
 */
export function actOn<T>(action: () => T): T {
  const result: { value?: T } = {}
  act(() => {
    result.value = action()
  })
  if (result.value === undefined) {
    throw new Error('the action returned no value')
  }
  return result.value
}

/**
 * Seeds localStorage with a partial save. The provider validates only the
 * top-level shape and deep-merges over its own defaults, so omitted fields keep
 * their defaults; `badges` must be an array and `character` an object for the
 * save to pass validation, so both default to a fresh player. Note that
 * deep-merge drops keys that are absent from the defaults, so records that
 * start empty (`weakTopics`, `skillXp`) cannot be seeded this way — build them
 * through actions instead.
 */
export function seedGame(overrides: Record<string, unknown> = {}): void {
  localStorage.setItem(
    STORAGE_KEYS.GAME,
    JSON.stringify({
      badges: BADGES.map((badge) => ({ ...badge })),
      character: {},
      ...overrides,
    }),
  )
}
