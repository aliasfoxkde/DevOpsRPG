import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import BattleArenaPage from './BattleArenaPage'
import { w3schoolsContent } from '@/data/w3schools-content'
import { allQuests } from '@/data/quests'
import { technologies } from '@/data/technologies'
import { getQuizForTopic, type QuizQuestion } from '@/data/quizzes'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { GameProvider, type GameState } from '@/contexts/GameContext'
import { renderPage, seedDefaultGame } from './test-utils'
import { STORAGE_KEYS, GOLD_XP_RATIO } from '@/utils/gameUtils'

function renderQuest(questId: string) {
  return renderPage(<BattleArenaPage />, {
    route: '/quest/:questId',
    url: `/quest/${questId}`,
  })
}

/**
 * Same providers as `renderPage`, plus a journal route so navigation away from
 * the arena (the "all quests done" case) can be observed.
 */
function renderQuestWithJournal(questId: string) {
  return render(
    <ThemeProvider>
      <GameProvider>
        <MemoryRouter initialEntries={[`/quest/${questId}`]}>
          <Routes>
            <Route path="/quest/:questId" element={<BattleArenaPage />} />
            <Route path="/quests" element={<div>Quest Journal</div>} />
          </Routes>
        </MemoryRouter>
      </GameProvider>
    </ThemeProvider>,
  )
}

/** The mode toggle and the "Take Quiz" CTA both match /Quiz/, so pick the toggle. */
function quizToggle(): HTMLElement {
  const toggle = screen
    .getAllByRole('button', { name: /Quiz/ })
    .find((button) => button.textContent === '📝 Quiz')
  if (!toggle) throw new Error('Quiz mode toggle not found')
  return toggle
}

/** The save as currently persisted. */
function storedGame(): GameState {
  const raw = localStorage.getItem(STORAGE_KEYS.GAME)
  if (!raw) throw new Error('No game state persisted to localStorage')
  return JSON.parse(raw) as GameState
}

function questById(questId: string) {
  const quest = allQuests.find((entry) => entry.id === questId)
  if (!quest) throw new Error(`Unknown quest id: ${questId}`)
  return quest
}

/** A completed-quest record shaped the way GameContext persists them. */
function completedEntry(questId: string) {
  const quest = questById(questId)
  return {
    topicId: quest.topicId,
    technologyId: quest.technologyId,
    questId: quest.id,
    completed: true,
    xpEarned: quest.xpReward,
    completedAt: new Date().toISOString(),
  }
}

/** The answer buttons of the question currently on screen. */
function quizOptions(): HTMLElement[] {
  const group = screen.getByRole('radiogroup', { name: 'Answer options' })
  const options = within(group).getAllByRole('radio')
  if (options.length === 0) throw new Error('No quiz options rendered')
  return options
}

/** Quiz data marks the right answer; a question without one cannot be passed. */
function correctIndexOf(question: QuizQuestion): number {
  if (question.correctIndex === undefined) {
    throw new Error(`Question "${question.question}" has no correctIndex`)
  }
  return question.correctIndex
}

/** "Next Question (N)" between questions, "See Results (N)" on the last one. */
function advanceButton(): HTMLElement {
  const button = screen
    .getAllByRole('button')
    .find((entry) => /^(Next Question|See Results)/.test(entry.textContent))
  if (!button) throw new Error('Quiz advance button not found')
  return button
}

describe('BattleArenaPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders the quest briefing for a real quest id', () => {
    seedDefaultGame()
    renderQuest('quest_html_intro')

    expect(screen.getByRole('heading', { level: 1, name: 'HTML Introduction' })).toBeInTheDocument()
    expect(screen.getByText('📋 Intel Briefing')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'What is HTML?' })).toBeInTheDocument()
    expect(screen.getByText('Quest Details')).toBeInTheDocument()
    expect(screen.getByText('HTML')).toBeInTheDocument()
  })

  it('shows study mode with the scraped code examples', () => {
    renderQuest('quest_html_intro')

    const topic = w3schoolsContent.technologies.html.topics[0]
    expect(topic.codeExamples.length).toBeGreaterThan(0)
    expect(screen.getByText('💻 Code Examples')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Take Quiz to Complete/ })).toBeInTheDocument()
  })

  it('reports an in-progress status and difficulty for a fresh account', () => {
    renderQuest('quest_html_intro')

    expect(screen.getByText('Status:')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Est. Time:')).toBeInTheDocument()
    expect(screen.getByText('Difficulty:')).toBeInTheDocument()
  })

  it('switches to the quiz when the quiz toggle is clicked', async () => {
    const user = userEvent.setup()
    renderQuest('quest_html_intro')

    await user.click(quizToggle())

    expect(screen.getByText('What does HTML stand for?')).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Answer options' })).toBeInTheDocument()
    expect(screen.queryByText('📋 Intel Briefing')).not.toBeInTheDocument()
  })

  it('returns to study mode from the quiz', async () => {
    const user = userEvent.setup()
    renderQuest('quest_html_intro')

    await user.click(quizToggle())

    await user.click(screen.getByRole('button', { name: /Study/ }))

    expect(screen.queryByText('What does HTML stand for?')).not.toBeInTheDocument()
    expect(screen.getByText('📋 Intel Briefing')).toBeInTheDocument()
  })

  it('renders a not-found state for an unknown quest id', () => {
    renderQuest('quest_does_not_exist')

    expect(screen.getByRole('heading', { level: 1, name: 'Quest Not Found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Return to Quest Journal/ })).toHaveAttribute(
      'href',
      '/quests',
    )
  })

  it('marks an already completed quest as completed', () => {
    const game = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...game,
        completedQuests: [
          {
            questId: 'quest_html_intro',
            topicId: 'html_intro',
            title: 'HTML Introduction',
            xpRewarded: 75,
            completedAt: new Date().toISOString(),
          },
        ],
      }),
    )
    renderQuest('quest_html_intro')

    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.queryByText('In Progress')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Take Quiz to Complete/ })).not.toBeInTheDocument()
    expect(screen.getByText('Quest Completed!')).toBeInTheDocument()
  })

  it('offers an external study link when the topic was not scraped', () => {
    // quest_html_editors has a real technologies entry but no scraped sections
    const quest = questById('quest_html_editors')
    const topicUrl = technologies.html.topics.find((topic) => topic.id === quest.topicId)?.url
    expect(topicUrl).toBeDefined()
    expect(w3schoolsContent.technologies.html.topics.some((t) => t.id === quest.topicId)).toBe(
      false,
    )

    renderQuest('quest_html_editors')

    expect(screen.getByRole('heading', { level: 1, name: 'HTML Editors' })).toBeInTheDocument()
    expect(screen.getByText('📚 Study Material')).toBeInTheDocument()
    expect(screen.getByText('Learn from external resources:')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /Open Learning Resource/ })
    expect(link).toHaveAttribute('href', topicUrl)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByText('Complete the quiz below to earn XP!')).toBeInTheDocument()
  })

  it('falls back to the unavailable state when the technology has no content', () => {
    renderQuest('quest_kafka_intro')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Quest Content Unavailable' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('The requested learning content could not be found.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Quest Details')).not.toBeInTheDocument()
    expect(screen.queryByText('📋 Intel Briefing')).not.toBeInTheDocument()
  })

  it('awards the quest XP and moves on to the next quest', () => {
    // 0.99 is above every bonus roll (mini-game 25%, chest 30%, encounter 20%),
    // so the only rewards are the quest's own
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    vi.useFakeTimers()
    const game = seedDefaultGame()
    const quest = questById('quest_html_intro')
    renderQuest('quest_html_intro')

    fireEvent.click(quizToggle())

    // Answer every question of the real html_intro quiz correctly
    for (const question of getQuizForTopic('html_intro')) {
      fireEvent.click(quizOptions()[correctIndexOf(question)])
      expect(screen.getByText('✓ Correct!')).toBeInTheDocument()
      fireEvent.click(advanceButton())
    }

    expect(screen.getByText('Quest Passed!')).toBeInTheDocument()
    expect(screen.getByText('You got 2 out of 2 questions correct (100%)')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Complete Quest' }))

    const stored = storedGame()
    expect(stored.completedQuests.map((entry) => entry.questId)).toEqual(['quest_html_intro'])
    expect(stored.character.xp).toBe(game.character.xp + quest.xpReward)
    expect(stored.character.gold).toBe(
      game.character.gold + Math.floor(quest.xpReward * GOLD_XP_RATIO),
    )
    expect(stored.stats.quizCount).toBe(game.stats.quizCount + 1)
    expect(screen.getByText('Completed')).toBeInTheDocument()

    // The arena advances to the next quest on its own
    act(() => {
      vi.advanceTimersByTime(2500)
    })
    expect(screen.getByRole('heading', { level: 1, name: 'HTML Editors' })).toBeInTheDocument()
  })

  it('keeps the quest open and pays nothing when the quiz is failed', () => {
    const game = seedDefaultGame()
    const quiz = getQuizForTopic('html_intro')
    renderQuest('quest_html_intro')

    fireEvent.click(quizToggle())

    for (const question of quiz) {
      const options = question.options
      if (!options) throw new Error(`Question "${question.question}" has no options`)
      const wrongIndex = (correctIndexOf(question) + 1) % options.length
      fireEvent.click(quizOptions()[wrongIndex])
      expect(screen.getByText('✗ Incorrect')).toBeInTheDocument()
      fireEvent.click(advanceButton())
    }

    expect(screen.getByText('Keep Learning!')).toBeInTheDocument()
    expect(
      screen.getByText(
        `Review the material and try again. You need ${Math.ceil(quiz.length * 0.6)} correct to pass.`,
      ),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Practice More' }))

    // onSkip drops the hero back into study mode with nothing banked
    expect(screen.getByText('📋 Intel Briefing')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    const stored = storedGame()
    expect(stored.completedQuests).toEqual([])
    expect(stored.character.xp).toBe(game.character.xp)
    expect(stored.character.gold).toBe(game.character.gold)
  })

  it('continues from a completed quest to the next one', () => {
    const game = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({ ...game, completedQuests: [completedEntry('quest_html_intro')] }),
    )
    renderQuest('quest_html_intro')

    fireEvent.click(screen.getByRole('button', { name: /Next: HTML Editors/ }))

    expect(screen.getByRole('heading', { level: 1, name: 'HTML Editors' })).toBeInTheDocument()
  })

  it('returns to the quest journal when there is no next quest', () => {
    const game = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...game,
        completedQuests: allQuests.map((quest) => completedEntry(quest.id)),
      }),
    )
    renderQuestWithJournal('quest_html_intro')

    fireEvent.click(screen.getByRole('button', { name: /View All Quests/ }))

    expect(screen.getByText('Quest Journal')).toBeInTheDocument()
    expect(screen.queryByText('Quest Completed!')).not.toBeInTheDocument()
  })
})
