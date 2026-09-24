import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StorylinesPage from './StorylinesPage'
import { STORY_ARCS } from '@/data/storylines'
import { renderSeededPage, seedDefaultGame } from './test-utils'

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
})
