import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GameProvider } from '@/contexts/GameContext'
import DashboardPage from './DashboardPage'

function renderWithRouter(ui: React.ReactElement) {
  return render(ui, { wrapper: ({ children }) => (
    <MemoryRouter>
      <GameProvider>{children}</GameProvider>
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
    // Pre-set game state with 1000+ XP to trigger XP Hunter achievement
    const storedGame = {
      character: {
        name: 'Hero',
        class: 'Cloud Knight',
        avatar: '🧙',
        title: 'Novice',
        level: 12,
        xp: 1100,
        xpToNextLevel: 100,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        gold: 0,
        streakDays: 5,
        lastActive: new Date().toISOString().split('T')[0],
        joinedAt: new Date().toISOString(),
        skillPoints: 0,
        skillAllocations: {},
      },
      completedQuests: [],
      currentQuestId: null,
      achievements: [],
      showVictory: false,
      lastVictory: null,
      sideQuests: [],
      badges: [],
      milestones: [],
      collectibles: [],
      dailyRewardsClaimed: [],
      lastDailyReset: new Date().toISOString().split('T')[0],
      completedRealms: [],
      showRealmCompletion: null,
      lastRealmCompletion: null,
      stats: {
        quizCount: 0,
        quizPerfectCount: 0,
        quizStreak: 0,
        minigameCount: 0,
        typerCount: 0,
        memoryCount: 0,
        mathCount: 0,
        perfectQuiz: false,
      },
    }
    localStorage.setItem('devopsquest_game', JSON.stringify(storedGame))

    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('XP Hunter')).toBeInTheDocument()
  })

  it('displays level achievement when level is 5+', () => {
    // Pre-set game with level 5+
    const storedGame = {
      character: {
        name: 'Hero',
        class: 'Cloud Knight',
        avatar: '🧙',
        title: 'Novice',
        level: 5,
        xp: 450,
        xpToNextLevel: 100,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        gold: 0,
        streakDays: 0,
        lastActive: new Date().toISOString().split('T')[0],
        joinedAt: new Date().toISOString(),
        skillPoints: 0,
        skillAllocations: {},
      },
      completedQuests: [],
      currentQuestId: null,
      achievements: [],
      showVictory: false,
      lastVictory: null,
      sideQuests: [],
      badges: [],
      milestones: [],
      collectibles: [],
      dailyRewardsClaimed: [],
      lastDailyReset: new Date().toISOString().split('T')[0],
      completedRealms: [],
      showRealmCompletion: null,
      lastRealmCompletion: null,
      stats: {
        quizCount: 0,
        quizPerfectCount: 0,
        quizStreak: 0,
        minigameCount: 0,
        typerCount: 0,
        memoryCount: 0,
        mathCount: 0,
        perfectQuiz: false,
      },
    }
    localStorage.setItem('devopsquest_game', JSON.stringify(storedGame))

    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Rising Star')).toBeInTheDocument()
  })

  it('displays streak achievement when streak is 7+', () => {
    // Pre-set game with 7+ day streak
    const storedGame = {
      character: {
        name: 'Hero',
        class: 'Cloud Knight',
        avatar: '🧙',
        title: 'Novice',
        level: 2,
        xp: 100,
        xpToNextLevel: 100,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        gold: 0,
        streakDays: 7,
        lastActive: new Date().toISOString().split('T')[0],
        joinedAt: new Date().toISOString(),
        skillPoints: 0,
        skillAllocations: {},
      },
      completedQuests: [],
      currentQuestId: null,
      achievements: [],
      showVictory: false,
      lastVictory: null,
      sideQuests: [],
      badges: [],
      milestones: [],
      collectibles: [],
      dailyRewardsClaimed: [],
      lastDailyReset: new Date().toISOString().split('T')[0],
      completedRealms: [],
      showRealmCompletion: null,
      lastRealmCompletion: null,
      stats: {
        quizCount: 0,
        quizPerfectCount: 0,
        quizStreak: 0,
        minigameCount: 0,
        typerCount: 0,
        memoryCount: 0,
        mathCount: 0,
        perfectQuiz: false,
      },
    }
    localStorage.setItem('devopsquest_game', JSON.stringify(storedGame))

    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Dedicated Learner')).toBeInTheDocument()
  })

  it('displays topics achievement when 10+ topics completed', () => {
    // Pre-set game with completed quests
    const storedGame = {
      character: {
        name: 'Hero',
        class: 'Cloud Knight',
        avatar: '🧙',
        title: 'Novice',
        level: 3,
        xp: 250,
        xpToNextLevel: 100,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        gold: 0,
        streakDays: 0,
        lastActive: new Date().toISOString().split('T')[0],
        joinedAt: new Date().toISOString(),
        skillPoints: 0,
        skillAllocations: {},
      },
      completedQuests: Array(10).fill(null).map((_, i) => ({
        id: `topic-${i}`,
        title: `Topic ${i}`,
        xpRewarded: 25,
        completedAt: new Date().toISOString(),
      })),
      currentQuestId: null,
      achievements: [],
      showVictory: false,
      lastVictory: null,
      sideQuests: [],
      badges: [],
      milestones: [],
      collectibles: [],
      dailyRewardsClaimed: [],
      lastDailyReset: new Date().toISOString().split('T')[0],
      completedRealms: [],
      showRealmCompletion: null,
      lastRealmCompletion: null,
      stats: {
        quizCount: 0,
        quizPerfectCount: 0,
        quizStreak: 0,
        minigameCount: 0,
        typerCount: 0,
        memoryCount: 0,
        mathCount: 0,
        perfectQuiz: false,
      },
    }
    localStorage.setItem('devopsquest_game', JSON.stringify(storedGame))

    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Knowledge Seeker')).toBeInTheDocument()
  })

  it('displays progress bar at 0% when no topics completed', () => {
    const storedGame = {
      character: {
        name: 'Hero',
        class: 'Cloud Knight',
        avatar: '🧙',
        title: 'Novice',
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        gold: 0,
        streakDays: 0,
        lastActive: new Date().toISOString().split('T')[0],
        joinedAt: new Date().toISOString(),
        skillPoints: 0,
        skillAllocations: {},
      },
      completedQuests: [],
      currentQuestId: null,
      achievements: [],
      showVictory: false,
      lastVictory: null,
      sideQuests: [],
      badges: [],
      milestones: [],
      collectibles: [],
      dailyRewardsClaimed: [],
      lastDailyReset: new Date().toISOString().split('T')[0],
      completedRealms: [],
      showRealmCompletion: null,
      lastRealmCompletion: null,
      stats: {
        quizCount: 0,
        quizPerfectCount: 0,
        quizStreak: 0,
        minigameCount: 0,
        typerCount: 0,
        memoryCount: 0,
        mathCount: 0,
        perfectQuiz: false,
      },
    }
    localStorage.setItem('devopsquest_game', JSON.stringify(storedGame))

    renderWithRouter(<DashboardPage />)
    // XP progress text format is "{xpProgress}/{100} XP to next level"
    expect(screen.getByText('0/100 XP to next level')).toBeInTheDocument()
  })

  it('displays multiple achievements when conditions are met', () => {
    // Set up state that triggers multiple achievements
    const storedGame = {
      character: {
        name: 'Hero',
        class: 'Cloud Knight',
        avatar: '🧙',
        title: 'Novice',
        level: 16,
        xp: 1500,
        xpToNextLevel: 100,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        gold: 0,
        streakDays: 10,
        lastActive: new Date().toISOString().split('T')[0],
        joinedAt: new Date().toISOString(),
        skillPoints: 0,
        skillAllocations: {},
      },
      completedQuests: Array(15).fill(null).map((_, i) => ({
        id: `topic-${i}`,
        title: `Topic ${i}`,
        xpRewarded: 25,
        completedAt: new Date().toISOString(),
      })),
      currentQuestId: null,
      achievements: [],
      showVictory: false,
      lastVictory: null,
      sideQuests: [],
      badges: [],
      milestones: [],
      collectibles: [],
      dailyRewardsClaimed: [],
      lastDailyReset: new Date().toISOString().split('T')[0],
      completedRealms: [],
      showRealmCompletion: null,
      lastRealmCompletion: null,
      stats: {
        quizCount: 0,
        quizPerfectCount: 0,
        quizStreak: 0,
        minigameCount: 0,
        typerCount: 0,
        memoryCount: 0,
        mathCount: 0,
        perfectQuiz: false,
      },
    }
    localStorage.setItem('devopsquest_game', JSON.stringify(storedGame))

    renderWithRouter(<DashboardPage />)
    // Should show XP Hunter (1000+ XP), Rising Star (level 5+), Dedicated Learner (7+ streak), Knowledge Seeker (10+ topics)
    expect(screen.getByText('XP Hunter')).toBeInTheDocument()
    expect(screen.getByText('Rising Star')).toBeInTheDocument()
    expect(screen.getByText('Dedicated Learner')).toBeInTheDocument()
    expect(screen.getByText('Knowledge Seeker')).toBeInTheDocument()
  })

  it('displays XP Hunter and XP Master achievements', () => {
    const storedGame = {
      character: {
        name: 'Hero',
        class: 'Cloud Knight',
        avatar: '🧙',
        title: 'Novice',
        level: 56,
        xp: 5500,
        xpToNextLevel: 100,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        gold: 0,
        streakDays: 0,
        lastActive: new Date().toISOString().split('T')[0],
        joinedAt: new Date().toISOString(),
        skillPoints: 0,
        skillAllocations: {},
      },
      completedQuests: [],
      currentQuestId: null,
      achievements: [],
      showVictory: false,
      lastVictory: null,
      sideQuests: [],
      badges: [],
      milestones: [],
      collectibles: [],
      dailyRewardsClaimed: [],
      lastDailyReset: new Date().toISOString().split('T')[0],
      completedRealms: [],
      showRealmCompletion: null,
      lastRealmCompletion: null,
      stats: {
        quizCount: 0,
        quizPerfectCount: 0,
        quizStreak: 0,
        minigameCount: 0,
        typerCount: 0,
        memoryCount: 0,
        mathCount: 0,
        perfectQuiz: false,
      },
    }
    localStorage.setItem('devopsquest_game', JSON.stringify(storedGame))

    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('XP Hunter')).toBeInTheDocument()
    expect(screen.getByText('XP Master')).toBeInTheDocument()
  })

  it('displays percentage when topics are completed', () => {
    const storedGame = {
      character: {
        name: 'Hero',
        class: 'Cloud Knight',
        avatar: '🧙',
        title: 'Novice',
        level: 2,
        xp: 100,
        xpToNextLevel: 100,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        gold: 0,
        streakDays: 0,
        lastActive: new Date().toISOString().split('T')[0],
        joinedAt: new Date().toISOString(),
        skillPoints: 0,
        skillAllocations: {},
      },
      completedQuests: Array(5).fill(null).map((_, i) => ({
        id: `topic-${i}`,
        title: `Topic ${i}`,
        xpRewarded: 25,
        completedAt: new Date().toISOString(),
      })),
      currentQuestId: null,
      achievements: [],
      showVictory: false,
      lastVictory: null,
      sideQuests: [],
      badges: [],
      milestones: [],
      collectibles: [],
      dailyRewardsClaimed: [],
      lastDailyReset: new Date().toISOString().split('T')[0],
      completedRealms: [],
      showRealmCompletion: null,
      lastRealmCompletion: null,
      stats: {
        quizCount: 0,
        quizPerfectCount: 0,
        quizStreak: 0,
        minigameCount: 0,
        typerCount: 0,
        memoryCount: 0,
        mathCount: 0,
        perfectQuiz: false,
      },
    }
    localStorage.setItem('devopsquest_game', JSON.stringify(storedGame))
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('1% complete')).toBeInTheDocument()
  })
})
