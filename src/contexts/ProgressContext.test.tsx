// DEPRECATED: These tests are for the deprecated ProgressContext
// @deprecated since 2026-06-24 - ProgressContext now wraps GameContext
// Tests for ProgressContext functionality are now covered by GameContext tests

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { GameProvider } from './GameContext'
import { useProgress } from './ProgressContext'

// Test component that uses the deprecated useProgress hook
function TestComponent() {
  const { progress, completeTopic, completedCount, totalTopics } = useProgress()

  return (
    <div>
      <p data-testid="xp">{progress.xp}</p>
      <p data-testid="level">{progress.level}</p>
      <p data-testid="streak">{progress.streakDays}</p>
      <p data-testid="completed-count">{completedCount}</p>
      <p data-testid="total-topics">{totalTopics}</p>
      <button onClick={() => completeTopic('test-topic', 'test-tech', 25)}>Complete</button>
      <button onClick={() => completeTopic('test-topic-2', 'test-tech', 25)}>Complete 2</button>
    </div>
  )
}

describe('ProgressContext', () => {
  // DEPRECATED: These tests verify backward compatibility of deprecated useProgress hook
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('provides initial state with default values', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    )

    expect(screen.getByTestId('xp')).toHaveTextContent('0')
    expect(screen.getByTestId('level')).toHaveTextContent('1')
    expect(screen.getByTestId('streak')).toHaveTextContent('0')
    expect(screen.getByTestId('completed-count')).toHaveTextContent('0')
  })

  it('completes a topic and awards XP', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    )

    const completeButton = screen.getByText('Complete')
    await act(async () => {
      completeButton.click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('xp')).toHaveTextContent('25')
    })
    expect(screen.getByTestId('level')).toHaveTextContent('1')
    expect(screen.getByTestId('completed-count')).toHaveTextContent('1')
  })

  it('tracks multiple completed topics', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    )

    const complete1 = screen.getByText('Complete')
    const complete2 = screen.getByText('Complete 2')

    await act(async () => {
      complete1.click()
    })

    await act(async () => {
      complete2.click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('xp')).toHaveTextContent('50')
    })
    expect(screen.getByTestId('completed-count')).toHaveTextContent('2')
  })

  it('prevents completing the same topic twice', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    )

    const completeButton = screen.getByText('Complete')

    await act(async () => {
      completeButton.click()
    })
    await act(async () => {
      completeButton.click()
    })

    // Should still only have 25 XP (not 50)
    await waitFor(() => {
      expect(screen.getByTestId('xp')).toHaveTextContent('25')
    })
    expect(screen.getByTestId('completed-count')).toHaveTextContent('1')
  })

  it('calculates level correctly based on XP', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    )

    // Complete 4 topics = 100 XP = level 2
    const complete1 = screen.getByText('Complete')
    const complete2 = screen.getByText('Complete 2')

    await act(async () => {
      complete1.click()
    })
    await act(async () => {
      complete2.click()
    })

    // 2 topics * 25 XP = 50 XP = still level 1 (needs 100 XP per level)
    await waitFor(() => {
      expect(screen.getByTestId('xp')).toHaveTextContent('50')
    })
    expect(screen.getByTestId('level')).toHaveTextContent('1')
  })

  it('throws error when used outside of provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useGame must be used within a GameProvider')

    consoleSpy.mockRestore()
  })
})
