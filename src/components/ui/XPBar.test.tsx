import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameProvider } from '../../contexts/GameContext'
import { XPBar } from './XPBar'
import { STORAGE_KEYS, XP_PER_LEVEL } from '../../utils/gameUtils'

// Seed a save through the same channel the app uses: GameProvider restores a
// persisted state from localStorage on mount and merges it with defaults.
function seedGame(character: Record<string, unknown>) {
  localStorage.setItem(
    STORAGE_KEYS.GAME,
    JSON.stringify({
      character,
      badges: [], // required by the provider's save validation
    }),
  )
}

function renderXpBar(props: { compact?: boolean } = {}) {
  return render(
    <GameProvider>
      <XPBar {...props} />
    </GameProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('XPBar', () => {
  describe('compact variant', () => {
    it('shows the level, the xp-for-level counter and total xp for a new character', () => {
      renderXpBar({ compact: true })

      expect(screen.getByText('LV 1')).toBeInTheDocument()
      expect(screen.getByText(`0/${XP_PER_LEVEL}`)).toBeInTheDocument()
      expect(screen.getByText('⚡0')).toBeInTheDocument()
      expect(screen.getByTitle('Total XP Earned')).toBeInTheDocument()
    })

    it('reports the xp earned inside the current level only', () => {
      seedGame({ level: 3, xp: 250 }) // 250 - (3 - 1) * 100 = 50 into level 3
      renderXpBar({ compact: true })

      expect(screen.getByText('LV 3')).toBeInTheDocument()
      expect(screen.getByText('50/100')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
    })

    it('hides the level title and the "to next level" copy', () => {
      renderXpBar({ compact: true })
      expect(screen.queryByText(/XP to next level/)).toBeNull()
      expect(screen.queryByText(/to Level Up/)).toBeNull()
    })
  })

  describe('full variant', () => {
    it('renders the character title and progress copy for a new character', () => {
      renderXpBar()

      expect(screen.getByText('DevOps Apprentice')).toBeInTheDocument()
      expect(screen.getByText(`0 / ${XP_PER_LEVEL} XP to next level`)).toBeInTheDocument()
      expect(screen.getByText('Level 1 • Total XP: 0')).toBeInTheDocument()
      expect(screen.getByText(`+${XP_PER_LEVEL} XP to Level Up`)).toBeInTheDocument()
    })

    it('reflects a mid-level character', () => {
      seedGame({ level: 6, xp: 550, title: 'DevOps Journeyman' })
      renderXpBar()

      expect(screen.getByText('DevOps Journeyman')).toBeInTheDocument()
      expect(screen.getByText('50 / 100 XP to next level')).toBeInTheDocument()
      expect(screen.getByText('Level 6 • Total XP: 550')).toBeInTheDocument()
      expect(screen.getByText('+50 XP to Level Up')).toBeInTheDocument()
    })

    it('clamps the bar at 100% when xp overflows the level', () => {
      seedGame({ level: 1, xp: 250 })
      renderXpBar()

      const bar = screen.getByRole('progressbar')
      expect(bar).toHaveAttribute('aria-valuenow', '250')
      expect(bar.firstElementChild).toHaveStyle({ width: '100%' })
    })
  })

  describe('accessibility', () => {
    it('exposes a labelled progressbar with min/max bounds in both variants', () => {
      const { rerender } = renderXpBar({ compact: true })
      let bar = screen.getByRole('progressbar', { name: 'Experience progress' })
      expect(bar).toHaveAttribute('aria-valuemin', '0')
      expect(bar).toHaveAttribute('aria-valuemax', String(XP_PER_LEVEL))
      expect(bar.firstElementChild).toHaveStyle({ width: '0%' })

      localStorage.clear()
      rerender(
        <GameProvider>
          <XPBar />
        </GameProvider>,
      )
      bar = screen.getByRole('progressbar', { name: 'Experience progress' })
      expect(bar).toHaveAttribute('aria-valuemin', '0')
      expect(bar).toHaveAttribute('aria-valuemax', String(XP_PER_LEVEL))
      expect(bar).toHaveAttribute('aria-valuenow', '0')
    })

    it('widths the fill to the xp share of the level', () => {
      seedGame({ level: 4, xp: 370 }) // 70 into level 4
      renderXpBar({ compact: true })

      expect(screen.getByRole('progressbar').firstElementChild).toHaveStyle({ width: '70%' })
    })
  })
})
