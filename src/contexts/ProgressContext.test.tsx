import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { ProgressProvider, useProgress } from './ProgressContext'

// Test component that uses the context
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
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('provides initial state with default values', async () => {
    render(
      <ProgressProvider>
        <TestComponent />
      </ProgressProvider>
    )

    expect(screen.getByTestId('xp')).toHaveTextContent('0')
    expect(screen.getByTestId('level')).toHaveTextContent('1')
    expect(screen.getByTestId('streak')).toHaveTextContent('0')
    expect(screen.getByTestId('completed-count')).toHaveTextContent('0')
  })

  it('completes a topic and awards XP', async () => {
    render(
      <ProgressProvider>
        <TestComponent />
      </ProgressProvider>
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
      <ProgressProvider>
        <TestComponent />
      </ProgressProvider>
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
      <ProgressProvider>
        <TestComponent />
      </ProgressProvider>
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
      <ProgressProvider>
        <TestComponent />
      </ProgressProvider>
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

    // 4 topics * 25 XP = 100 XP = level 2
    await waitFor(() => {
      expect(screen.getByTestId('xp')).toHaveTextContent('50')
    })
    expect(screen.getByTestId('level')).toHaveTextContent('1') // Still level 1 (needs 100 XP per level)
  })

  it('persists progress to localStorage', async () => {
    const { unmount } = render(
      <ProgressProvider>
        <TestComponent />
      </ProgressProvider>
    )

    const completeButton = screen.getByText('Complete')
    await act(async () => {
      completeButton.click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('xp')).toHaveTextContent('25')
    })

    // Unmount and remount
    unmount()

    render(
      <ProgressProvider>
        <TestComponent />
      </ProgressProvider>
    )

    // Should have persisted XP
    await waitFor(() => {
      expect(screen.getByTestId('xp')).toHaveTextContent('25')
    })
  })

  it('throws error when used outside of provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useProgress must be used within a ProgressProvider')

    consoleSpy.mockRestore()
  })

  it('handles corrupted localStorage data gracefully', () => {
    // Set storage with correct key but corrupted JSON
    localStorage.setItem('devopsquest_progress', 'invalid-json-{')

    render(
      <ProgressProvider>
        <TestComponent />
      </ProgressProvider>
    )

    // Should fall back to default progress
    expect(screen.getByTestId('xp')).toHaveTextContent('0')
    expect(screen.getByTestId('level')).toHaveTextContent('1')
  })

  it('continues streak when completing topic on consecutive days', async () => {
    // Pre-set progress with yesterday's date
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const storedProgress = {
      xp: 25,
      level: 1,
      streakDays: 3,
      lastActive: yesterday,
      completedTopics: [{ topicId: 'prev-topic', technologyId: 'test-tech', completed: true, xpEarned: 25 }],
    }
    localStorage.setItem('devopsquest_progress', JSON.stringify(storedProgress))

    render(
      <ProgressProvider>
        <TestComponent />
      </ProgressProvider>
    )

    // Complete a new topic
    const completeButton = screen.getByText('Complete')
    await act(async () => {
      completeButton.click()
    })

    // Streak should continue (3 + 1 = 4)
    await waitFor(() => {
      expect(screen.getByTestId('streak')).toHaveTextContent('4')
    })
  })

  it('resets streak when completing topic after missing a day', async () => {
    // Pre-set progress with a old date (not yesterday or today)
    const oldDate = new Date(Date.now() - 172800000).toISOString().split('T')[0] // 2 days ago
    const storedProgress = {
      xp: 25,
      level: 1,
      streakDays: 3,
      lastActive: oldDate,
      completedTopics: [{ topicId: 'prev-topic', technologyId: 'test-tech', completed: true, xpEarned: 25 }],
    }
    localStorage.setItem('devopsquest_progress', JSON.stringify(storedProgress))

    render(
      <ProgressProvider>
        <TestComponent />
      </ProgressProvider>
    )

    // Complete a new topic - streak should reset to 1
    const completeButton = screen.getByText('Complete')
    await act(async () => {
      completeButton.click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('streak')).toHaveTextContent('1')
    })
  })
})
