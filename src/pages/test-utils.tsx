import type { ReactElement } from 'react'
import { render, type RenderResult } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { GameProvider, useGame, type GameState } from '@/contexts/GameContext'
import { STORAGE_KEYS } from '@/utils/gameUtils'

/**
 * Shared render harness for page smoke tests.
 *
 * Pages are mounted inside the app's REAL providers (GameProvider +
 * ThemeProvider) and a MemoryRouter configured with the route pattern the
 * page is mounted at in src/App.tsx. Game state is seeded from the provider's
 * own `createDefaultGame()` output so every page renders against a valid,
 * fully-populated GameState rather than a hand-rolled fixture.
 */

interface RenderPageOptions {
  /** Route pattern the page is mounted at (defaults to a catch-all). */
  route?: string
  /** URL to render, useful for pages that read params (e.g. `/quest/html`). */
  url?: string
}

/**
 * Renders a page inside GameProvider + ThemeProvider + MemoryRouter.
 *
 * @example
 * renderPage(<AboutPage />)
 * renderPage(<BattleArenaPage />, { route: '/quest/:questId', url: '/quest/html' })
 */
export function renderPage(
  page: ReactElement,
  { route = '*', url = '/' }: RenderPageOptions = {},
): RenderResult {
  return render(
    <ThemeProvider>
      <GameProvider>
        <MemoryRouter initialEntries={[url]}>
          <Routes>
            <Route path={route} element={page} />
          </Routes>
        </MemoryRouter>
      </GameProvider>
    </ThemeProvider>,
  )
}

let cachedDefaults: GameState | null = null

/**
 * Captures a real default GameState by mounting a probe component inside
 * GameProvider. `createDefaultGame()` is internal to GameContext, so this is
 * the only way to obtain genuine defaults without duplicating the fixture.
 */
function captureDefaultGame(): GameState {
  if (cachedDefaults) return cachedDefaults

  let captured: GameState | undefined

  function GameStateProbe() {
    const { game } = useGame()
    captured = game
    return null
  }

  const { unmount } = render(<GameProvider><GameStateProbe /></GameProvider>)
  unmount()

  if (!captured) {
    throw new Error('Failed to capture default game state from GameProvider')
  }
  cachedDefaults = captured
  return captured
}

/**
 * Resets and seeds localStorage with a fresh default game state so the page
 * under test mounts with valid progress data. Returns the seeded state so
 * tests can assert against real values (level, gold, quest ids...).
 */
export function seedDefaultGame(): GameState {
  localStorage.removeItem(STORAGE_KEYS.GAME)
  localStorage.removeItem(STORAGE_KEYS.BACKUP)

  const defaults = captureDefaultGame()
  localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(defaults))
  return defaults
}

/** Seeds defaults and renders the page at its route (the common case). */
export function renderSeededPage(
  page: ReactElement,
  options: RenderPageOptions = {},
): { game: GameState; renderResult: RenderResult } {
  const game = seedDefaultGame()
  return { game, renderResult: renderPage(page, options) }
}

/** Wipes the game keys between tests so seeded state never leaks. */
export function clearGameStorage(): void {
  localStorage.removeItem(STORAGE_KEYS.GAME)
  localStorage.removeItem(STORAGE_KEYS.BACKUP)
}

/**
 * Narrows an `Element.closest()` lookup to an `HTMLElement` so it can be fed
 * to Testing Library's `within()`. Throws a descriptive error instead of the
 * generic "Unable to find" one when the scoping card is missing.
 */
export function closestContainer(from: Element, selector: string): HTMLElement {
  const container = from.closest(selector)
  if (!(container instanceof HTMLElement)) {
    throw new Error(
      `No element matching "${selector}" found around "${from.textContent}"`,
    )
  }
  return container
}
