import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BattleArenaPage from './BattleArenaPage'
import { w3schoolsContent } from '@/data/w3schools-content'
import { renderPage, seedDefaultGame } from './test-utils'
import { STORAGE_KEYS } from '@/utils/gameUtils'

function renderQuest(questId: string) {
  return renderPage(<BattleArenaPage />, {
    route: '/quest/:questId',
    url: `/quest/${questId}`,
  })
}

/** The mode toggle and the "Take Quiz" CTA both match /Quiz/, so pick the toggle. */
function quizToggle(): HTMLElement {
  const toggle = screen
    .getAllByRole('button', { name: /Quiz/ })
    .find(button => button.textContent === '📝 Quiz')
  if (!toggle) throw new Error('Quiz mode toggle not found')
  return toggle
}

describe('BattleArenaPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the quest briefing for a real quest id', () => {
    seedDefaultGame()
    renderQuest('quest_html_intro')

    expect(
      screen.getByRole('heading', { level: 1, name: 'HTML Introduction' }),
    ).toBeInTheDocument()
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

    expect(
      screen.getByRole('heading', { level: 1, name: 'Quest Not Found' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Return to Quest Journal/ }),
    ).toHaveAttribute('href', '/quests')
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
    expect(
      screen.queryByRole('button', { name: /Take Quiz to Complete/ }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Quest Completed!')).toBeInTheDocument()
  })
})
