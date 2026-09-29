import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom'
import StorylinesPage from './StorylinesPage'
import { STORY_ARCS } from '@/data/storylines'
import { GameProvider } from '@/contexts/GameContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import {
  closestContainer,
  expectedAppliedXp,
  renderPage,
  renderSeededPage,
  seedDefaultGame,
} from './test-utils'
import { STORAGE_KEYS } from '@/utils/gameUtils'

/** Stand-in for the quest page: renders the param it was mounted with. */
function QuestProbe() {
  const { questId } = useParams()
  return <div>quest:{questId}</div>
}

/** Re-seeds the default save with `questIds` recorded as completed quests. */
function seedCompletedQuests(questIds: string[]): void {
  const base = seedDefaultGame()
  localStorage.setItem(
    STORAGE_KEYS.GAME,
    JSON.stringify({
      ...base,
      completedQuests: questIds.map((questId, index) => ({
        topicId: `topic-${index}`,
        technologyId: 'html',
        questId,
        completed: true,
        xpEarned: 10,
        completedAt: new Date().toISOString(),
      })),
    }),
  )
}

describe('StorylinesPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the story quests header and intro', () => {
    renderSeededPage(<StorylinesPage />)
    expect(screen.getByRole('heading', { level: 1, name: /Story Quests/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '🎭 Learning Storylines' })).toBeInTheDocument()
  })

  it('shows the player level and completed quest count from game state', () => {
    const { character, completedQuests } = seedDefaultGame()
    renderSeededPage(<StorylinesPage />)

    expect(screen.getByText(`✨ Level ${character.level} Quest Seeker`)).toBeInTheDocument()
    expect(screen.getByText(`🏆 ${completedQuests.length} Quests Completed`)).toBeInTheDocument()
  })

  it('renders every story arc with its chapter count', () => {
    renderSeededPage(<StorylinesPage />)
    for (const arc of STORY_ARCS) {
      expect(screen.getByText(arc.title)).toBeInTheDocument()
      expect(screen.getByText(arc.subtitle)).toBeInTheDocument()
    }
    // Several arcs share a chapter count, so compare against the full set
    const chapterCounts = STORY_ARCS.map((arc) => `${arc.episodes.length} Chapters`)
    for (const count of chapterCounts) {
      expect(screen.getAllByText(count).length).toBeGreaterThan(0)
    }
  })

  it('keeps chapter lists collapsed until an arc is opened', () => {
    renderSeededPage(<StorylinesPage />)
    expect(screen.queryByText('📜 Chapters')).not.toBeInTheDocument()
    expect(screen.queryByText('Chapter 1: The Inheritance')).not.toBeInTheDocument()
  })

  it('expands the chapters of an arc on click and collapses it again', async () => {
    const user = userEvent.setup()
    renderSeededPage(<StorylinesPage />)

    const [firstArc] = STORY_ARCS
    await user.click(screen.getByText(firstArc.title))

    expect(screen.getByText('📜 Chapters')).toBeInTheDocument()
    for (const episode of firstArc.episodes) {
      expect(screen.getByText(episode.title)).toBeInTheDocument()
    }

    await user.click(screen.getByText(firstArc.title))
    expect(screen.queryByText('📜 Chapters')).not.toBeInTheDocument()
  })

  it('ticks off finished chapters and unlocks the next one', () => {
    const arc = STORY_ARCS[0]
    const [firstEpisode] = arc.episodes
    seedCompletedQuests(firstEpisode.questIds)
    renderPage(<StorylinesPage />)

    // The intro counter mirrors the seeded quest log
    expect(
      screen.getByText(`🏆 ${firstEpisode.questIds.length} Quests Completed`),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByText(arc.title))

    // One of the five chapters is done
    expect(screen.getByText('1/5')).toBeInTheDocument()

    const finished = closestContainer(screen.getByText(firstEpisode.title), 'div.rounded-lg')
    expect(within(finished).getByText('✓')).toBeInTheDocument()
    expect(within(finished).queryByText('Continue Story →')).not.toBeInTheDocument()

    // The chapter right after the last finished one is flagged as next
    const upcoming = closestContainer(screen.getByText(arc.episodes[1].title), 'div.rounded-lg')
    expect(within(upcoming).getByText('▶ Next Up')).toBeInTheDocument()
    expect(within(upcoming).getByText('Continue Story →')).toBeInTheDocument()
    expect(
      within(upcoming).getByText(`${arc.episodes[1].questIds.length} quests`),
    ).toBeInTheDocument()

    // Chapters still behind unfinished ones stay locked
    const locked = closestContainer(screen.getByText(arc.episodes[4].title), 'div.rounded-lg')
    expect(within(locked).queryByText('Continue Story →')).not.toBeInTheDocument()
    expect(within(locked).queryByText(/quest/)).not.toBeInTheDocument()
    expect(locked.className).toContain('grayscale')
  })

  it('marks an arc complete once every chapter is finished', () => {
    const arc = STORY_ARCS[2]
    seedCompletedQuests(arc.episodes.flatMap((episode) => episode.questIds))
    renderPage(<StorylinesPage />)

    // The arc header gains the complete badge and a full progress bar
    expect(screen.getByText('✓ Complete')).toBeInTheDocument()
    expect(screen.getByText(`${arc.episodes.length}/${arc.episodes.length}`)).toBeInTheDocument()

    fireEvent.click(screen.getByText(arc.title))

    // Nothing is flagged as next and no chapter offers to continue
    expect(screen.queryByText('▶ Next Up')).not.toBeInTheDocument()
    expect(screen.queryByText('Continue Story →')).not.toBeInTheDocument()
    expect(screen.getAllByText('✓')).toHaveLength(arc.episodes.length)

    // The arc reward summary is rendered for the finished arc
    const rewards = closestContainer(screen.getByText('Complete Arc Rewards'), 'div.rounded-lg')
    expect(within(rewards).getAllByText(`+${arc.rewards.xpBonus} XP`).length).toBeGreaterThan(0)
    expect(within(rewards).getByText(`+${arc.rewards.goldBonus} Gold`)).toBeInTheDocument()
    expect(within(rewards).getByText('🏅 Special Badge')).toBeInTheDocument()
    expect(screen.getByText(`⏱️ ${arc.estimatedTime}`)).toBeInTheDocument()
  })

  it('pays a finished arc exactly once and dismisses the receipt', () => {
    const arc = STORY_ARCS[2]
    const base = seedDefaultGame()
    seedCompletedQuests(arc.episodes.flatMap((episode) => episode.questIds))
    renderPage(<StorylinesPage />)

    fireEvent.click(screen.getByText(arc.title))
    fireEvent.click(screen.getByRole('button', { name: /🎁 Claim Rewards/ }))

    // The receipt names the advertised bonus (XP through the class bonus
    // engine) and the badge the arc ships
    expect(screen.getByRole('status')).toHaveTextContent(
      `${arc.title}: +${expectedAppliedXp(arc.rewards.xpBonus, base.character)}` +
        ` XP, +${arc.rewards.goldBonus} gold, badge unlocked!`,
    )
    expect(screen.getByText('✓ Rewards Claimed')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /🎁 Claim Rewards/ })).not.toBeInTheDocument()

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME) ?? '{}') as {
      claimedStoryArcs?: string[]
      character: { xp: number; gold: number }
    }
    expect(stored.claimedStoryArcs).toEqual([arc.id])
    expect(stored.character.xp).toBe(
      base.character.xp + expectedAppliedXp(arc.rewards.xpBonus, base.character),
    )
    expect(stored.character.gold).toBe(base.character.gold + arc.rewards.goldBonus)

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('sends Continue Story to the first unfinished quest of the episode', () => {
    const arc = STORY_ARCS[0]
    const [firstEpisode] = arc.episodes
    seedCompletedQuests(firstEpisode.questIds)

    // Render with the quest route the page navigates to, so the jump is real
    render(
      <ThemeProvider>
        <GameProvider>
          <MemoryRouter initialEntries={['/storylines']}>
            <Routes>
              <Route path="/storylines" element={<StorylinesPage />} />
              <Route path="/quest/:questId" element={<QuestProbe />} />
            </Routes>
          </MemoryRouter>
        </GameProvider>
      </ThemeProvider>,
    )

    fireEvent.click(screen.getByText(arc.title))
    fireEvent.click(screen.getByRole('button', { name: 'Continue Story →' }))

    const nextQuestId = arc.episodes[1].questIds.find(
      (questId) => !firstEpisode.questIds.includes(questId),
    )
    if (!nextQuestId) throw new Error('Expected an unfinished quest in episode 2')
    expect(screen.getByText(`quest:${nextQuestId}`)).toBeInTheDocument()
  })
})
