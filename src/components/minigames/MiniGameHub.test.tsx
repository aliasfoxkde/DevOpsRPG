import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useState } from 'react'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { GameProvider } from '../../contexts/GameContext'
import { MiniGameHub } from './MiniGameHub'
import { mathChallenges } from '../../data/minigames'
import { STORAGE_KEYS } from '../../utils/gameUtils'

/**
 * shuffleArray draws Math.random() once per element; a value just below 1 makes
 * `Math.floor(r * (i + 1))` return `i`, so decks keep their authored order. The
 * hub deals a 6-pair Memory Match board, so icon i sits at position i and its
 * twin at position i + 6.
 */
const IDENTITY_SHUFFLE_RANDOM = 0.999999

const UNLOCK_LEVEL = 3

function seedLevel(level: number) {
  localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify({ character: { level }, badges: [] }))
}

function storedState() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME)!)
}

function storedBadgeUnlock(badgeId: string) {
  return storedState().badges?.find((badge: { id: string }) => badge.id === badgeId)?.unlockedAt
}

/** Memory Match cards are the only square buttons in the hub. */
function boardCards() {
  return screen
    .getAllByRole('button')
    .filter((el) => el.className.includes('aspect-square'))
}

function flipPair(index: number) {
  fireEvent.click(boardCards()[index])
  fireEvent.click(boardCards()[index + 6])
}

function answerMathProblem(value: string) {
  fireEvent.change(screen.getByPlaceholderText('Enter your answer...'), { target: { value } })
  fireEvent.click(screen.getByRole('button', { name: /check answer/i }))
}

function launchGame(label: string) {
  fireEvent.click(gameTile(label))
}

/** Tiles are matched by their visible title: the accessible names are unreliable. */
const TILE_TITLES: Record<string, string> = {
  'command typer': 'Command Typer',
  'memory match': 'Memory Match',
  'math challenge': 'Math Challenge',
  'code puzzle': 'Code Puzzle',
  'quiz dash': 'Quiz Dash',
  'terminal simulator': 'Terminal Simulator',
  'incident response': 'Incident Response',
}

function gameTile(label: string) {
  const tile = screen
    .getAllByRole('button')
    .find((button) => button.textContent?.includes(TILE_TITLES[label]))
  if (!tile) throw new Error(`No mini-game tile rendered for "${label}"`)
  return tile
}

/** The hub header and the inner game both paint a title. */
function title(text: string) {
  return screen.getAllByText(text)
}

/**
 * `onClose` is expected to dismiss the hub, so the harness honours it by
 * unmounting - that way the tests observe the real close behaviour.
 */
function renderHub() {
  const onClose = vi.fn()

  function Harness() {
    const [open, setOpen] = useState(true)
    if (!open) return <p>Hub closed</p>
    return (
      <MiniGameHub
        onClose={() => {
          onClose()
          setOpen(false)
        }}
      />
    )
  }

  render(
    <GameProvider>
      <Harness />
    </GameProvider>,
  )
  return { onClose }
}

describe('MiniGameHub', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    // Dealt decks keep their authored order, so Memory Match pairs are always
    // (i, i + 6) and Math Challenge serves mathChallenges in file order.
    vi.spyOn(Math, 'random').mockReturnValue(IDENTITY_SHUFFLE_RANDOM)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('lists every mini-game with its reward teaser', () => {
    seedLevel(UNLOCK_LEVEL)
    renderHub()

    expect(title('🎮 Mini-Games').length).toBeGreaterThan(0)
    expect(
      screen.getByText('Practice your DevOps skills and earn bonus rewards!'),
    ).toBeInTheDocument()
    expect(gameTile('command typer')).toBeInTheDocument()
    expect(gameTile('memory match')).toBeInTheDocument()
    expect(gameTile('math challenge')).toBeInTheDocument()
    expect(gameTile('code puzzle')).toBeInTheDocument()
    expect(gameTile('quiz dash')).toBeInTheDocument()
    expect(gameTile('terminal simulator')).toBeInTheDocument()
    expect(gameTile('incident response')).toBeInTheDocument()
    // Math Challenge and Quiz Dash both advertise +75 XP.
    expect(screen.getAllByText('+75 XP potential')).toHaveLength(2)
  })

  it('keeps the games locked below the level requirement', () => {
    renderHub()

    expect(
      screen.getByText(`🔒 Unlocks at Level ${UNLOCK_LEVEL} (Current: Level 1)`),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Complete more quests to unlock mini-games!'),
    ).toBeInTheDocument()

    for (const label of ['command typer', 'memory match', 'math challenge', 'quiz dash']) {
      const tile = gameTile(label)
      expect(tile).toBeDisabled()
      expect(tile).toHaveAttribute('aria-disabled', 'true')
      expect(screen.getAllByText(`Level ${UNLOCK_LEVEL} to unlock`).length).toBeGreaterThan(0)
    }

    // A disabled tile cannot start a game.
    fireEvent.click(gameTile('math challenge'))
    expect(screen.queryByPlaceholderText('Enter your answer...')).not.toBeInTheDocument()
    expect(title('🎮 Mini-Games').length).toBeGreaterThan(0)
  })

  it('opens a game from the menu and returns through the header close button', () => {
    seedLevel(UNLOCK_LEVEL)
    const { onClose } = renderHub()

    launchGame('command typer')
    expect(title('⌨️ Command Typer').length).toBeGreaterThan(0)
    expect(screen.getByPlaceholderText('Type the command...')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '×' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('runs a Memory Match round to completion and banks the bonus', () => {
    seedLevel(UNLOCK_LEVEL)
    renderHub()
    launchGame('memory match')

    expect(title('🧠 Memory Match').length).toBeGreaterThan(0)
    expect(boardCards()).toHaveLength(12)

    for (let i = 0; i < 6; i++) flipPair(i)

    expect(screen.getByText('🧠 Memory Match Complete!')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /claim rewards/i }))

    // 920 points of 1200 -> 77% accuracy, 38 bonus XP and 19 bonus gold.
    expect(screen.getByText('Good Job!')).toBeInTheDocument()
    expect(screen.getByText('920 / 1200')).toBeInTheDocument()
    expect(screen.getByText('77%')).toBeInTheDocument()
    expect(screen.getByText('+38 XP')).toBeInTheDocument()
    expect(screen.getByText('+19 🪙')).toBeInTheDocument()

    const character = storedState().character
    expect(character.xp).toBe(38)
    expect(character.gold).toBe(19)
    expect(storedState().stats.memoryCount).toBe(1)
    // 77% is under the 80% bar for the speed badge.
    expect(storedBadgeUnlock('speed_demon')).toBeUndefined()
  })

  it('rewards a dominant Math Challenge round with the speed badge', () => {
    seedLevel(UNLOCK_LEVEL)
    renderHub()
    launchGame('math challenge')

    expect(title('🔢 Math Challenge').length).toBeGreaterThan(0)
    for (let i = 0; i < 5; i++) answerMathProblem(String(mathChallenges[i].answer))

    expect(screen.getByText('Math Wizard!')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /claim rewards/i }))

    // 1175 of 750 points, accuracy clamped to 100%: 78 bonus XP and 39 bonus gold.
    expect(screen.getByText('Excellent!')).toBeInTheDocument()
    expect(screen.getByText('1175 / 750')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('+78 XP')).toBeInTheDocument()
    expect(screen.getByText('+39 🪙')).toBeInTheDocument()

    const state = storedState()
    expect(state.character.xp).toBe(78)
    expect(state.character.gold).toBe(39)
    expect(state.stats.mathCount).toBe(1)
    expect(storedBadgeUnlock('speed_demon')).toBeTruthy()
  })

  it('abandons a Quiz Dash round back to the menu without rewards', () => {
    seedLevel(UNLOCK_LEVEL)
    renderHub()
    launchGame('quiz dash')

    expect(title('⚡ Quiz Dash').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: '✕' }))

    expect(title('🎮 Mini-Games').length).toBeGreaterThan(0)
    expect(storedState().character.xp).toBe(0)
    expect(storedState().stats.quizCount).toBe(0)
  })

  it('returns to the game list from the results screen', () => {
    seedLevel(UNLOCK_LEVEL)
    renderHub()
    launchGame('memory match')

    for (let i = 0; i < 6; i++) flipPair(i)
    fireEvent.click(screen.getByRole('button', { name: /claim rewards/i }))
    fireEvent.click(screen.getByRole('button', { name: /more games/i }))

    expect(title('🎮 Mini-Games').length).toBeGreaterThan(0)
    expect(screen.queryByText(/Accuracy/)).not.toBeInTheDocument()

    // And the "Back to Game" button closes the hub.
    fireEvent.click(screen.getByRole('button', { name: /back to game/i }))
    expect(screen.getByText('Hub closed')).toBeInTheDocument()
    expect(screen.queryAllByText('🎮 Mini-Games')).toHaveLength(0)
  })

  it('announces each tile with its own visible title', () => {
    // The Terminal Simulator tile used to borrow the Incident Simulator's
    // accessible name, leaving two tiles indistinguishable to screen readers.
    seedLevel(UNLOCK_LEVEL)
    renderHub()

    expect(gameTile('terminal simulator')).toHaveAttribute(
      'aria-label',
      'Play Terminal Simulator game',
    )
    expect(gameTile('incident response')).toHaveAttribute(
      'aria-label',
      'Play Incident Response game',
    )
  })

  it('closes the hub from the footer button', () => {
    seedLevel(UNLOCK_LEVEL)
    const { onClose } = renderHub()

    fireEvent.click(screen.getByRole('button', { name: /back to game/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('keeps the clock of an opened game running only while it is mounted', () => {
    seedLevel(UNLOCK_LEVEL)
    renderHub()
    launchGame('math challenge')

    expect(screen.getByText('⏱ 45s')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByText('⏱ 43s')).toBeInTheDocument()
  })
})
