import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProgressProvider } from '@/contexts/ProgressContext'
import DashboardPage from './DashboardPage'

function renderWithRouter(ui: React.ReactElement, totalTopics = 100) {
  return render(ui, { wrapper: ({ children }) => (
    <MemoryRouter>
      <ProgressProvider totalTopics={totalTopics}>
        {children}
      </ProgressProvider>
    </MemoryRouter>
  )})
}

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders page heading', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders statistics section', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Total XP')).toBeInTheDocument()
    expect(screen.getByText('Current Streak')).toBeInTheDocument()
    expect(screen.getByText('Topics Completed')).toBeInTheDocument()
  })

  it('renders achievements section', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Achievements')).toBeInTheDocument()
  })

  it('renders progress to next level section', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Progress to Next Level')).toBeInTheDocument()
  })

  it('renders continue learning section', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Continue Learning')).toBeInTheDocument()
    expect(screen.getByText('Go to Learning Path')).toHaveAttribute('href', '/learn')
  })

  it('renders streak fire emoji', () => {
    renderWithRouter(<DashboardPage />)
    expect(document.querySelector('[aria-hidden="true"]')).toBeTruthy()
  })

  it('renders level progress text', () => {
    renderWithRouter(<DashboardPage />)
    const levelElements = screen.getAllByText(/Level \d/)
    expect(levelElements.length).toBeGreaterThan(0)
  })

  it('shows achievement unlock message when none earned', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText(/Complete topics and maintain streaks/i)).toBeInTheDocument()
  })

  it('displays XP achievement when xp is 1000+', () => {
    // Pre-set progress with 1000+ XP to trigger XP Hunter achievement
    const storedProgress = {
      xp: 1100,
      level: 12,
      streakDays: 5,
      lastActive: new Date().toISOString().split('T')[0],
      completedTopics: [],
    }
    localStorage.setItem('devopsquest_progress', JSON.stringify(storedProgress))

    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('XP Hunter')).toBeInTheDocument()
  })

  it('displays level achievement when level is 5+', () => {
    // Pre-set progress with level 5+
    const storedProgress = {
      xp: 450,
      level: 5,
      streakDays: 0,
      lastActive: new Date().toISOString().split('T')[0],
      completedTopics: [],
    }
    localStorage.setItem('devopsquest_progress', JSON.stringify(storedProgress))

    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Rising Star')).toBeInTheDocument()
  })

  it('displays streak achievement when streak is 7+', () => {
    // Pre-set progress with 7+ day streak
    const storedProgress = {
      xp: 100,
      level: 2,
      streakDays: 7,
      lastActive: new Date().toISOString().split('T')[0],
      completedTopics: [],
    }
    localStorage.setItem('devopsquest_progress', JSON.stringify(storedProgress))

    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Dedicated Learner')).toBeInTheDocument()
  })

  it('displays topics achievement when 10+ topics completed', () => {
    // Pre-set progress with 10 completed topics
    const storedProgress = {
      xp: 250,
      level: 3,
      streakDays: 0,
      lastActive: new Date().toISOString().split('T')[0],
      completedTopics: Array(10).fill(null).map((_, i) => ({
        topicId: `topic-${i}`,
        technologyId: 'html',
        completed: true,
        xpEarned: 25,
      })),
    }
    localStorage.setItem('devopsquest_progress', JSON.stringify(storedProgress))

    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Knowledge Seeker')).toBeInTheDocument()
  })

  it('displays progress bar at 0% when no topics completed', () => {
    const storedProgress = {
      xp: 0,
      level: 1,
      streakDays: 0,
      lastActive: new Date().toISOString().split('T')[0],
      completedTopics: [],
    }
    localStorage.setItem('devopsquest_progress', JSON.stringify(storedProgress))

    renderWithRouter(<DashboardPage />)
    // XP progress text format is "{xpProgress}/{100} XP to next level"
    expect(screen.getByText('0/100 XP to next level')).toBeInTheDocument()
  })

  it('displays multiple achievements when conditions are met', () => {
    // Set up state that triggers multiple achievements
    const storedProgress = {
      xp: 1500,
      level: 16,
      streakDays: 10,
      lastActive: new Date().toISOString().split('T')[0],
      completedTopics: Array(15).fill(null).map((_, i) => ({
        topicId: `topic-${i}`,
        technologyId: 'html',
        completed: true,
        xpEarned: 25,
      })),
    }
    localStorage.setItem('devopsquest_progress', JSON.stringify(storedProgress))

    renderWithRouter(<DashboardPage />)
    // Should show XP Hunter (1000+ XP), Rising Star (level 5+), Dedicated Learner (7+ streak), Knowledge Seeker (10+ topics)
    expect(screen.getByText('XP Hunter')).toBeInTheDocument()
    expect(screen.getByText('Rising Star')).toBeInTheDocument()
    expect(screen.getByText('Dedicated Learner')).toBeInTheDocument()
    expect(screen.getByText('Knowledge Seeker')).toBeInTheDocument()
  })

  it('displays XP Hunter and XP Master achievements', () => {
    const storedProgress = {
      xp: 5500,
      level: 56,
      streakDays: 0,
      lastActive: new Date().toISOString().split('T')[0],
      completedTopics: [],
    }
    localStorage.setItem('devopsquest_progress', JSON.stringify(storedProgress))

    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('XP Hunter')).toBeInTheDocument()
    expect(screen.getByText('XP Master')).toBeInTheDocument()
  })

  it('handles totalTopics of 0 without division by zero', () => {
    // This exercises the totalTopics > 0 ternary branch (false path)
    renderWithRouter(<DashboardPage />, 0)
    expect(screen.getByText('0% complete')).toBeInTheDocument()
  })

  it('shows percentage when totalTopics is greater than 0', () => {
    // This exercises the totalTopics > 0 ternary branch (true path)
    const storedProgress = {
      xp: 100,
      level: 2,
      streakDays: 0,
      lastActive: new Date().toISOString().split('T')[0],
      completedTopics: [],
    }
    localStorage.setItem('devopsquest_progress', JSON.stringify(storedProgress))
    renderWithRouter(<DashboardPage />, 100)
    expect(screen.getByText('0% complete')).toBeInTheDocument()
  })
})
