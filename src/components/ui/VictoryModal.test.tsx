import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useEffect } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { VictoryModal } from './VictoryModal'
import { GameProvider } from '../../contexts/GameContext'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { Badge } from '../../data/badges'
import type { Milestone } from '../../data/milestones'
import { STORAGE_KEYS } from '../../utils/gameUtils'

/** Unlocks the Web Audio API the way the app does on the first user gesture. */
function AudioUnlocker() {
  const { initAudio } = useSoundEffects()
  useEffect(() => {
    initAudio()
  }, [initAudio])
  return null
}

/** Records the pitch steps scheduled on one oscillator. */
class FakeAudioParam {
  readonly notes: number[] = []

  setValueAtTime(value: number): this {
    this.notes.push(value)
    return this
  }

  exponentialRampToValueAtTime(): this {
    return this
  }
}

class FakeOscillator {
  type: OscillatorType | null = null
  readonly frequency = new FakeAudioParam()

  connect(): unknown {
    return this
  }

  start(): void {}

  stop(): void {}
}

class FakeGain {
  readonly gain = new FakeAudioParam()

  connect(): unknown {
    return this
  }
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = []

  readonly destination = {}
  readonly currentTime = 0
  readonly oscillators: FakeOscillator[] = []

  constructor() {
    FakeAudioContext.instances.push(this)
  }

  createOscillator(): FakeOscillator {
    const oscillator = new FakeOscillator()
    this.oscillators.push(oscillator)
    return oscillator
  }

  createGain(): FakeGain {
    return new FakeGain()
  }
}

interface SeedOptions {
  xp?: number
  levelUp?: boolean
  newLevel?: number
  milestone?: Milestone
  badge?: Badge
  level?: number
  xpValue?: number
  xpToNextLevel?: number
  title?: string
  completedQuests?: number
}

function badge(overrides: Partial<Badge> = {}): Badge {
  return {
    id: 'badge_first',
    name: 'First Steps',
    description: 'Complete your first quest',
    icon: '🎯',
    category: 'quest',
    rarity: 'legendary',
    requirement: { type: 'quest_count', value: 1 },
    xpReward: 25,
    goldReward: 10,
    ...overrides,
  }
}

function milestone(overrides: Partial<Milestone> = {}): Milestone {
  return {
    id: 'milestone_quests_1',
    title: 'First Quest',
    message: 'Complete a quest',
    icon: '🏆',
    trigger: { type: 'quest_count', count: 1 },
    xpBonus: 30,
    unlocked: true,
    ...overrides,
  }
}

/** Seeds a save that opens the victory modal when the provider mounts. */
function renderVictory(options: SeedOptions = {}) {
  const {
    xp = 50,
    levelUp = false,
    newLevel = 1,
    milestone: milestoneReward,
    badge: badgeReward,
    level = 3,
    xpValue = 60,
    xpToNextLevel = 100,
    title = 'Container Cadet',
    completedQuests = 4,
  } = options

  localStorage.setItem(
    STORAGE_KEYS.GAME,
    JSON.stringify({
      character: { level, xp: xpValue, xpToNextLevel, title },
      badges: [],
      showVictory: true,
      lastVictory: {
        xp,
        levelUp,
        newLevel,
        ...(milestoneReward ? { milestone: milestoneReward } : {}),
        ...(badgeReward ? { badge: badgeReward } : {}),
      },
      completedQuests: Array.from({ length: completedQuests }, (_, index) => ({
        topicId: `topic-${index}`,
        technologyId: 'docker',
        completed: true,
        xpEarned: 10,
      })),
    }),
  )

  render(
    <GameProvider>
      {/* The app unlocks audio on a user gesture elsewhere; this probe performs
          the same initialisation so the fanfare can be observed. */}
      <AudioUnlocker />
      <VictoryModal />
    </GameProvider>,
  )
}

// The sound generator is a module singleton that keeps its AudioContext for the
// whole file, so each test records the notes scheduled after its own baseline.
let noteBaseline = 0

function allNotes(): number[] {
  return FakeAudioContext.instances.flatMap((context) =>
    context.oscillators.flatMap((oscillator) => oscillator.frequency.notes),
  )
}

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('soundEnabled', 'true')
  noteBaseline = allNotes().length
  vi.stubGlobal('AudioContext', FakeAudioContext)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

/** The frequencies synthesised by the current test, in play order. */
function notesThisTest(): number[] {
  return allNotes().slice(noteBaseline)
}

describe('VictoryModal', () => {
  describe('visibility', () => {
    it('renders nothing while no victory is queued', () => {
      localStorage.setItem(
        STORAGE_KEYS.GAME,
        JSON.stringify({ character: {}, badges: [], showVictory: false }),
      )
      render(
        <GameProvider>
          <VictoryModal />
        </GameProvider>,
      )

      expect(screen.queryByText(/QUEST COMPLETE!/)).toBeNull()
    })

    it('renders nothing when there is no victory payload', () => {
      localStorage.setItem(
        STORAGE_KEYS.GAME,
        JSON.stringify({ character: {}, badges: [], showVictory: true, lastVictory: null }),
      )
      render(
        <GameProvider>
          <VictoryModal />
        </GameProvider>,
      )

      expect(screen.queryByText(/QUEST COMPLETE!/)).toBeNull()
    })

    it('closes when the backdrop is clicked', () => {
      renderVictory()
      expect(screen.getByText('QUEST COMPLETE!')).toBeInTheDocument()

      fireEvent.click(screen.getByText('+50').closest('div.fixed') as Element)

      expect(screen.queryByText('QUEST COMPLETE!')).toBeNull()
    })

    it('stays open when the dialog body is clicked', () => {
      renderVictory()

      fireEvent.click(screen.getByText('XP Earned'))

      expect(screen.getByText('QUEST COMPLETE!')).toBeInTheDocument()
    })

    it('closes on Escape', () => {
      renderVictory()

      fireEvent.keyDown(window, { key: 'Escape' })

      expect(screen.queryByText('QUEST COMPLETE!')).toBeNull()
    })

    it("closes on the 'game:next' event", () => {
      renderVictory()

      act(() => {
        window.dispatchEvent(new Event('game:next'))
      })

      expect(screen.queryByText('QUEST COMPLETE!')).toBeNull()
    })

    it('closes from the continue button', () => {
      renderVictory()

      fireEvent.click(screen.getByRole('button', { name: /Continue Quest/ }))

      expect(screen.queryByText('QUEST COMPLETE!')).toBeNull()
    })
  })

  describe('content', () => {
    it('celebrates a plain quest completion', () => {
      renderVictory()

      expect(screen.getByText('QUEST COMPLETE!')).toBeInTheDocument()
      expect(screen.getByText('XP Earned')).toBeInTheDocument()
      expect(screen.getByText('+50')).toBeInTheDocument()
      expect(screen.getByText('Level 3')).toBeInTheDocument()
      expect(screen.getByText('40 XP to next level')).toBeInTheDocument()
    })

    it('shows the level up header, the new title and the level', () => {
      renderVictory({ levelUp: true, newLevel: 5, title: 'Pipeline Paladin' })

      expect(screen.getByText('🎉 LEVEL UP! 🎉')).toBeInTheDocument()
      expect(screen.getByText('⭐ NEW TITLE EARNED')).toBeInTheDocument()
      // The new title appears both on the character badge and in the level up block.
      expect(screen.getAllByText('Pipeline Paladin').length).toBeGreaterThan(0)
      expect(screen.getByText('Welcome to Level 5!')).toBeInTheDocument()
    })

    it('shows the unlocked milestone with its bonus', () => {
      renderVictory({ milestone: milestone({ title: 'Week Warrior', icon: '🔥', xpBonus: 75 }) })

      expect(screen.getByText('🏆 MILESTONE UNLOCKED')).toBeInTheDocument()
      expect(screen.getByText('🔥 Week Warrior')).toBeInTheDocument()
      expect(screen.getByText('+75 XP Bonus!')).toBeInTheDocument()
    })

    it('shows the earned badge with its rewards', () => {
      renderVictory({
        badge: badge({ name: 'First Steps', icon: '🎯', xpReward: 25, goldReward: 10 }),
      })

      expect(screen.getByText('🎖️ BADGE EARNED')).toBeInTheDocument()
      expect(screen.getByText('🎯')).toBeInTheDocument()
      expect(screen.getByText('First Steps')).toBeInTheDocument()
      expect(screen.getByText('+25 XP, +10 Gold')).toBeInTheDocument()
    })

    it.each([
      [1, 'Great start! Keep going, hero! 🚀'],
      [4, "You're finding your stride! 💪"],
      [25, 'Incredible progress! Keep it up! ⭐'],
      [60, "You're on fire! 🔥"],
    ])('picks the encouragement copy for %i completed quests', (completed, expected) => {
      renderVictory({ completedQuests: completed })

      expect(screen.getByText(expected)).toBeInTheDocument()
    })
  })

  describe('celebration', () => {
    it('shows confetti particles that clear after three seconds', () => {
      vi.useFakeTimers()
      try {
        renderVictory()

        expect(document.querySelectorAll('.animate-float-up')).toHaveLength(50)

        act(() => {
          vi.advanceTimersByTime(3000)
        })

        expect(document.querySelectorAll('.animate-float-up')).toHaveLength(0)
        expect(screen.getByText('QUEST COMPLETE!')).toBeInTheDocument()
      } finally {
        vi.useRealTimers()
      }
    })

    it('plays the quest complete fanfare for a plain win', () => {
      renderVictory()

      expect(notesThisTest()).toEqual([392, 523.25, 659.25])
    })

    it('plays the level up fanfare instead when the player levels up', () => {
      renderVictory({ levelUp: true, newLevel: 4 })

      expect(notesThisTest()).toEqual([523.25, 659.25, 783.99, 1046.5])
    })

    it('layers the milestone chime on top of the fanfare', () => {
      renderVictory({ milestone: milestone() })

      expect(notesThisTest()).toEqual([
        392, 523.25, 659.25, 523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5,
      ])
    })

    it('layers the badge chime on top of the fanfare', () => {
      renderVictory({ badge: badge({ rarity: 'epic' }) })

      expect(notesThisTest()).toEqual([392, 523.25, 659.25, 800, 1000, 1200])
    })
  })
})
