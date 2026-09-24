import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { GameProvider, type GameState } from '../../contexts/GameContext'
import { IncidentSimulator } from './IncidentSimulator'
import {
  INCIDENT_SCENARIOS,
  type DiagnosticStep,
  type ResolutionStep,
} from '../../data/incidentScenarios'
import { STORAGE_KEYS } from '../../utils/gameUtils'

/** Look up an authored scenario by id, failing loudly if the data ever changes. */
function scenarioById(id: string) {
  const scenario = INCIDENT_SCENARIOS.find((s) => s.id === id)
  if (!scenario) throw new Error(`Missing incident scenario: ${id}`)
  return scenario
}

/** A short, fully command-driven scenario: 3 diagnostics + 3 resolutions. */
const SCENARIO = scenarioById('ssl-certificate-expiry')
/** The critical scenario whose final step originally shipped with no command. */
const HIGH_CPU = scenarioById('high-cpu-production')

const ALL_STEPS = [...SCENARIO.diagnostics, ...SCENARIO.resolution]

/** Every step this suite drives has to expose the command the player types. */
function commandOf(step: DiagnosticStep | ResolutionStep): string {
  const { command } = step
  if (!command) throw new Error(`Step "${step.action}" has no command to type`)
  return command
}

function renderGame() {
  const onComplete = vi.fn<(score: number, xpEarned: number) => void>()
  const view = render(
    <GameProvider>
      <IncidentSimulator onComplete={onComplete} />
    </GameProvider>,
  )
  return { ...view, onComplete }
}

function storedCharacter(): GameState['character'] {
  const raw = localStorage.getItem(STORAGE_KEYS.GAME)
  if (!raw) throw new Error('No game state was persisted to localStorage')
  const state = JSON.parse(raw) as Partial<GameState>
  if (!state.character) throw new Error('Persisted game state has no character')
  return state.character
}

function storedBadgeUnlock(badgeId: string): string | undefined {
  const raw = localStorage.getItem(STORAGE_KEYS.GAME)
  if (!raw) throw new Error('No game state was persisted to localStorage')
  const state = JSON.parse(raw) as Partial<GameState>
  // Every badge is pre-seeded in the save file; only `unlockedAt` marks progress.
  return state.badges?.find((badge) => badge.id === badgeId)?.unlockedAt
}

function typeCommand(value: string) {
  fireEvent.change(screen.getByPlaceholderText('Enter command...'), { target: { value } })
  fireEvent.click(screen.getByRole('button', { name: 'Run' }))
}

/** The game pauses 1.5s on the feedback before revealing the next step. */
function letFeedbackSettle() {
  act(() => {
    vi.advanceTimersByTime(1500)
  })
}

/** Run the clock out; the completion itself is scheduled on a zero-delay timeout. */
function expireClock(seconds: number) {
  act(() => {
    vi.advanceTimersByTime(seconds * 1000)
  })
  act(() => {
    vi.advanceTimersByTime(0)
  })
}

function startScenario(title: string) {
  fireEvent.click(screen.getByRole('button', { name: new RegExp(title, 'i') }))
}

describe('IncidentSimulator', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('briefs the player and lists every scenario with its rewards', () => {
    renderGame()

    expect(screen.getByText('Incident Response Training')).toBeInTheDocument()
    INCIDENT_SCENARIOS.forEach((scenario) => {
      expect(screen.getByText(scenario.title)).toBeInTheDocument()
      expect(screen.getAllByText(`+${scenario.xpReward} XP`).length).toBeGreaterThan(0)
      expect(
        screen.getAllByText(`Est. ${Math.floor(scenario.estimatedTime / 60)}m`).length,
      ).toBeGreaterThan(0)
    })
    expect(screen.getAllByText('🔴 Critical').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Est. 1m').length).toBeGreaterThan(0) // 90s + 100s scenarios
  })

  it('starts a scenario in the diagnostics phase with the symptoms listed', () => {
    renderGame()
    startScenario(SCENARIO.title)

    expect(screen.getByText('🔍 Diagnostics')).toBeInTheDocument()
    expect(screen.getByText('Progress')).toBeInTheDocument()
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
    expect(screen.getByText('Observed Symptoms:')).toBeInTheDocument()
    SCENARIO.symptoms.forEach((symptom) => {
      expect(screen.getByText(symptom)).toBeInTheDocument()
    })
    expect(screen.getByText(SCENARIO.diagnostics[0].action)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Run' })).toBeInTheDocument()
    expect(screen.getByText(`⏱️ ${Math.floor(SCENARIO.estimatedTime / 60)}:30`)).toBeInTheDocument()
  })

  it('confirms a correct diagnostic and reveals its clue', () => {
    renderGame()
    startScenario(SCENARIO.title)

    typeCommand(commandOf(SCENARIO.diagnostics[0]))

    expect(screen.getByText(SCENARIO.diagnostics[0].revealsClue)).toBeInTheDocument()
    expect(screen.getByText('Completed:')).toBeInTheDocument()

    letFeedbackSettle()
    expect(screen.getByText(SCENARIO.diagnostics[1].action)).toBeInTheDocument()
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
  })

  it('rejects a wrong command and charges the time penalty', () => {
    renderGame()
    startScenario(SCENARIO.title)

    typeCommand('kubectl delete pod everything')

    expect(screen.getByText('Incorrect command. Try again or use a hint.')).toBeInTheDocument()
    expect(screen.getByText('+10s penalty')).toBeInTheDocument()
    // The step did not advance; the player can retry immediately.
    expect(screen.getByText(SCENARIO.diagnostics[0].action)).toBeInTheDocument()
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('reveals the answer through the hint button', () => {
    renderGame()
    startScenario(SCENARIO.title)

    fireEvent.click(screen.getByRole('button', { name: /need a hint/i }))

    expect(
      screen.getByText(commandOf(SCENARIO.diagnostics[0]), { selector: 'code' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /need a hint/i })).not.toBeInTheDocument()
    // The advertised cost is actually charged to the clock.
    expect(screen.getByText('+10s penalty')).toBeInTheDocument()
  })

  it('aborts back to the scenario menu', () => {
    renderGame()
    startScenario(SCENARIO.title)

    fireEvent.click(screen.getByRole('button', { name: /abort incident/i }))

    expect(screen.getByText('Incident Response Training')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Enter command...')).not.toBeInTheDocument()
  })

  it('completes a full resolution and banks XP and gold', () => {
    const { onComplete } = renderGame()
    startScenario(SCENARIO.title)

    // Run all six steps: three diagnostics then three resolutions.
    ALL_STEPS.forEach((step) => {
      typeCommand(commandOf(step))
      letFeedbackSettle()
    })

    expect(screen.getByText('Incident Resolved!')).toBeInTheDocument()
    expect(screen.getByText(`You handled the ${SCENARIO.title} incident!`)).toBeInTheDocument()
    // Six of six steps with no penalties: 93% time bonus weighted at 0.3 plus
    // full accuracy at 0.7 rounds to 98.
    expect(screen.getByText('98%')).toBeInTheDocument()
    expect(screen.getByText('Steps completed')).toBeInTheDocument()
    expect(screen.getByText('6 / 6')).toBeInTheDocument()
    expect(screen.getByText('Penalties')).toBeInTheDocument()
    expect(screen.getByText('+0s')).toBeInTheDocument()
    expect(screen.getByText('Root Cause (learned)')).toBeInTheDocument()
    expect(screen.getByText(SCENARIO.rootCause)).toBeInTheDocument()

    // 98% of a 200 XP / 100 gold scenario.
    expect(screen.getByText('+196 XP')).toBeInTheDocument()
    expect(screen.getByText('+98 🪙')).toBeInTheDocument()

    const character = storedCharacter()
    expect(character.xp).toBe(196)
    expect(character.gold).toBe(98)
    expect(character.level).toBe(2) // 196 XP crosses the 100 XP threshold

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(98, 196)
  })

  it('walks the resolution phase once diagnostics are done', () => {
    renderGame()
    startScenario(SCENARIO.title)

    SCENARIO.diagnostics.forEach((step) => {
      typeCommand(commandOf(step))
      letFeedbackSettle()
    })

    expect(screen.getByText('✅ Resolution')).toBeInTheDocument()
    expect(screen.getByText(SCENARIO.resolution[0].action)).toBeInTheDocument()
    expect(screen.getByText(`Expected: ${SCENARIO.resolution[0].verification}`)).toBeInTheDocument()
  })

  it('finishes with no reward when the clock runs out', () => {
    const { onComplete } = renderGame()
    startScenario(SCENARIO.title)

    expireClock(SCENARIO.estimatedTime)

    expect(screen.getByText('Keep Training!')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('+0 XP')).toBeInTheDocument()
    expect(screen.getByText('+0 🪙')).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledWith(0, 0)
    expect(storedCharacter().xp).toBe(0)
  })

  it('finishes the critical scenario whose last step gained a command', () => {
    const { onComplete } = renderGame()
    startScenario(HIGH_CPU.title)

    // The final "Monitor for 5 minutes" step used to ship without a command,
    // dead-ending the run; it now accepts `kubectl top nodes`.
    expect(HIGH_CPU.resolution[2].command).toBe('kubectl top nodes')
    const steps = [...HIGH_CPU.diagnostics, ...HIGH_CPU.resolution]
    steps.forEach((step) => {
      typeCommand(commandOf(step))
      letFeedbackSettle()
    })

    expect(screen.getByText('Incident Resolved!')).toBeInTheDocument()
    // 97% time bonus weighted at 0.3 plus full accuracy at 0.7 rounds to 99.
    expect(screen.getByText('99%')).toBeInTheDocument()
    expect(screen.getByText('+297 XP')).toBeInTheDocument()
    expect(screen.getByText('+149 🪙')).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledWith(99, 297)
  })

  it('restarts the same scenario from the result screen', () => {
    renderGame()
    startScenario(SCENARIO.title)

    expireClock(SCENARIO.estimatedTime)
    fireEvent.click(screen.getByRole('button', { name: /try another/i }))

    expect(screen.getByText('🔍 Diagnostics')).toBeInTheDocument()
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
    expect(storedBadgeUnlock('speed_demon')).toBeUndefined()
  })

  it('returns to the menu from the result screen', () => {
    const { onComplete } = renderGame()
    startScenario(SCENARIO.title)

    expireClock(SCENARIO.estimatedTime)
    fireEvent.click(screen.getByRole('button', { name: 'Exit' }))

    expect(screen.getByText('Incident Response Training')).toBeInTheDocument()
    expect(screen.queryByText(/Performance Score/)).not.toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
