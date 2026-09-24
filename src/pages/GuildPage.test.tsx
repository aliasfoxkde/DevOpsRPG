import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GuildPage from './GuildPage'
import {
  MOCK_GUILD,
  MOCK_GUILD_MEMBERS,
  MOCK_GUILD_CHALLENGES,
  FEATURED_GUILDS,
} from '@/data/guilds'
import { renderSeededPage, seedDefaultGame } from './test-utils'

describe('GuildPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the guild hall header, tabs and current guild banner', () => {
    const { character } = seedDefaultGame()
    renderSeededPage(<GuildPage />, { route: '/guild', url: '/guild' })

    expect(screen.getByRole('heading', { level: 1, name: /Guild Hall/ })).toBeInTheDocument()
    for (const label of [
      '📊 Overview',
      '👥 Members',
      '⚔️ Challenges',
      '🌐 Community',
      '🔍 Discover',
    ]) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
    // The demo guild is joined by default
    expect(screen.getByText(MOCK_GUILD.name)).toBeInTheDocument()
    expect(
      screen.getByText(`${MOCK_GUILD.memberCount}/${MOCK_GUILD.maxMembers} members`),
    ).toBeInTheDocument()
    expect(screen.getByText(`${MOCK_GUILD.xp} / ${MOCK_GUILD.xpToNextLevel}`)).toBeInTheDocument()
    // A level 1 player is a plain member
    expect(screen.getByText('Your Role')).toBeInTheDocument()
    expect(character.level).toBe(1)
  })

  it('summarises the player contribution and guild statistics', () => {
    const { character } = seedDefaultGame()
    renderSeededPage(<GuildPage />, { route: '/guild', url: '/guild' })

    expect(screen.getByText('🧙 Your Guild Contribution')).toBeInTheDocument()
    expect(screen.getByText('Guild XP Contributed')).toBeInTheDocument()
    expect(screen.getByText('📊 Guild Statistics')).toBeInTheDocument()
    expect(screen.getByText(MOCK_GUILD.totalQuests.toLocaleString())).toBeInTheDocument()
    expect(screen.getByText('🏆 Guild Achievements')).toBeInTheDocument()
    expect(screen.getByText('🏅 Guild Founded')).toBeInTheDocument()
    // The contribution tile mirrors the character level from the save
    expect(screen.getByText('Your Level').previousElementSibling).toHaveTextContent(
      String(character.level),
    )
  })

  it('lists the roster with the player mixed in on the members tab', async () => {
    const user = userEvent.setup()
    const { character } = seedDefaultGame()
    renderSeededPage(<GuildPage />, { route: '/guild', url: '/guild' })

    await user.click(screen.getByRole('button', { name: '👥 Members' }))

    expect(screen.getByText('Weekly XP')).toBeInTheDocument()
    // Every mock member is listed next to the player's own entry
    for (const member of MOCK_GUILD_MEMBERS) {
      expect(screen.getByText(member.name)).toBeInTheDocument()
    }
    expect(screen.getByText(character.name)).toBeInTheDocument()
    // Roster = mock members + the player
    expect(screen.getAllByText(/Lv\.\d+/)).toHaveLength(MOCK_GUILD_MEMBERS.length + 1)
  })

  it('shows the active guild challenges and their progress', async () => {
    const user = userEvent.setup()
    renderSeededPage(<GuildPage />, { route: '/guild', url: '/guild' })

    await user.click(screen.getByRole('button', { name: '⚔️ Challenges' }))

    expect(screen.getByText('⚔️ Active Challenges')).toBeInTheDocument()
    for (const challenge of MOCK_GUILD_CHALLENGES) {
      expect(screen.getByText(challenge.title)).toBeInTheDocument()
      // Player has finished no quests, so only the base progress shows
      expect(screen.getByText(`${challenge.progress}/${challenge.target}`)).toBeInTheDocument()
    }
  })

  it('offers featured guilds but blocks joining while already in one', async () => {
    const user = userEvent.setup()
    renderSeededPage(<GuildPage />, { route: '/guild', url: '/guild' })

    await user.click(screen.getByRole('button', { name: '🔍 Discover' }))

    expect(screen.getByText('🔍 Featured Guilds')).toBeInTheDocument()
    for (const guild of FEATURED_GUILDS) {
      expect(screen.getByText(guild.name)).toBeInTheDocument()
    }
    const joinButtons = screen.getAllByRole('button', { name: 'Already in Guild' })
    expect(joinButtons).toHaveLength(FEATURED_GUILDS.length)
    for (const button of joinButtons) {
      expect(button).toBeDisabled()
    }
  })
})
