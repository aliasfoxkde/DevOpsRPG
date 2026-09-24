import { describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StorylinesPage from './StorylinesPage'
import { STORY_ARCS } from '@/data/storylines'
import { closestContainer, renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import { STORAGE_KEYS } from '@/utils/gameUtils'

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
    expect(locked.className).toContain('opacity-50')
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
})
