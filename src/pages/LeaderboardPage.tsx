import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import type { CharacterClass } from '../contexts/GameContext'

interface LeaderboardEntry {
  id: string
  name: string
  class: CharacterClass
  level: number
  xp: number
  completedQuests: number
  badges: number
  streak: number
  lastActive: string
  realm: string
}

// Generate mock leaderboard data
function generateMockLeaderboard(playerName: string, playerLevel: number, playerXP: number, playerBadges: number): LeaderboardEntry[] {
  const classes: CharacterClass[] = ['Cloud Knight', 'Script Warrior', 'Data Mage', 'DevOps Sage']
  const realms = ['Village of Foundations', 'Forest of Scripts', 'Castle of Frameworks', 'Mountains of Cloud', 'Citadel of DevOps']
  const names = [
    'ShadowCoder', 'ByteRunner', 'CloudNinja', 'DataWizard', 'GitGuru',
    'DockMaster', 'K8sCommander', 'PipelineKing', ' InfraSage', 'ScriptWizard',
    'CodeNinja', 'TerminalHero', 'DeployDemon', 'MonitorMaven', 'LogLegend',
    'BugSlayer', 'StackOverflow', 'APIPhantom', 'ContainerCaptain', 'VaultVictor'
  ]

  const entries: LeaderboardEntry[] = []

  // Add player entry (positioned based on level)
  const playerPosition = Math.max(1, Math.floor(Math.random() * 15))

  // Generate top players
  for (let i = 0; i < 20; i++) {
    const level = 25 - Math.floor(i / 3)
    const xp = level * 1000 + Math.floor(Math.random() * 500)
    const position = i + 1

    if (position === playerPosition) {
      entries.push({
        id: 'player',
        name: playerName + ' (You)',
        class: classes[Math.min(Math.floor(level / 5), classes.length - 1)],
        level: playerLevel,
        xp: playerXP,
        completedQuests: Math.floor(playerLevel * 3.5),
        badges: playerBadges,
        streak: Math.floor(Math.random() * 7),
        lastActive: 'Just now',
        realm: realms[Math.min(Math.floor(playerLevel / 5), realms.length - 1)]
      })
    }

    entries.push({
      id: `player_${i}`,
      name: names[i] || `Hero${i}`,
      class: classes[Math.min(Math.floor(level / 5), classes.length - 1)],
      level,
      xp,
      completedQuests: Math.floor(level * 3.5) + Math.floor(Math.random() * 10),
      badges: Math.floor(level / 3) + Math.floor(Math.random() * 5),
      streak: Math.floor(Math.random() * 14),
      lastActive: `${Math.floor(Math.random() * 24)}h ago`,
      realm: realms[Math.min(Math.floor(level / 5), realms.length - 1)]
    })
  }

  // Sort by XP
  entries.sort((a, b) => b.xp - a.xp)

  // Re-index positions
  return entries.map((e, i) => ({ ...e, id: i === playerPosition - 1 ? 'player' : `mock_${i}` }))
}

type SortKey = 'rank' | 'name' | 'level' | 'xp' | 'completedQuests' | 'badges' | 'streak'
type SortDirection = 'asc' | 'desc'

export default function LeaderboardPage() {
  const { game } = useGame()
  const { character, completedQuests, badges } = game
  const [timeframe, setTimeframe] = useState<'all' | 'weekly' | 'daily'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('rank')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardEntry | null>(null)

  const leaderboardData = useMemo(() => {
    const data = generateMockLeaderboard(character.name, character.level, character.xp, badges.length)
    return data
  }, [character.name, character.level, character.xp, badges.length])

  const sortedData = useMemo(() => {
    const sorted = [...leaderboardData].sort((a, b) => {
      if (sortKey === 'rank') {
        return sortDirection === 'asc'
          ? (a.id === 'player' ? -1 : 1) - (b.id === 'player' ? -1 : 1)
          : (b.id === 'player' ? -1 : 1) - (a.id === 'player' ? -1 : 1)
      }
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }
      return 0
    })
    return sorted
  }, [leaderboardData, sortKey, sortDirection])

  const playerRank = sortedData.findIndex(e => e.id === 'player') + 1

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getClassColor = (charClass: CharacterClass) => {
    const colors: Record<CharacterClass, string> = {
      'Cloud Knight': 'text-slate-400',
      'Script Warrior': 'text-green-400',
      'Data Mage': 'text-blue-400',
      'DevOps Sage': 'text-purple-400'
    }
    return colors[charClass] || 'text-slate-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              ← Home
            </Link>
            <h1 className="text-xl font-bold text-white">🏆 Leaderboard</h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Player Rank Card */}
        <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 rounded-xl border border-amber-600/50 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center text-3xl font-bold text-white">
                {character.level}
              </div>
              <div>
                <p className="text-amber-400 font-bold text-lg">{character.name}</p>
                <p className="text-slate-400 text-sm">Level {character.level} {character.class}</p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-slate-400 text-sm">Your Rank</p>
              <p className="text-4xl font-bold text-white">{getRankIcon(playerRank)}</p>
            </div>
          </div>
        </div>

        {/* Timeframe Tabs */}
        <div className="flex gap-2 mb-4">
          {(['all', 'weekly', 'daily'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeframe === tf
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tf === 'all' ? '🏆 All Time' : tf === 'weekly' ? '📅 This Week' : '⚡ Today'}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-3 bg-slate-900/50 border-b border-slate-700 text-sm font-bold text-slate-400">
            <div className="col-span-1">Rank</div>
            <div className="col-span-3 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
              Player {sortKey === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </div>
            <div className="col-span-2 cursor-pointer hover:text-white text-center" onClick={() => handleSort('level')}>
              Level {sortKey === 'level' && (sortDirection === 'asc' ? '↑' : '↓')}
            </div>
            <div className="col-span-2 cursor-pointer hover:text-white text-right" onClick={() => handleSort('xp')}>
              XP {sortKey === 'xp' && (sortDirection === 'asc' ? '↑' : '↓')}
            </div>
            <div className="col-span-2 cursor-pointer hover:text-white text-center" onClick={() => handleSort('completedQuests')}>
              Quests {sortKey === 'completedQuests' && (sortDirection === 'asc' ? '↑' : '↓')}
            </div>
            <div className="col-span-1 cursor-pointer hover:text-white text-center" onClick={() => handleSort('badges')}>
              Badges {sortKey === 'badges' && (sortDirection === 'asc' ? '↑' : '↓')}
            </div>
            <div className="col-span-1 cursor-pointer hover:text-white text-center" onClick={() => handleSort('streak')}>
              🔥 {sortKey === 'streak' && (sortDirection === 'asc' ? '↑' : '↓')}
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-700/50">
            {sortedData.slice(0, 50).map((entry, index) => {
              const rank = index + 1
              const isPlayer = entry.id === 'player'

              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedPlayer(entry)}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 items-center cursor-pointer transition-all ${
                    isPlayer
                      ? 'bg-amber-900/20 border-l-4 border-amber-500'
                      : 'hover:bg-slate-700/50'
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1 text-lg">
                    {getRankIcon(rank)}
                  </div>

                  {/* Name & Class */}
                  <div className="col-span-3">
                    <p className={`font-bold ${isPlayer ? 'text-amber-400' : 'text-white'}`}>
                      {entry.name}
                    </p>
                    <p className={`text-xs ${getClassColor(entry.class)}`}>
                      {entry.class}
                    </p>
                  </div>

                  {/* Level */}
                  <div className="col-span-2 text-center">
                    <span className="md:hidden text-slate-500 text-xs">Level: </span>
                    <span className="text-white font-bold">{entry.level}</span>
                  </div>

                  {/* XP */}
                  <div className="col-span-2 text-right">
                    <span className="md:hidden text-slate-500 text-xs">XP: </span>
                    <span className="text-green-400 font-mono">{entry.xp.toLocaleString()}</span>
                  </div>

                  {/* Quests */}
                  <div className="col-span-2 text-center">
                    <span className="md:hidden text-slate-500 text-xs">Quests: </span>
                    <span className="text-slate-300">{entry.completedQuests}</span>
                  </div>

                  {/* Badges */}
                  <div className="col-span-1 text-center">
                    <span className="md:hidden text-slate-500 text-xs">Badges: </span>
                    <span className="text-purple-400">{entry.badges}</span>
                  </div>

                  {/* Streak */}
                  <div className="col-span-1 text-center">
                    <span className="md:hidden text-slate-500 text-xs">🔥 </span>
                    <span className={entry.streak > 0 ? 'text-orange-400' : 'text-slate-500'}>
                      {entry.streak}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Your Stats Summary */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 rounded-lg p-4 text-center border border-slate-700">
            <p className="text-slate-500 text-sm mb-1">Quests Completed</p>
            <p className="text-2xl font-bold text-white">{completedQuests.length}</p>
          </div>
          <div className="bg-slate-800/80 rounded-lg p-4 text-center border border-slate-700">
            <p className="text-slate-500 text-sm mb-1">Badges Earned</p>
            <p className="text-2xl font-bold text-purple-400">{badges.length}</p>
          </div>
          <div className="bg-slate-800/80 rounded-lg p-4 text-center border border-slate-700">
            <p className="text-slate-500 text-sm mb-1">Your XP</p>
            <p className="text-2xl font-bold text-green-400">{character.xp.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800/80 rounded-lg p-4 text-center border border-slate-700">
            <p className="text-slate-500 text-sm mb-1">Current Realm</p>
            <p className="text-lg font-bold text-amber-400">
              {character.level < 5 ? '🏘️' : character.level < 10 ? '🌲' : character.level < 15 ? '🏰' : character.level < 20 ? '⛰️' : '🏛️'}
            </p>
          </div>
        </div>
      </main>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-xl font-bold text-white">
                  {selectedPlayer.level}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedPlayer.name}</h2>
                  <p className={`text-sm ${getClassColor(selectedPlayer.class)}`}>{selectedPlayer.class}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="text-slate-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-slate-500 text-xs mb-1">Level</p>
                  <p className="text-xl font-bold text-white">{selectedPlayer.level}</p>
                </div>
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-slate-500 text-xs mb-1">XP</p>
                  <p className="text-xl font-bold text-green-400">{selectedPlayer.xp.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-slate-500 text-xs mb-1">Quests</p>
                  <p className="text-xl font-bold text-blue-400">{selectedPlayer.completedQuests}</p>
                </div>
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-slate-500 text-xs mb-1">🔥 Streak</p>
                  <p className="text-xl font-bold text-orange-400">{selectedPlayer.streak} days</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Realm</span>
                  <span className="text-white">{selectedPlayer.realm}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-slate-500">Badges</span>
                  <span className="text-purple-400">{selectedPlayer.badges}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-slate-500">Last Active</span>
                  <span className="text-slate-300">{selectedPlayer.lastActive}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
