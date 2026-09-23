import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SocialPage from './SocialPage'
import { MOCK_FRIENDS, MOCK_LEADERBOARD, AVAILABLE_GIFTS } from '@/data/social'
import { renderSeededPage, seedDefaultGame } from './test-utils'

const onlineFriends = MOCK_FRIENDS.filter(friend => friend.isOnline)

// The counter value sits in the sibling div directly above its label
function statValue(label: string): string | null {
  return screen.getByText(label).previousElementSibling?.textContent ?? null
}

describe('SocialPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the social hub header and friend statistics', () => {
    renderSeededPage(<SocialPage />, { route: '/social', url: '/social' })

    expect(
      screen.getByRole('heading', { level: 1, name: /Social Hub/ }),
    ).toBeInTheDocument()
    expect(statValue('Friends Online')).toBe(String(onlineFriends.length))
    expect(statValue('Total Friends')).toBe(String(MOCK_FRIENDS.length))
    expect(statValue('Gifts Sent')).toBe('0')
  })

  it('lists every friend with their online status on the friends tab', () => {
    renderSeededPage(<SocialPage />, { route: '/social', url: '/social' })

    for (const friend of MOCK_FRIENDS) {
      expect(screen.getByText(friend.name)).toBeInTheDocument()
      expect(
        screen.getByText(`Level ${friend.level} • ${friend.title}`),
      ).toBeInTheDocument()
      expect(
        screen.getByText(`🔥 ${friend.streakDays} day streak`),
      ).toBeInTheDocument()
    }
    expect(screen.getAllByText('Online')).toHaveLength(onlineFriends.length)
    // Each friend row offers a gift shortcut (exact match so the "Send Gifts"
    // tab button is not counted as well)
    expect(
      screen.getAllByRole('button', { name: '🎁 Send Gift' }),
    ).toHaveLength(MOCK_FRIENDS.length)
  })

  it('sends a gift to a chosen friend and confirms it', async () => {
    const user = userEvent.setup()
    const [firstFriend] = MOCK_FRIENDS
    const [firstGift] = AVAILABLE_GIFTS
    renderSeededPage(<SocialPage />, { route: '/social', url: '/social' })

    await user.click(screen.getAllByRole('button', { name: '🎁 Send Gift' })[0])

    // The gift tab opens pre-selected on that friend
    expect(
      screen.getByText(`Select a Gift for ${firstFriend.avatar} ${firstFriend.name}`),
    ).toBeInTheDocument()
    for (const gift of AVAILABLE_GIFTS) {
      expect(screen.getByText(gift.name)).toBeInTheDocument()
    }

    await user.click(screen.getByRole('button', { name: new RegExp(firstGift.name) }))

    expect(
      screen.getByText(
        `You sent ${firstGift.icon} ${firstGift.name} to ${firstFriend.name}!`,
      ),
    ).toBeInTheDocument()
    // The gift is counted and the friend selection is reset
    expect(statValue('Gifts Sent')).toBe('1')
    expect(
      screen.getByText('Select a friend above to send them a gift!'),
    ).toBeInTheDocument()
  })

  it('requires picking a friend before gifts become available', async () => {
    const user = userEvent.setup()
    renderSeededPage(<SocialPage />, { route: '/social', url: '/social' })

    await user.click(screen.getByRole('button', { name: '🎁 Send Gifts' }))

    expect(screen.getByText('Select a Friend')).toBeInTheDocument()
    expect(
      screen.getByText('Select a friend above to send them a gift!'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: new RegExp(AVAILABLE_GIFTS[0].name) }),
    ).not.toBeInTheDocument()
  })

  it('merges the player into the friends leaderboard', async () => {
    const user = userEvent.setup()
    const { character } = seedDefaultGame()
    renderSeededPage(<SocialPage />, { route: '/social', url: '/social' })

    await user.click(screen.getByRole('button', { name: '🏆 Leaderboard' }))

    for (const entry of MOCK_LEADERBOARD) {
      expect(screen.getByText(entry.name)).toBeInTheDocument()
    }
    expect(screen.getByText(character.name)).toBeInTheDocument()
    expect(screen.getByText('You')).toBeInTheDocument()
    // Every entry is listed: the mock board plus the player
    expect(screen.getAllByText(/ XP$/)).toHaveLength(MOCK_LEADERBOARD.length + 1)
  })
})
