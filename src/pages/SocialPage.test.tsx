import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, within, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SocialPage from './SocialPage'
import { MOCK_FRIENDS, MOCK_LEADERBOARD, AVAILABLE_GIFTS } from '@/data/social'
import { closestContainer, renderSeededPage, seedDefaultGame } from './test-utils'

const onlineFriends = MOCK_FRIENDS.filter((friend) => friend.isOnline)

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

    expect(screen.getByRole('heading', { level: 1, name: /Social Hub/ })).toBeInTheDocument()
    expect(statValue('Friends Online')).toBe(String(onlineFriends.length))
    expect(statValue('Total Friends')).toBe(String(MOCK_FRIENDS.length))
    expect(statValue('Gifts Sent')).toBe('0')
  })

  it('lists every friend with their online status on the friends tab', () => {
    renderSeededPage(<SocialPage />, { route: '/social', url: '/social' })

    for (const friend of MOCK_FRIENDS) {
      expect(screen.getByText(friend.name)).toBeInTheDocument()
      expect(screen.getByText(`Level ${friend.level} • ${friend.title}`)).toBeInTheDocument()
      expect(screen.getByText(`🔥 ${friend.streakDays} day streak`)).toBeInTheDocument()
    }
    expect(screen.getAllByText('Online')).toHaveLength(onlineFriends.length)
    // Each friend row offers a gift shortcut (exact match so the "Send Gifts"
    // tab button is not counted as well)
    expect(screen.getAllByRole('button', { name: '🎁 Send Gift' })).toHaveLength(
      MOCK_FRIENDS.length,
    )
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
      screen.getByText(`You sent ${firstGift.icon} ${firstGift.name} to ${firstFriend.name}!`),
    ).toBeInTheDocument()
    // The gift is counted and the friend selection is reset
    expect(statValue('Gifts Sent')).toBe('1')
    expect(screen.getByText('Select a friend above to send them a gift!')).toBeInTheDocument()
  })

  it('requires picking a friend before gifts become available', async () => {
    const user = userEvent.setup()
    renderSeededPage(<SocialPage />, { route: '/social', url: '/social' })

    await user.click(screen.getByRole('button', { name: '🎁 Send Gifts' }))

    expect(screen.getByText('Select a Friend')).toBeInTheDocument()
    expect(screen.getByText('Select a friend above to send them a gift!')).toBeInTheDocument()
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

  it('highlights the top three ranks and marks friend entries', async () => {
    const user = userEvent.setup()
    renderSeededPage(<SocialPage />, { route: '/social', url: '/social' })

    await user.click(screen.getByRole('button', { name: '🏆 Leaderboard' }))

    const rows = screen
      .getAllByText(/ XP$/)
      .map((xp) => xp.closest('div.rounded-xl'))
      .filter((row): row is HTMLElement => row !== null)
    expect(rows).toHaveLength(MOCK_LEADERBOARD.length + 1)

    // Medals for the podium, plain rank numbers further down
    expect(within(rows[0]).getByText('🥇')).toBeInTheDocument()
    expect(within(rows[1]).getByText('🥈')).toBeInTheDocument()
    expect(within(rows[2]).getByText('🥉')).toBeInTheDocument()
    expect(within(rows[3]).getByText('#4')).toBeInTheDocument()

    // Only the entries flagged as friends carry the Friend badge
    for (const entry of MOCK_LEADERBOARD) {
      const row = closestContainer(screen.getByText(entry.name), 'div.rounded-xl')
      const friendBadge = within(row).queryByText('Friend')
      if (entry.isFriend) {
        expect(friendBadge).toBeInTheDocument()
      } else {
        expect(friendBadge).not.toBeInTheDocument()
      }
    }
    expect(within(rows[rows.length - 1]).getByText('You')).toBeInTheDocument()
  })

  it('picks a friend from the gifts tab and pre-fills their gift list', async () => {
    const user = userEvent.setup()
    const [friend] = MOCK_FRIENDS
    renderSeededPage(<SocialPage />, { route: '/social', url: '/social' })

    await user.click(screen.getByRole('button', { name: '🎁 Send Gifts' }))

    await user.click(screen.getByRole('button', { name: new RegExp(friend.name) }))

    expect(
      screen.getByText(`Select a Gift for ${friend.avatar} ${friend.name}`),
    ).toBeInTheDocument()
    for (const gift of AVAILABLE_GIFTS) {
      expect(screen.getByRole('button', { name: new RegExp(gift.name) })).toBeEnabled()
    }
  })

  it('puts a gift on cooldown until it expires', () => {
    vi.useFakeTimers()
    const [firstFriend, secondFriend] = MOCK_FRIENDS
    const [boost] = AVAILABLE_GIFTS
    renderSeededPage(<SocialPage />, { route: '/social', url: '/social' })

    const giftButton = () => screen.getByRole('button', { name: new RegExp(boost.name) })
    const openPickerFor = (friend: typeof firstFriend) => {
      fireEvent.click(screen.getByRole('button', { name: '🎁 Send Gifts' }))
      fireEvent.click(screen.getByRole('button', { name: new RegExp(friend.name) }))
    }

    openPickerFor(firstFriend)
    fireEvent.click(giftButton())
    expect(statValue('Gifts Sent')).toBe('1')

    // The cooldown is per gift type: back in the picker it is blocked
    openPickerFor(secondFriend)
    expect(giftButton()).toBeDisabled()
    expect(within(giftButton()).getByText('24h cooldown')).toBeInTheDocument()

    // A day later the cooldown has run out and the gift can be sent again
    act(() => {
      vi.advanceTimersByTime(25 * 60 * 60 * 1000)
    })
    openPickerFor(secondFriend)
    expect(giftButton()).toBeEnabled()
    expect(within(giftButton()).queryByText(/cooldown/)).not.toBeInTheDocument()

    // Sending it a second time leaves two records for one gift id
    fireEvent.click(giftButton())
    expect(
      screen.getByText(`You sent ${boost.icon} ${boost.name} to ${secondFriend.name}!`),
    ).toBeInTheDocument()
    expect(statValue('Gifts Sent')).toBe('2')

    // The newest send wins the countdown, so the wait restarts at a full day
    openPickerFor(firstFriend)
    expect(giftButton()).toBeDisabled()
    expect(within(giftButton()).getByText('24h cooldown')).toBeInTheDocument()
  })

  it('clears the gift confirmation toast after three seconds', () => {
    vi.useFakeTimers()
    const [firstFriend] = MOCK_FRIENDS
    const [firstGift] = AVAILABLE_GIFTS
    renderSeededPage(<SocialPage />, { route: '/social', url: '/social' })

    fireEvent.click(screen.getAllByRole('button', { name: '🎁 Send Gift' })[0])
    fireEvent.click(screen.getByRole('button', { name: new RegExp(firstGift.name) }))

    expect(
      screen.getByText(`You sent ${firstGift.icon} ${firstGift.name} to ${firstFriend.name}!`),
    ).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(
      screen.queryByText(`You sent ${firstGift.icon} ${firstGift.name} to ${firstFriend.name}!`),
    ).not.toBeInTheDocument()
    expect(statValue('Gifts Sent')).toBe('1')
  })
})
