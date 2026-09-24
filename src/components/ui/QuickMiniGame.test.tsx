import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import QuickMiniGame from './QuickMiniGame'

function pressKey(key: string) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  })
}

// The game type, xp bonus and content roll are all drawn from Math.random at
// mount time. The first two rolls are fixed per helper, and every remaining
// roll (the shuffle comparators) returns 0.5, which leaves the arrays ordered.
function renderGame(rolls: number[]) {
  const onComplete = vi.fn()
  const onSkip = vi.fn()
  const randomSpy = vi.spyOn(Math, 'random')
  for (const roll of rolls) {
    randomSpy.mockReturnValueOnce(roll)
  }
  randomSpy.mockReturnValue(0.5)

  const utils = render(<QuickMiniGame onComplete={onComplete} onSkip={onSkip} />)
  randomSpy.mockRestore()
  return { ...utils, onComplete, onSkip }
}

// roll 1 is high enough to pick trivia, and gives a bonus of floor(0.5*15)+10
function renderTrivia() {
  return renderGame([0.99, 0.5, 0])
}

function renderMatching() {
  return renderGame([0.01, 0.5, 0])
}

// The score line is interpolated from two numbers, so match on the collapsed
// text of the paragraph that renders it.
function matchedLabel(count: string) {
  return screen.getByText((_, element) => {
    if (element?.tagName !== 'P') return false
    const text = element.textContent.replace(/\s+/g, ' ').trim()
    return text === `${count} matched`
  })
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('QuickMiniGame', () => {
  it('mounts the trivia game when the dice roll high', () => {
    renderTrivia()

    expect(screen.getByText('🎯 Quick Trivia!')).toBeInTheDocument()
    expect(screen.queryByText('🔗 Match the Terms!')).toBeNull()
  })

  it('mounts the matching game when the dice roll low', () => {
    renderMatching()

    expect(screen.getByText('🔗 Match the Terms!')).toBeInTheDocument()
    expect(screen.queryByText('🎯 Quick Trivia!')).toBeNull()
  })
})

describe('TriviaGame', () => {
  it('shows the question, its options and the xp at stake', () => {
    renderTrivia()

    expect(screen.getByText('What does CI/CD stand for?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continuous Integration/Continuous Deployment' }))
    expect(screen.getByRole('button', { name: 'Code Input/Code Output' })).toBeEnabled()
    expect(screen.getByText('+17 XP')).toBeInTheDocument()
    expect(screen.getByText(/N=auto solve, Esc=skip/)).toBeInTheDocument()
    expect(screen.queryByText(/Continue/)).toBeNull()
  })

  it('marks the right answer green and offers the bonus on continue', () => {
    const { onComplete } = renderTrivia()

    fireEvent.click(
      screen.getByRole('button', { name: 'Continuous Integration/Continuous Deployment' }),
    )

    expect(screen.getByText('🎉 Correct!')).toBeInTheDocument()
    expect(screen.queryByText('❌ Not quite!')).toBeNull()
    expect(screen.getByText(/CI\/CD pipelines automate/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Continuous Integration/Continuous Deployment' }),
    ).toHaveClass('bg-green-900/50', 'border-green-500')

    fireEvent.click(screen.getByRole('button', { name: 'Continue (+17 XP)' }))
    expect(onComplete).toHaveBeenCalledWith(true, 17)
  })

  it('marks a wrong answer red, highlights the right one and awards nothing', () => {
    const { onComplete } = renderTrivia()

    fireEvent.click(screen.getByRole('button', { name: 'Code Input/Code Output' }))

    expect(screen.getByText('❌ Not quite!')).toBeInTheDocument()
    expect(screen.queryByText('🎉 Correct!')).toBeNull()
    expect(screen.getByRole('button', { name: 'Code Input/Code Output' })).toHaveClass(
      'bg-red-900/50',
      'border-red-500',
    )
    expect(
      screen.getByRole('button', { name: 'Continuous Integration/Continuous Deployment' }),
    ).toHaveClass('bg-green-900/50')

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onComplete).toHaveBeenCalledWith(false, 0)
  })

  it('locks the options once a question has been answered', () => {
    renderTrivia()

    fireEvent.click(screen.getByRole('button', { name: 'Code Input/Code Output' }))
    expect(screen.getByRole('button', { name: 'Code Input/Code Output' })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Continuous Integration/Continuous Deployment' }),
    ).toBeDisabled()

    // The late click on the right answer must not change the outcome
    fireEvent.click(
      screen.getByRole('button', { name: 'Continuous Integration/Continuous Deployment' }),
    )
    expect(screen.getByText('❌ Not quite!')).toBeInTheDocument()
  })

  it('solves the question with the N shortcut', () => {
    const { onComplete } = renderTrivia()

    pressKey('n')

    expect(screen.getByText('🎉 Correct!')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Continue (+17 XP)' }))
    expect(onComplete).toHaveBeenCalledWith(true, 17)
  })

  it('skips the game with the Escape key', () => {
    const { onSkip, onComplete } = renderTrivia()

    pressKey('Escape')

    expect(onSkip).toHaveBeenCalledTimes(1)
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('skips the game from the header close button', () => {
    const { onSkip, onComplete } = renderTrivia()

    fireEvent.click(screen.getByRole('button', { name: '×' }))

    expect(onSkip).toHaveBeenCalledTimes(1)
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('skips from the footer link', () => {
    const { onSkip } = renderTrivia()

    fireEvent.click(screen.getByRole('button', { name: 'Skip for now' }))

    expect(onSkip).toHaveBeenCalledTimes(1)
  })
})

describe('MatchingGame', () => {
  it('lists the four terms and four definitions side by side', () => {
    renderMatching()

    expect(screen.getByText('Terms')).toBeInTheDocument()
    expect(screen.getByText('Definitions')).toBeInTheDocument()
    for (const term of ['Docker', 'Kubernetes', 'Jenkins', 'Git']) {
      expect(screen.getByRole('button', { name: term })).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: 'Container platform' })).toBeInTheDocument()
    expect(matchedLabel('0 / 4')).toBeInTheDocument()
    expect(screen.getByText('+17 XP')).toBeInTheDocument()
  })

  it('pairs a term with its definition and locks both', () => {
    renderMatching()

    fireEvent.click(screen.getByRole('button', { name: 'Docker' }))
    expect(screen.getByRole('button', { name: 'Docker' })).toHaveClass(
      'bg-amber-900/50',
      'border-amber-500',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Container platform' }))

    expect(screen.getByRole('button', { name: 'Docker' })).toHaveClass(
      'bg-green-900/50',
      'border-green-600',
    )
    expect(screen.getByRole('button', { name: 'Container platform' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Docker' })).toBeDisabled()
    expect(matchedLabel('1 / 4')).toBeInTheDocument()
  })

  it('does nothing when a definition is clicked before a term is selected', () => {
    renderMatching()

    fireEvent.click(screen.getByRole('button', { name: 'Container platform' }))

    expect(matchedLabel('0 / 4')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Container platform' })).toBeEnabled()
    expect(screen.queryByRole('button', { name: /amber/ })).toBeNull()
  })

  it('flashes a wrong definition and clears it again', () => {
    renderMatching()

    fireEvent.click(screen.getByRole('button', { name: 'Docker' }))
    fireEvent.click(screen.getByRole('button', { name: 'Version control' }))

    expect(screen.getByRole('button', { name: 'Version control' })).toHaveClass(
      'bg-red-900/50',
      'animate-shake',
    )
    expect(matchedLabel('0 / 4')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(800)
    })
    expect(screen.getByRole('button', { name: 'Version control' })).not.toHaveClass('bg-red-900/50')
    expect(screen.getByRole('button', { name: 'Version control' })).toBeEnabled()
  })

  it('moves the selection when a different term is clicked', () => {
    renderMatching()

    fireEvent.click(screen.getByRole('button', { name: 'Docker' }))
    fireEvent.click(screen.getByRole('button', { name: 'Git' }))

    expect(screen.getByRole('button', { name: 'Git' })).toHaveClass('bg-amber-900/50')
    expect(screen.getByRole('button', { name: 'Docker' })).not.toHaveClass('bg-amber-900/50')
    expect(matchedLabel('0 / 4')).toBeInTheDocument()
  })

  it('ignores clicks on already matched terms', () => {
    renderMatching()

    fireEvent.click(screen.getByRole('button', { name: 'Docker' }))
    fireEvent.click(screen.getByRole('button', { name: 'Container platform' }))
    fireEvent.click(screen.getByRole('button', { name: 'Docker' }))

    // No term is left selected after the match, and the score is unchanged
    expect(screen.getByRole('button', { name: 'Docker' })).not.toHaveClass('bg-amber-900/50')
    expect(matchedLabel('1 / 4')).toBeInTheDocument()
  })

  it('pays the bonus once every pair has been matched', () => {
    const { onComplete } = renderMatching()
    const pairs: [string, string][] = [
      ['Docker', 'Container platform'],
      ['Kubernetes', 'Container orchestrator'],
      ['Jenkins', 'CI/CD automation'],
      ['Git', 'Version control'],
    ]

    for (const [term, definition] of pairs) {
      fireEvent.click(screen.getByRole('button', { name: term }))
      fireEvent.click(screen.getByRole('button', { name: definition }))
    }

    expect(matchedLabel('4 / 4')).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(onComplete).toHaveBeenCalledWith(true, 17)
  })

  it('auto-solves every pair with the N shortcut', () => {
    const { onComplete } = renderMatching()

    pressKey('n')

    expect(matchedLabel('4 / 4')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Docker' })).toBeDisabled()

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(true, 17)
  })

  it('forfeits the bonus from the footer', () => {
    const { onComplete, onSkip } = renderMatching()

    fireEvent.click(screen.getByRole('button', { name: 'Give up' }))

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(false, 0)
    expect(onSkip).not.toHaveBeenCalled()
  })

  it('skips the game with the Escape key', () => {
    const { onSkip, onComplete } = renderMatching()

    pressKey('Escape')

    expect(onSkip).toHaveBeenCalledTimes(1)
    expect(onComplete).not.toHaveBeenCalled()
  })
})
