import { describe, it, expect, beforeEach, afterEach, vi, type MockInstance } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import TreasureChest, { getRandomLoot, type LootDrop } from './TreasureChest'

const RARITY_LOOT: Record<LootDrop['rarity'], LootDrop> = {
  common: { type: 'xp', value: 10, name: '+10 XP', rarity: 'common', icon: '✨' },
  rare: { type: 'gold', value: 25, name: '+25 Gold', rarity: 'rare', icon: '💰' },
  epic: { type: 'collectible', value: 1, name: 'Random Collectible', rarity: 'epic', icon: '🎁' },
  legendary: { type: 'badge', value: 1, name: 'Rare Badge', rarity: 'legendary', icon: '🏆' },
}

// Rarity tiers are rolled from Math.random, so it is pinned to keep drops
// deterministic. A value of 0.99 rolls 99, past every legendary threshold.
let randomSpy: MockInstance<() => number>

beforeEach(() => {
  vi.useFakeTimers()
  randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99)
})

afterEach(() => {
  randomSpy.mockRestore()
  vi.useRealTimers()
})

function renderChest(
  props: {
    questDifficulty?: number
    preGeneratedLoot?: LootDrop | null
    onChestOpen?: () => void
  } = {},
) {
  const onChestOpen = vi.fn()
  const utils = render(<TreasureChest {...props} onChestOpen={onChestOpen} />)
  return { ...utils, onChestOpen }
}

function openChest() {
  fireEvent.click(screen.getByRole('button', { name: 'Open treasure chest' }))
}

describe('TreasureChest', () => {
  describe('closed state', () => {
    it('shows a locked chest with the drop-chance hint', () => {
      renderChest()

      expect(screen.getByRole('button', { name: 'Open treasure chest' })).toBeEnabled()
      expect(screen.getByText('🎲 30% chance per quest!')).toBeInTheDocument()
      expect(screen.getByText('🔒')).toBeInTheDocument()
      expect(screen.queryByText(/Loot!/)).toBeNull()
    })
  })

  describe('opening', () => {
    it('plays the opening animation before revealing the loot', () => {
      const { onChestOpen } = renderChest()

      openChest()

      const chest = screen.getByRole('button', { name: 'Open treasure chest' })
      expect(chest).toBeDisabled()
      expect(chest).toHaveClass('animate-bounce')
      expect(onChestOpen).not.toHaveBeenCalled()
      expect(screen.queryByText(/Loot!/)).toBeNull()

      act(() => {
        vi.advanceTimersByTime(799)
      })
      expect(screen.getByRole('button', { name: 'Open treasure chest' })).toBeDisabled()

      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(screen.getByRole('button', { name: 'Treasure chest opened' })).toBeInTheDocument()
      expect(onChestOpen).toHaveBeenCalledTimes(1)
    })

    it('rolls a legendary drop for a standard quest', () => {
      renderChest()

      openChest()
      act(() => {
        vi.advanceTimersByTime(800)
      })

      expect(screen.getByText('🔮')).toBeInTheDocument()
      expect(screen.getByText('Legendary Loot!')).toBeInTheDocument()
      expect(screen.getByText('legendary Loot!')).toBeInTheDocument()
    })

    it('uses the easier loot table of a high difficulty quest', () => {
      // difficulty 20 pushes the rare threshold to 20, so a roll of 10 is rare.
      randomSpy.mockReturnValue(0.1)
      renderChest({ questDifficulty: 20 })

      openChest()
      act(() => {
        vi.advanceTimersByTime(800)
      })

      expect(screen.getByText('+50 XP')).toBeInTheDocument()
      expect(screen.getByText('rare Loot!')).toBeInTheDocument()
    })

    it('reveals pre-generated loot instead of rolling', () => {
      const loot = RARITY_LOOT.epic
      const { onChestOpen } = renderChest({ preGeneratedLoot: loot })

      openChest()
      act(() => {
        vi.advanceTimersByTime(800)
      })

      expect(screen.getByText('🎁')).toBeInTheDocument()
      expect(screen.getByText('Random Collectible')).toBeInTheDocument()
      expect(onChestOpen).toHaveBeenCalledWith(loot)
    })

    it('cannot be opened twice', () => {
      const { onChestOpen } = renderChest({ preGeneratedLoot: RARITY_LOOT.common })

      openChest()
      act(() => {
        vi.advanceTimersByTime(800)
      })
      fireEvent.click(screen.getByRole('button', { name: 'Treasure chest opened' }))

      act(() => {
        vi.advanceTimersByTime(800)
      })
      expect(onChestOpen).toHaveBeenCalledTimes(1)
    })

    it('ignores clicks that land while the opening animation is still playing', () => {
      const { onChestOpen } = renderChest({ preGeneratedLoot: RARITY_LOOT.rare })

      openChest()
      // Halfway through the 800ms animation, an impatient player clicks again.
      act(() => {
        vi.advanceTimersByTime(400)
      })
      openChest()
      expect(screen.queryByText('💰')).toBeNull()

      act(() => {
        vi.advanceTimersByTime(400)
      })
      // The second click must not have booked a second reveal.
      expect(onChestOpen).toHaveBeenCalledTimes(1)
      expect(screen.getByText('💰')).toBeInTheDocument()
    })
  })

  describe('loot popup', () => {
    it.each([
      ['common', 'text-slate-300'],
      ['rare', 'text-blue-400'],
      ['epic', 'text-purple-400'],
      ['legendary', 'text-amber-400'],
    ] as [LootDrop['rarity'], string][])(
      'colours %s loot with its rarity tint',
      (rarity, tintClass) => {
        renderChest({ preGeneratedLoot: RARITY_LOOT[rarity] })

        openChest()
        act(() => {
          vi.advanceTimersByTime(800)
        })

        expect(screen.getByText(RARITY_LOOT[rarity].name)).toHaveClass(tintClass)
        expect(screen.getByText(`${rarity} Loot!`)).toBeInTheDocument()
      },
    )

    it('hides the drop-chance hint and dims the chest while the loot is shown', () => {
      renderChest({ preGeneratedLoot: RARITY_LOOT.common })

      openChest()
      act(() => {
        vi.advanceTimersByTime(800)
      })

      expect(screen.queryByText('🎲 30% chance per quest!')).toBeNull()
      expect(screen.getByRole('button', { name: 'Treasure chest opened' })).toHaveClass(
        'opacity-50',
      )
    })

    it('closes back to a locked chest and drops the loot reference', () => {
      renderChest({ preGeneratedLoot: RARITY_LOOT.common })

      openChest()
      act(() => {
        vi.advanceTimersByTime(800)
      })
      fireEvent.click(screen.getByRole('button', { name: 'Click to close' }))

      expect(screen.getByRole('button', { name: 'Open treasure chest' })).toBeEnabled()
      expect(screen.getByText('🎲 30% chance per quest!')).toBeInTheDocument()
      expect(screen.queryByText('+10 XP')).toBeNull()
      expect(screen.queryByRole('button', { name: 'Click to close' })).toBeNull()
    })
  })

  describe('unmount during the opening animation', () => {
    it('does not report loot for a chest that is no longer on screen', () => {
      const { onChestOpen, unmount } = renderChest({ preGeneratedLoot: RARITY_LOOT.common })

      openChest()
      unmount()
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(onChestOpen).not.toHaveBeenCalled()
    })
  })

  describe('reuse', () => {
    it('can be reopened after being closed and pays out again', () => {
      const { onChestOpen } = renderChest({ preGeneratedLoot: RARITY_LOOT.epic })

      openChest()
      act(() => {
        vi.advanceTimersByTime(800)
      })
      fireEvent.click(screen.getByRole('button', { name: 'Click to close' }))
      expect(onChestOpen).toHaveBeenCalledTimes(1)

      openChest()
      act(() => {
        vi.advanceTimersByTime(800)
      })

      expect(onChestOpen).toHaveBeenCalledTimes(2)
      expect(onChestOpen).toHaveBeenLastCalledWith(RARITY_LOOT.epic)
      expect(screen.getByText('Random Collectible')).toBeInTheDocument()
    })

    it('works without an onChestOpen callback', () => {
      render(<TreasureChest preGeneratedLoot={RARITY_LOOT.legendary} />)

      openChest()
      act(() => {
        vi.advanceTimersByTime(800)
      })

      // The loot still lands on screen; nothing blew up on the missing callback.
      expect(screen.getByText('🏆')).toBeInTheDocument()
      expect(screen.getByText('Rare Badge')).toBeInTheDocument()
    })
  })
})

describe('getRandomLoot', () => {
  it.each([
    [0, 0.4, 'common', '+25 XP'],
    [0, 0.55, 'rare', '+25 Gold'],
    [2, 0.9, 'epic', 'Random Collectible'],
    [3, 0.95, 'legendary', 'Legendary Loot!'],
  ] as [number, number, LootDrop['rarity'], string][])(
    'rolls %s loot from a difficulty %i quest',
    (difficulty, roll, rarity, name) => {
      randomSpy.mockReturnValue(roll)

      expect(getRandomLoot(difficulty)).toMatchObject({ rarity, name })
    },
  )

  it('defaults to difficulty 1 when none is supplied', () => {
    randomSpy.mockReturnValue(0.2) // 20 < 50 - 5*1, so common

    const loot = getRandomLoot()

    expect(loot.rarity).toBe('common')
    expect(loot.name).toBe('+10 XP')
  })

  it('can no longer roll common loot once difficulty is high enough', () => {
    randomSpy.mockReturnValue(0.01) // 1 < 50 - 20*5 is false, 1 < 80 - 20*3 is true

    expect(getRandomLoot(20).rarity).toBe('rare')
  })

  it('always returns a loot drop drawn from the rolled rarity table', () => {
    randomSpy.mockRestore()
    for (let i = 0; i < 200; i++) {
      const loot = getRandomLoot(3)
      expect(['common', 'rare', 'epic', 'legendary']).toContain(loot.rarity)
      expect(typeof loot.value).toBe('number')
      expect(loot.icon.length).toBeGreaterThan(0)
    }
  })
})
