import { useState, useMemo } from 'react'
import { useGame } from '../contexts/GameContext'
import {
  MOCK_FRIENDS,
  MOCK_LEADERBOARD,
  AVAILABLE_GIFTS,
  formatLastActive,
  type Friend,
  type Gift,
  type SentGift,
} from '../data/social'

type Tab = 'friends' | 'leaderboard' | 'gifts'

export default function SocialPage() {
  const { game } = useGame()
  const { character } = game

  // State
  const [activeTab, setActiveTab] = useState<Tab>('friends')
  const [friends] = useState<Friend[]>(MOCK_FRIENDS)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [sentGifts, setSentGifts] = useState<SentGift[]>([])
  const [giftSentMessage, setGiftSentMessage] = useState<string | null>(null)

  // Online friends count
  const onlineCount = friends.filter(f => f.isOnline).length

  // Send a gift to a friend
  const sendGift = (friend: Friend, gift: Gift) => {
    const sentGift: SentGift = {
      id: `sent_${Date.now()}`,
      friendId: friend.id,
      giftId: gift.id,
      sentAt: new Date().toISOString(),
    }
    setSentGifts(prev => [...prev, sentGift])
    setSelectedFriend(null)
    setGiftSentMessage(`You sent ${gift.icon} ${gift.name} to ${friend.name}!`)
    setTimeout(() => setGiftSentMessage(null), 3000)
  }

  // Get remaining cooldown for a gift
  const getGiftCooldown = (giftId: string): number | null => {
    const relevantGifts = sentGifts.filter(g => g.giftId === giftId)
    if (relevantGifts.length === 0) return null

    const lastSent = relevantGifts.sort((a, b) =>
      new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    )[0]

    const gift = AVAILABLE_GIFTS.find(g => g.id === giftId)
    if (!gift) return null

    const cooldownMs = gift.cooldownDays * 24 * 60 * 60 * 1000
    const nextAvailable = new Date(lastSent.sentAt).getTime() + cooldownMs

    if (Date.now() < nextAvailable) {
      const remaining = nextAvailable - Date.now()
      const hours = Math.ceil(remaining / (60 * 60 * 1000))
      return hours
    }
    return null
  }

  // Can send a specific gift type?
  const canSendGift = (giftId: string): boolean => {
    const cooldown = getGiftCooldown(giftId)
    return cooldown === null
  }

  // Current player stats for leaderboard
  const playerStats = {
    rank: 0,
    id: 'player',
    name: character.name,
    avatar: character.avatar,
    level: character.level,
    totalXP: character.xp,
    streakDays: character.streakDays,
    isFriend: false,
  }

  // Combined leaderboard with player
  const fullLeaderboard = useMemo(() => {
    const combined = [...MOCK_LEADERBOARD, playerStats]
      .sort((a, b) => b.totalXP - a.totalXP)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
    return combined
  }, [character])

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">👥 Social Hub</h1>
        <p className="text-slate-400">Connect with friends and compete!</p>
      </div>

      {/* Gift sent notification */}
      {giftSentMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl animate-bounce">
          {giftSentMessage}
        </div>
      )}

      {/* Stats Banner */}
      <div className="bg-card rounded-xl border border-border p-4 mb-8">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">{onlineCount}</div>
            <div className="text-xs text-slate-400">Friends Online</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-amber-400">{friends.length}</div>
            <div className="text-xs text-slate-400">Total Friends</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-400">{sentGifts.length}</div>
            <div className="text-xs text-slate-400">Gifts Sent</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'friends' as Tab, label: '👥 Friends', icon: '👥' },
          { id: 'leaderboard' as Tab, label: '🏆 Leaderboard', icon: '🏆' },
          { id: 'gifts' as Tab, label: '🎁 Send Gifts', icon: '🎁' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="space-y-4">
          {friends.map(friend => (
            <div
              key={friend.id}
              className="bg-card rounded-xl border border-border p-4 flex items-center gap-4"
            >
              {/* Avatar */}
              <div className="relative">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                  friend.isOnline ? 'bg-green-900/50' : 'bg-slate-800'
                }`}>
                  {friend.avatar}
                </div>
                {friend.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-900" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white">{friend.name}</h3>
                  {friend.isOnline && (
                    <span className="text-xs px-2 py-0.5 bg-green-600/30 text-green-400 rounded">Online</span>
                  )}
                </div>
                <p className="text-sm text-slate-400">
                  Level {friend.level} • {friend.title}
                </p>
                <div className="flex gap-4 mt-1 text-xs text-slate-500">
                  <span>🔥 {friend.streakDays} day streak</span>
                  <span>Last active: {formatLastActive(friend.lastActive)}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedFriend(friend)
                    setActiveTab('gifts')
                  }}
                  className="px-3 py-2 bg-amber-600/30 hover:bg-amber-600/50 text-amber-400 rounded-lg text-sm transition-colors"
                >
                  🎁 Send Gift
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-2">
          {/* Your Rank Highlight */}
          {fullLeaderboard.map((entry, index) => {
            const isPlayer = entry.id === 'player'
            const rankColors = [
              'from-yellow-600 to-amber-500', // 1st
              'from-slate-400 to-slate-300', // 2nd
              'from-orange-600 to-orange-500', // 3rd
            ]
            const rankBg = index < 3
              ? `bg-gradient-to-r ${rankColors[index]}`
              : 'bg-slate-800'

            return (
              <div
                key={entry.id}
                className={`rounded-xl border-2 transition-all ${
                  isPlayer
                    ? 'border-amber-500 bg-amber-900/20'
                    : entry.isFriend
                    ? 'border-blue-500/50 bg-blue-900/10'
                    : 'border-slate-700 bg-card'
                }`}
              >
                <div className={`p-4 flex items-center gap-4 ${rankBg} rounded-xl`}>
                  {/* Rank */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    index === 0 ? 'text-2xl' : index === 1 ? 'text-2xl' : index === 2 ? 'text-2xl' : 'bg-slate-700 text-white'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${entry.rank}`}
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-3xl">{entry.avatar}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isPlayer ? 'text-amber-400' : 'text-white'}`}>
                          {entry.name}
                        </span>
                        {entry.isFriend && !isPlayer && (
                          <span className="text-xs px-2 py-0.5 bg-blue-600/30 text-blue-400 rounded">Friend</span>
                        )}
                        {isPlayer && (
                          <span className="text-xs px-2 py-0.5 bg-amber-600/30 text-amber-400 rounded">You</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">Level {entry.level}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-lg font-bold text-amber-400">{entry.totalXP.toLocaleString()} XP</div>
                    <div className="text-sm text-slate-400">🔥 {entry.streakDays} streak</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Gifts Tab */}
      {activeTab === 'gifts' && (
        <div>
          <p className="text-slate-400 mb-6 text-center">
            Send gifts to your friends to help them progress faster!
          </p>

          {/* Select Friend */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Select a Friend</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {friends.map(friend => (
                <button
                  key={friend.id}
                  onClick={() => setSelectedFriend(friend)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedFriend?.id === friend.id
                      ? 'border-amber-500 bg-amber-900/30'
                      : 'border-slate-700 bg-card hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{friend.avatar}</span>
                    <div>
                      <div className="font-medium text-white">{friend.name}</div>
                      <div className="text-xs text-slate-400">Level {friend.level}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Select Gift */}
          {selectedFriend && (
            <div>
              <h3 className="text-lg font-bold mb-3">
                Select a Gift for {selectedFriend.avatar} {selectedFriend.name}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {AVAILABLE_GIFTS.map(gift => {
                  const onCooldown = !canSendGift(gift.id)
                  const cooldownHours = getGiftCooldown(gift.id)

                  return (
                    <button
                      key={gift.id}
                      onClick={() => !onCooldown && sendGift(selectedFriend, gift)}
                      disabled={onCooldown}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        onCooldown
                          ? 'border-slate-700 bg-slate-800/50 opacity-60 cursor-not-allowed'
                          : 'border-slate-700 bg-card hover:border-amber-500/50 hover:bg-amber-900/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-4xl">{gift.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-white">{gift.name}</h4>
                            {onCooldown && (
                              <span className="text-xs px-2 py-1 bg-slate-700 text-slate-400 rounded">
                                {cooldownHours}h cooldown
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-400">{gift.description}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Cooldown: {gift.cooldownDays} day{gift.cooldownDays > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {!selectedFriend && (
            <div className="text-center py-12 text-slate-500">
              <div className="text-6xl mb-4">👆</div>
              <p>Select a friend above to send them a gift!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
