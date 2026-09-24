import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { GameProvider } from '../../contexts/GameContext'
import { allQuests, realmStories } from '../../data/quests'
import { RealmCompletionModal } from './RealmCompletionModal'
import { STORAGE_KEYS } from '../../utils/gameUtils'

const foundationsQuests = allQuests.filter((quest) => quest.realmId === 'foundations')
const scriptsQuests = allQuests.filter((quest) => quest.realmId === 'scripts')

function completedQuest(questId: string) {
  const quest = allQuests.find((candidate) => candidate.id === questId)
  return {
    topicId: quest?.topicId ?? questId,
    technologyId: quest?.technologyId ?? 'unknown',
    questId,
    completed: true,
    xpEarned: 50,
  }
}

interface SeedOptions {
  questIds: string[]
  xp?: number
}

function seedGame({ questIds, xp = 500 }: SeedOptions) {
  localStorage.setItem(
    STORAGE_KEYS.GAME,
    JSON.stringify({
      badges: [], // required by the provider's save validation
      character: { xp, level: 4, streakDays: 2 },
      completedQuests: questIds.map(completedQuest),
    }),
  )
}

function renderRealmModal(realmId: string) {
  const onClose = vi.fn()
  const utils = render(
    <GameProvider>
      <RealmCompletionModal realmId={realmId} onClose={onClose} />
    </GameProvider>,
  )
  return { ...utils, onClose }
}

// The stat blocks pair a big number with a caption beneath it.
function statValue(caption: string): string {
  const caption_el = screen.getByText(caption)
  return caption_el.previousElementSibling?.textContent ?? 'missing'
}

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('RealmCompletionModal', () => {
  it('renders nothing for a realm id the game does not know', () => {
    seedGame({ questIds: [] })
    const { container } = renderRealmModal('atlantis')

    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByRole('button')).toBeNull()
  })

  describe('a completed realm', () => {
    beforeEach(() => {
      seedGame({
        questIds: [
          foundationsQuests[0].id,
          foundationsQuests[1].id,
          foundationsQuests[2].id,
          // a quest from another realm must not inflate this realm's tally
          scriptsQuests[0].id,
        ],
      })
    })

    it('heads the celebration with the realm name', () => {
      renderRealmModal('foundations')

      expect(screen.getByRole('heading', { level: 1, name: 'REALM COMPLETE!' })).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { level: 2, name: 'Village of Foundations' }),
      ).toBeInTheDocument()
      // the header trophy, plus any confetti particles sharing the emoji
      expect(screen.getAllByText('🏆').length).toBeGreaterThan(0)
    })

    it('tells the realm story', () => {
      renderRealmModal('foundations')

      expect(screen.getByText(/Welcome, young apprentice/)).toBeInTheDocument()
      expect(screen.getByText(/Village of Foundations\./)).toBeInTheDocument()
    })

    it('counts only the quests from that realm, against the whole character', () => {
      renderRealmModal('foundations')

      expect(statValue('Quests Conquered')).toBe('3')
      // 500 xp minus 50 for each of the four quests ever completed
      expect(statValue('Total XP Earned')).toBe('300')
    })

    it('shows the realm badge and the completion bonus', () => {
      renderRealmModal('foundations')

      expect(screen.getByText('🎖️ Badge Earned!')).toBeInTheDocument()
      expect(screen.getByText('🏘️')).toBeInTheDocument()
      expect(screen.getByText('Foundation Master')).toBeInTheDocument()
      expect(screen.getByText('+500')).toBeInTheDocument()
      expect(screen.getByText('Realm Completion Bonus XP!')).toBeInTheDocument()
    })

    it('teases the next realm and its unlock level', () => {
      renderRealmModal('foundations')

      expect(screen.getByText(/Next realm unlocks at level/).textContent).toContain('5')
    })
  })

  describe('the final realm', () => {
    it('has no badge, story or next realm to tease', () => {
      seedGame({ questIds: [] })
      renderRealmModal('aiintelligence')

      expect(screen.getByRole('heading', { level: 2, name: 'AI Nexus' })).toBeInTheDocument()
      expect(screen.queryByText('🎖️ Badge Earned!')).toBeNull()
      expect(screen.queryByText(/Next realm unlocks at level/)).toBeNull()
      // 'aiintelligence' has no entry in realmStories either
      expect(realmStories.aiintelligence).toBeUndefined()
      expect(screen.queryByText(/Welcome, young apprentice/)).toBeNull()
    })
  })

  describe('dismissal', () => {
    beforeEach(() => {
      seedGame({ questIds: [foundationsQuests[0].id] })
    })

    it('counts down from five seconds before dismissing itself', () => {
      const { onClose } = renderRealmModal('foundations')

      const button = () => screen.getByRole('button', { name: /Continue to Next Realm/ })
      expect(button().textContent).toContain('(5s)')

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(button().textContent).toContain('(4s)')
      expect(onClose).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(3000)
      })
      expect(button().textContent).toContain('(1s)')
      expect(onClose).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('dismisses immediately from the continue button', () => {
      const { onClose } = renderRealmModal('foundations')

      fireEvent.click(screen.getByRole('button', { name: /Continue to Next Realm/ }))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('dismisses on the N shortcut', () => {
      const { onClose } = renderRealmModal('foundations')

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }))
      })
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'N' }))
      })

      expect(onClose).toHaveBeenCalledTimes(2)
    })

    it('dismisses on Escape', () => {
      const { onClose } = renderRealmModal('foundations')

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      })

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('ignores keys that are not shortcuts', () => {
      const { onClose } = renderRealmModal('foundations')

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }))
      })

      expect(onClose).not.toHaveBeenCalled()
    })

    it('stops the countdown when it unmounts', () => {
      const { unmount, onClose } = renderRealmModal('foundations')

      unmount()
      act(() => {
        vi.advanceTimersByTime(10_000)
      })

      expect(onClose).not.toHaveBeenCalled()
    })
  })
})
