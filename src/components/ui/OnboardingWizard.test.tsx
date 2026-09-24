import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameProvider } from '../../contexts/GameContext'
import type { CharacterClass } from '../../contexts/GameContext'
import OnboardingWizard from './OnboardingWizard'
import { STORAGE_KEYS } from '../../utils/gameUtils'

const CLASSES: { id: CharacterClass; icon: string; strength: string }[] = [
  { id: 'Cloud Knight', icon: '☁️', strength: 'Cloud & DevOps' },
  { id: 'Script Warrior', icon: '⚔️', strength: 'Bash & Python' },
  { id: 'Data Mage', icon: '🔮', strength: 'SQL & Data' },
  { id: 'DevOps Sage', icon: '🧙', strength: 'Full Stack' },
]

function renderWizard() {
  const onComplete = vi.fn()
  const utils = render(
    <GameProvider>
      <OnboardingWizard onComplete={onComplete} />
    </GameProvider>,
  )
  return { ...utils, onComplete }
}

function progressDots(container: HTMLElement): HTMLElement[] {
  const dots = container.querySelector('.flex.justify-center.gap-2')
  return dots ? Array.from(dots.querySelectorAll<HTMLDivElement>('div')) : []
}

function nameInput() {
  return screen.getByPlaceholderText('Enter your name...')
}

function continueButton() {
  return screen.getByRole('button', { name: 'Continue →' })
}

async function chooseClass(user: ReturnType<typeof userEvent.setup>, id: CharacterClass) {
  await user.click(screen.getByRole('button', { name: new RegExp(id) }))
}

async function advanceToSummary(
  user: ReturnType<typeof userEvent.setup>,
  chosen: CharacterClass = 'Data Mage',
) {
  await user.type(nameInput(), 'Nia')
  await user.click(continueButton())
  await chooseClass(user, chosen)
  await user.click(screen.getByRole('button', { name: 'Continue →' }))
}

beforeEach(() => {
  localStorage.clear()
})

describe('OnboardingWizard', () => {
  describe('step 0 - welcome', () => {
    it('opens on the welcome card with the name field focused', () => {
      const { container } = renderWizard()

      expect(
        screen.getByRole('heading', { level: 1, name: 'Welcome, Adventurer!' }),
      ).toBeInTheDocument()
      expect(nameInput()).toHaveFocus()
      expect(progressDots(container)).toHaveLength(3)
      expect(progressDots(container)[0]).toHaveClass('bg-amber-500', 'scale-125')
      expect(progressDots(container)[1]).toHaveClass('bg-slate-600')
      expect(screen.queryByText('Choose Your Path')).toBeNull()
    })

    it('keeps continue disabled until the name is long enough', async () => {
      const user = userEvent.setup()
      renderWizard()

      expect(continueButton()).toBeDisabled()
      expect(continueButton()).toHaveClass('cursor-not-allowed')

      await user.type(nameInput(), 'N')
      expect(continueButton()).toBeDisabled()

      await user.type(nameInput(), 'i')
      expect(continueButton()).toBeEnabled()
      expect(continueButton()).toHaveClass('bg-gradient-to-r')
      expect(continueButton()).not.toHaveClass('cursor-not-allowed')
    })

    it('advances on continue once the name is valid, keeping the dots in step', async () => {
      const user = userEvent.setup()
      const { container } = renderWizard()

      await user.type(nameInput(), 'Nia')
      await user.click(continueButton())

      expect(screen.getByRole('heading', { name: 'Choose Your Path' })).toBeInTheDocument()
      expect(progressDots(container)[0]).toHaveClass('bg-green-500')
      expect(progressDots(container)[1]).toHaveClass('bg-amber-500', 'scale-125')
      expect(progressDots(container)[2]).toHaveClass('bg-slate-600')
    })

    it('advances on Enter but refuses a name that is too short', async () => {
      const user = userEvent.setup()
      renderWizard()

      nameInput().focus()
      await user.keyboard('N{Enter}')
      expect(screen.queryByText('Choose Your Path')).toBeNull()

      await user.keyboard('i{Enter}')
      expect(screen.getByRole('heading', { name: 'Choose Your Path' })).toBeInTheDocument()
    })

    it('ignores leading and trailing whitespace when validating the name', async () => {
      const user = userEvent.setup()
      renderWizard()

      // trailing space is trimmed before the length check
      await user.type(nameInput(), 'Nia  ')
      expect(continueButton()).toBeEnabled()
    })

    it('refuses to continue on a whitespace-only name', async () => {
      const user = userEvent.setup()
      renderWizard()

      await user.type(nameInput(), '   ')

      expect(continueButton()).toBeDisabled()
      expect(screen.queryByText('Choose Your Path')).toBeNull()
    })
  })

  describe('step 1 - class selection', () => {
    it('offers the four classes with their strengths and pre-selects the first', async () => {
      const user = userEvent.setup()
      renderWizard()
      await user.type(nameInput(), 'Nia')
      await user.click(continueButton())

      for (const cls of CLASSES) {
        expect(screen.getByRole('button', { name: new RegExp(cls.id) })).toBeInTheDocument()
        expect(screen.getByText(cls.strength)).toBeInTheDocument()
      }
      expect(screen.getByRole('button', { name: /Cloud Knight/ })).toHaveClass('bg-amber-900/40')
      expect(screen.getByRole('button', { name: /Script Warrior/ })).not.toHaveClass(
        'bg-amber-900/40',
      )
    })

    it('moves the highlight to the class that was picked', async () => {
      const user = userEvent.setup()
      renderWizard()
      await user.type(nameInput(), 'Nia')
      await user.click(continueButton())

      await chooseClass(user, 'Data Mage')

      expect(screen.getByRole('button', { name: /Data Mage/ })).toHaveClass('bg-amber-900/40')
      expect(screen.getByRole('button', { name: /Cloud Knight/ })).not.toHaveClass(
        'bg-amber-900/40',
      )
    })

    it('goes back to the name step with the name still filled in', async () => {
      const user = userEvent.setup()
      renderWizard()
      await user.type(nameInput(), 'Nia')
      await user.click(continueButton())

      await user.click(screen.getByRole('button', { name: '← Back' }))

      expect(nameInput()).toHaveValue('Nia')
      expect(progressDots(document.body)[0]).toHaveClass('bg-amber-500')
    })
  })

  describe('step 2 - summary', () => {
    it('summarises the chosen class before the adventure starts', async () => {
      const user = userEvent.setup()
      renderWizard()
      await advanceToSummary(user, 'Data Mage')

      expect(screen.getByRole('heading', { name: 'All Ready!' })).toBeInTheDocument()
      expect(screen.getByText('🔮')).toBeInTheDocument()
      expect(screen.getByText(/Your journey begins/).textContent).toContain('Nia')
      expect(screen.getByText('Data Mage')).toBeInTheDocument()
      expect(screen.getByText('Starting Level:')).toBeInTheDocument()
      expect(screen.getByText('Quests Available:')).toBeInTheDocument()
      expect(progressDots(document.body)[2]).toHaveClass('bg-amber-500', 'scale-125')
      expect(progressDots(document.body)[0]).toHaveClass('bg-green-500')
    })

    it.each(CLASSES.map((cls) => [cls.id, cls.icon] as [CharacterClass, string]))(
      'shows the %s emblem on the summary screen',
      async (id, icon) => {
        const user = userEvent.setup()
        renderWizard()
        await advanceToSummary(user, id)

        expect(screen.getByText(icon)).toBeInTheDocument()
      },
    )

    it('goes back to class selection', async () => {
      const user = userEvent.setup()
      renderWizard()
      await advanceToSummary(user)

      await user.click(screen.getByRole('button', { name: '← Back' }))

      expect(screen.getByRole('heading', { name: 'Choose Your Path' })).toBeInTheDocument()
    })

    it('completes onboarding with the trimmed name and chosen class', async () => {
      const user = userEvent.setup()
      const { onComplete } = renderWizard()
      await user.type(nameInput(), '  Nia  ')
      await user.click(continueButton())
      await chooseClass(user, 'Script Warrior')
      await user.click(screen.getByRole('button', { name: 'Continue →' }))

      await user.click(screen.getByRole('button', { name: '🚀 Begin Adventure!' }))

      expect(onComplete).toHaveBeenCalledTimes(1)

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME) ?? '{}') as {
        character?: { name?: string; class?: string }
        hasSeenOnboarding?: boolean
      }
      expect(saved.hasSeenOnboarding).toBe(true)
      expect(saved.character?.name).toBe('Nia')
      expect(saved.character?.class).toBe('Script Warrior')
    })
  })
})
