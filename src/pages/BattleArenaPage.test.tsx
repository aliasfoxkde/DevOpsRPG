import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import BattleArenaPage from './BattleArenaPage'
import { w3schoolsContent } from '@/data/w3schools-content'
import { allQuests, realms } from '@/data/quests'
import { technologies } from '@/data/technologies'
import { getQuizForTopic, type QuizQuestion } from '@/data/quizzes'
import { MILESTONES } from '@/data/milestones'
import { BADGES } from '@/data/badges'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { GameProvider, useGame, type GameState } from '@/contexts/GameContext'
import { closestContainer, renderPage, seedDefaultGame } from './test-utils'
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

const INTRO_QUIZ = getQuizForTopic('html_intro')

/** Drives the real html_intro quiz to a perfect pass. */
function passQuiz() {
  for (const question of INTRO_QUIZ) {
    fireEvent.click(quizOptions()[correctIndexOf(question)])
    fireEvent.click(advanceButton())
  }
}

/**
 * Completes a quest straight through the provider, the way another surface of
 * the app (the journal, a modal) would while the arena is open.
 */
function CompleteProbe({ questId }: { questId: string }) {
  const { completeQuest } = useGame()
  return (
    <button
      onClick={() => {
        completeQuest(questId)
      }}
    >
      force complete
    </button>
  )
}

/** Arena plus the probe, so a quest can be completed behind its back. */
function renderQuestWithProbe(questId: string) {
  return render(
    <ThemeProvider>
      <GameProvider>
        <MemoryRouter initialEntries={[`/quest/${questId}`]}>
          <Routes>
            <Route
              path="/quest/:questId"
              element={
                <>
                  <BattleArenaPage />
                  <CompleteProbe questId={questId} />
                </>
              }
            />
            <Route path="/quests" element={<div>Quest Journal</div>} />
          </Routes>
        </MemoryRouter>
      </GameProvider>
    </ThemeProvider>,
  )
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

  it('stacks the streak bonus, mini-game, treasure chest and random encounter', () => {
    // 0 wins every roll: mini-game 25%, chest 30%, encounter 20%, and it picks
    // the matching mini-game with the first loot table entry (+10 XP)
    vi.spyOn(Math, 'random').mockReturnValue(0)
    vi.useFakeTimers()
    const game = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({ ...game, character: { ...game.character, streakDays: 7 } }),
    )
    const quest = questById('quest_html_intro')
    const baseXp = game.character.xp
    const baseGold = game.character.gold
    const view = renderQuest('quest_html_intro')

    fireEvent.click(quizToggle())
    passQuiz()
    fireEvent.click(screen.getByRole('button', { name: 'Complete Quest' }))

    // Streak celebration (7 days is a multiple of 7) shows up first
    act(() => {
      vi.advanceTimersByTime(600)
    })
    expect(screen.getByText(/7 Day Streak!/)).toBeInTheDocument()
    expect(screen.getByText(/Bonus XP!/)).toBeInTheDocument()

    // ...then the bonus mini-game, auto-solved with its own hotkey
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(screen.getByText('🔗 Match the Terms!')).toBeInTheDocument()
    act(() => {
      fireEvent.keyDown(window, { key: 'n' })
    })
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(screen.queryByText('🔗 Match the Terms!')).not.toBeInTheDocument()
    // The bonus is only visible in the study panel, so assert on the balance
    expect(storedGame().character.xp).toBe(baseXp + quest.xpReward + 10)

    // Chest and random encounter pop up while the celebrations are still up
    act(() => {
      vi.advanceTimersByTime(300)
    })
    const chestOverlay = closestContainer(
      screen.getByRole('button', { name: 'Open treasure chest' }),
      '.fixed',
    )
    const encounterOverlay = closestContainer(screen.getByText('Random Event!'), '.fixed')
    expect(within(encounterOverlay).getByText('+20 XP')).toBeInTheDocument()
    expect(within(encounterOverlay).getByText('+10 Gold')).toBeInTheDocument()
    // Its only button claims the reward and closes the popup
    fireEvent.click(within(encounterOverlay).getByRole('button'))
    expect(screen.queryByText('Random Event!')).not.toBeInTheDocument()

    // Opening the chest plays a short animation before paying the loot
    fireEvent.click(screen.getByRole('button', { name: 'Open treasure chest' }))
    act(() => {
      vi.advanceTimersByTime(800)
    })
    expect(within(chestOverlay).getByText('+10 XP!')).toBeInTheDocument()
    expect(within(chestOverlay).getByText(/common loot acquired!/)).toBeInTheDocument()

    const bonusXp = 10 + 10 + 20
    expect(storedGame().character.xp).toBe(baseXp + quest.xpReward + bonusXp)
    expect(storedGame().character.gold).toBe(
      baseGold + Math.floor(quest.xpReward * GOLD_XP_RATIO) + 10,
    )

    // A badge may be celebrating at the same time, so stay inside the chest
    fireEvent.click(within(chestOverlay).getByRole('button', { name: 'Awesome!' }))
    expect(screen.queryByRole('button', { name: /Open treasure chest/ })).not.toBeInTheDocument()

    // Leaving with celebrations still pending must not throw
    expect(() => {
      view.unmount()
    }).not.toThrow()
  })

  it('pays nothing when the bonus mini-game is answered wrong', () => {
    // Randomness is faked per call site: only the mini-game roll wins, every
    // other roll (collectible drop, chest, encounter) loses, and 0.99 picks
    // the trivia variant of the mini-game.
    let miniGameRolls = 0
    vi.spyOn(Math, 'random').mockImplementation(() => {
      const callSite = new Error().stack ?? ''
      if (callSite.includes('rollChance')) {
        miniGameRolls += 1
        return miniGameRolls === 1 ? 0.1 : 0.99
      }
      return 0.99
    })
    vi.useFakeTimers()
    const game = seedDefaultGame()
    const quest = questById('quest_html_intro')
    renderQuest('quest_html_intro')

    fireEvent.click(quizToggle())
    passQuiz()
    fireEvent.click(screen.getByRole('button', { name: 'Complete Quest' }))

    act(() => {
      vi.advanceTimersByTime(900)
    })
    expect(screen.getByText('🎯 Quick Trivia!')).toBeInTheDocument()

    // Answer the trivia question wrong and bank the consolation tip only
    fireEvent.click(screen.getByRole('button', { name: 'Single large application' }))
    expect(screen.getByText('❌ Not quite!')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^Continue$/ }))

    expect(screen.queryByText('🎯 Quick Trivia!')).not.toBeInTheDocument()
    expect(storedGame().character.xp).toBe(game.character.xp + quest.xpReward)
    expect(storedGame().character.gold).toBe(
      game.character.gold + Math.floor(quest.xpReward * GOLD_XP_RATIO),
    )
  })

  it('celebrates the milestone and badge carried by the last victory', () => {
    vi.useFakeTimers()
    const milestone = MILESTONES[0]
    const badge = BADGES[1]
    const game = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...game,
        lastVictory: { xp: 53, levelUp: false, newLevel: 1, milestone, badge },
      }),
    )
    renderQuest('quest_html_intro')

    act(() => {
      vi.advanceTimersByTime(2100)
    })

    expect(screen.getByText('⭐ MILESTONE UNLOCKED!')).toBeInTheDocument()
    expect(screen.getByText(milestone.title)).toBeInTheDocument()
    expect(screen.getByText(milestone.message)).toBeInTheDocument()
    expect(screen.getByText(`+${milestone.xpBonus} XP BONUS!`)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(screen.getByText('🎖️ BADGE EARNED!')).toBeInTheDocument()
    expect(screen.getByText(badge.name)).toBeInTheDocument()
    expect(screen.getByText(badge.description)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Awesome!' }))
    expect(screen.queryByText('🎖️ BADGE EARNED!')).not.toBeInTheDocument()

    // The milestone closes itself 3.5s after it appeared, then hands back
    act(() => {
      vi.advanceTimersByTime(4500)
    })
    expect(screen.queryByText('⭐ MILESTONE UNLOCKED!')).not.toBeInTheDocument()
  })

  it('pays the treasure chest loot in gold when the roll lands there', () => {
    // Only the chest roll wins and the loot table lands on its gold entry
    let rewardRoll = 0
    let lootRoll = 0
    vi.spyOn(Math, 'random').mockImplementation(() => {
      const callSite = new Error().stack ?? ''
      if (callSite.includes('rollChance')) {
        rewardRoll += 1
        return rewardRoll === 2 ? 0.1 : 0.99
      }
      if (callSite.includes('getRandomLoot')) {
        lootRoll += 1
        return lootRoll === 1 ? 0.1 : 0.9
      }
      return 0.99
    })
    vi.useFakeTimers()
    const game = seedDefaultGame()
    const quest = questById('quest_html_intro')
    renderQuest('quest_html_intro')

    fireEvent.click(quizToggle())
    passQuiz()
    fireEvent.click(screen.getByRole('button', { name: 'Complete Quest' }))

    act(() => {
      vi.advanceTimersByTime(1300)
    })
    fireEvent.click(screen.getByRole('button', { name: 'Open treasure chest' }))
    act(() => {
      vi.advanceTimersByTime(800)
    })

    expect(screen.getByText('+10 Gold!')).toBeInTheDocument()
    expect(screen.getByText(/common loot acquired!/)).toBeInTheDocument()
    expect(storedGame().character.gold).toBe(
      game.character.gold + Math.floor(quest.xpReward * GOLD_XP_RATIO) + 10,
    )
    expect(storedGame().character.xp).toBe(game.character.xp + quest.xpReward)
    expect(storedGame().collectibles).toEqual([])
  })

  it('closes the bonus mini-game without a reward when it is skipped', () => {
    // Only the mini-game roll wins, so no chest and no encounter compete
    let miniGameRoll = 0
    vi.spyOn(Math, 'random').mockImplementation(() => {
      if ((new Error().stack ?? '').includes('rollChance')) {
        miniGameRoll += 1
        return miniGameRoll === 1 ? 0.1 : 0.99
      }
      return 0.99
    })
    vi.useFakeTimers()
    const game = seedDefaultGame()
    const quest = questById('quest_html_intro')
    renderQuest('quest_html_intro')

    fireEvent.click(quizToggle())
    passQuiz()
    fireEvent.click(screen.getByRole('button', { name: 'Complete Quest' }))

    act(() => {
      vi.advanceTimersByTime(900)
    })
    expect(screen.getByText('🎯 Quick Trivia!')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Skip for now' }))

    expect(screen.queryByText('🎯 Quick Trivia!')).not.toBeInTheDocument()
    expect(storedGame().character.xp).toBe(game.character.xp + quest.xpReward)
  })

  it('opens the quiz from the study call to action', () => {
    renderQuest('quest_html_intro')

    fireEvent.click(screen.getByRole('button', { name: /Take Quiz to Complete/ }))

    expect(screen.getByText('What does HTML stand for?')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Take Quiz to Complete/ })).not.toBeInTheDocument()
  })

  it('unlocks a finished realm and closes its modal', () => {
    vi.useFakeTimers()
    const game = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({ ...game, showRealmCompletion: 'foundations' }),
    )
    renderQuest('quest_html_intro')

    act(() => {
      vi.advanceTimersByTime(3100)
    })

    expect(screen.getByText('REALM COMPLETE!')).toBeInTheDocument()
    const modal = closestContainer(screen.getByText('REALM COMPLETE!'), '.fixed')
    expect(within(modal).getByText(realms.foundations.name)).toBeInTheDocument()
    expect(within(modal).getByText('Quests Conquered')).toBeInTheDocument()

    fireEvent.click(within(modal).getByRole('button', { name: /Continue to Next Realm/ }))

    expect(screen.queryByText('REALM COMPLETE!')).not.toBeInTheDocument()
  })

  it('awards a quest once even when Complete Quest is clicked twice', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    vi.useFakeTimers()
    const game = seedDefaultGame()
    const quest = questById('quest_html_intro')
    renderQuest('quest_html_intro')

    fireEvent.click(quizToggle())
    passQuiz()
    const complete = screen.getByRole('button', { name: 'Complete Quest' })
    act(() => {
      complete.click()
      complete.click()
    })

    // One click completed it, the second was swallowed by a guard
    expect(storedGame().completedQuests.map((entry) => entry.questId)).toEqual(['quest_html_intro'])
    expect(storedGame().character.xp).toBe(game.character.xp + quest.xpReward)
  })

  it('refuses to complete a quest that another surface already finished', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    vi.useFakeTimers()
    const quest = questById('quest_html_intro')
    renderQuestWithProbe('quest_html_intro')

    // The quiz is open when the quest is completed elsewhere
    fireEvent.click(quizToggle())
    fireEvent.click(screen.getByRole('button', { name: 'force complete' }))
    const afterProbe = storedGame()
    expect(afterProbe.character.xp).toBe(quest.xpReward)

    passQuiz()
    fireEvent.click(screen.getByRole('button', { name: 'Complete Quest' }))

    // The arena was told the quest was already done: no second award, no
    // confetti and no auto-navigation
    expect(storedGame().completedQuests).toHaveLength(1)
    expect(storedGame().character.xp).toBe(afterProbe.character.xp)
    expect(screen.queryByText('Excellent! Moving to next quest...')).not.toBeInTheDocument()
    expect(document.querySelector('.animate-fall')).toBeNull()

    // And because the arena never "completed" it, nothing auto-navigates
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.queryByText('Quest Journal')).not.toBeInTheDocument()
  })

  it('sends a hero back to the journal when the finished quest was the last', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    vi.useFakeTimers()
    const game = seedDefaultGame()
    const remaining = allQuests.filter((entry) => entry.id !== 'quest_html_intro')
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...game,
        completedQuests: remaining.map((entry) => completedEntry(entry.id)),
      }),
    )
    renderQuestWithJournal('quest_html_intro')

    fireEvent.click(quizToggle())
    passQuiz()
    fireEvent.click(screen.getByRole('button', { name: 'Complete Quest' }))

    act(() => {
      vi.advanceTimersByTime(2500)
    })

    expect(screen.getByText('Quest Journal')).toBeInTheDocument()
  })
})
