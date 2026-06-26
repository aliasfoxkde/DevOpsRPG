import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { BADGES, RARITY_COLORS, type Badge, type BadgeCategory } from '../data/badges'
import { generateBadgeCard } from '../utils/achievementCardGenerator'

type FilterCategory = 'all' | BadgeCategory
type FilterRarity = 'all' | Badge['rarity']
type FilterStatus = 'all' | 'unlocked' | 'locked'

const CATEGORY_LABELS: Record<FilterCategory, string> = {
  all: 'All',
  quest: 'Quests',
  streak: 'Streaks',
  skill: 'Skills',
  social: 'Social',
  secret: 'Secret',
  seasonal: 'Seasonal',
}

const RARITY_ORDER: Badge['rarity'][] = ['legendary', 'epic', 'rare', 'uncommon', 'common']

interface PlayerStats {
  questCount: number
  streakDays: number
  level: number
  quizCount: number
  minigameCount: number
  perfectQuiz: boolean
  quizStreak: number
  techCompleted: string[]
  realmCompleted: number
  typerCount: number
  memoryCount: number
  mathCount: number
}

function getRequirementText(badge: Badge, stats: PlayerStats): string {
  switch (badge.requirement.type) {
    case 'quest_count':
      return `Complete ${badge.requirement.value} quests (${stats.questCount}/${badge.requirement.value})`
    case 'streak_days':
      return `Maintain ${badge.requirement.value} day streak (${stats.streakDays}/${badge.requirement.value})`
    case 'level':
      return `Reach level ${badge.requirement.value} (${stats.level}/${badge.requirement.value})`
    case 'quiz_count':
      return `Complete ${badge.requirement.value} quizzes (${stats.quizCount}/${badge.requirement.value})`
    case 'minigame_count':
      return `Complete ${badge.requirement.value} mini-games (${stats.minigameCount}/${badge.requirement.value})`
    case 'tech_complete':
      return `Complete all ${badge.requirement.tech} quests`
    case 'realm_complete':
      return `Complete ${badge.requirement.value} realms`
    default:
      return 'Complete the requirement to unlock'
  }
}

export default function BadgesPage() {
  const { game } = useGame()
  const { character, completedQuests, badges, completedRealms } = game

  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all')
  const [filterRarity, setFilterRarity] = useState<FilterRarity>('all')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)

  // Calculate player stats for badge progress
  const playerStats = useMemo((): PlayerStats => {
    // Calculate tech completed by checking which technologies have all quests completed
    const techCompleted: string[] = []
    const techs = ['html', 'css', 'javascript', 'typescript', 'python', 'docker', 'kubernetes', 'aws', 'bash', 'cicd']
    for (const tech of techs) {
      const allQuestsForTech = completedQuests.filter(q => q.technologyId === tech)
      // We don't have access to total quests per tech, so just track if any are completed
      if (allQuestsForTech.length > 0) {
        techCompleted.push(tech)
      }
    }

    // Calculate realm completed
    const realmCompleted = completedQuests.filter(q =>
      q.topicId.includes('realm') || completedRealms.length
    ).length > 0 ? completedRealms.length : 0

    return {
      questCount: completedQuests.length,
      streakDays: character.streakDays,
      level: character.level,
      quizCount: completedQuests.filter(q => q.topicId.includes('quiz') || q.topicId.includes('test')).length,
      minigameCount: 0, // Not tracked in GameState
      perfectQuiz: false, // Not tracked in GameState
      quizStreak: 0, // Not tracked in GameState
      techCompleted,
      realmCompleted,
      typerCount: 0,
      memoryCount: 0,
      mathCount: 0,
    }
  }, [completedQuests, character.streakDays, character.level, completedRealms])

  // Check if badge is unlocked
  const isUnlocked = useCallback((badge: Badge) => {
    return badges.some(b => b.id === badge.id && b.unlockedAt)
  }, [badges])

  // Get unlock progress for a badge (0-100)
  const getProgress = (badge: Badge) => {
    if (isUnlocked(badge)) return 100

    switch (badge.requirement.type) {
      case 'quest_count':
        return Math.min(100, (playerStats.questCount / badge.requirement.value) * 100)
      case 'streak_days':
        return Math.min(100, (playerStats.streakDays / badge.requirement.value) * 100)
      case 'level':
        return Math.min(100, (playerStats.level / badge.requirement.value) * 100)
      case 'quiz_count':
        return Math.min(100, (playerStats.quizCount / badge.requirement.value) * 100)
      case 'minigame_count':
        return Math.min(100, (playerStats.minigameCount / badge.requirement.value) * 100)
      case 'tech_complete':
        return playerStats.techCompleted.includes(badge.requirement.tech || '') ? 100 : 0
      case 'realm_complete':
        return Math.min(100, (playerStats.realmCompleted / badge.requirement.value) * 100)
      default:
        return 0
    }
  }

  // Filter badges
  const filteredBadges = useMemo(() => {
    return BADGES.filter(badge => {
      if (filterCategory !== 'all' && badge.category !== filterCategory) return false
      if (filterRarity !== 'all' && badge.rarity !== filterRarity) return false
      if (filterStatus === 'unlocked' && !isUnlocked(badge)) return false
      if (filterStatus === 'locked' && isUnlocked(badge)) return false
      return true
    }).sort((a, b) => {
      // Sort by rarity first (legendary first), then by unlock status
      const rarityDiff = RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)
      if (rarityDiff !== 0) return rarityDiff
      // Unlocked badges first within same rarity
      const aUnlocked = isUnlocked(a) ? 0 : 1
      const bUnlocked = isUnlocked(b) ? 0 : 1
      return aUnlocked - bUnlocked
    })
  }, [filterCategory, filterRarity, filterStatus, isUnlocked])

  const unlockedCount = badges.length
  const totalCount = BADGES.length
  const completionPercent = Math.round((unlockedCount / totalCount) * 100)

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
            <h1 className="text-xl font-bold text-white">🎖️ Badge Collection</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats Summary */}
        <div className="bg-gradient-to-r from-purple-900/30 via-slate-800 to-purple-900/30 rounded-xl border border-purple-600/50 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-purple-400 font-bold text-lg">Collection Progress</p>
              <p className="text-slate-400 text-sm">{unlockedCount} of {totalCount} badges earned</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">{completionPercent}%</div>
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-amber-500 transition-all"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
            {(['quest', 'streak', 'skill', 'social', 'secret', 'seasonal'] as BadgeCategory[]).map(cat => {
              const catBadges = BADGES.filter(b => b.category === cat)
              const catUnlocked = catBadges.filter(b => isUnlocked(b)).length
              return (
                <div key={cat} className="text-center p-2 bg-slate-900/50 rounded-lg">
                  <p className="text-xs text-slate-500">{CATEGORY_LABELS[cat]}</p>
                  <p className="font-bold text-white">{catUnlocked}/{catBadges.length}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {/* Category filter */}
          <div className="flex gap-1 bg-slate-800/80 rounded-lg p-1">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilterCategory(key as FilterCategory)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  filterCategory === key
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex gap-1 bg-slate-800/80 rounded-lg p-1">
            {(['all', 'unlocked', 'locked'] as FilterStatus[]).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-green-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status === 'all' ? 'All' : status === 'unlocked' ? '✓ Unlocked' : '🔒 Locked'}
              </button>
            ))}
          </div>

          {/* Rarity filter */}
          <div className="flex gap-1 bg-slate-800/80 rounded-lg p-1">
            <button
              onClick={() => setFilterRarity('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                filterRarity === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Rarities
            </button>
            {RARITY_ORDER.map(rarity => (
              <button
                key={rarity}
                onClick={() => setFilterRarity(rarity)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all capitalize ${
                  filterRarity === rarity
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {rarity}
              </button>
            ))}
          </div>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredBadges.map(badge => {
            const unlocked = isUnlocked(badge)
            const progress = getProgress(badge)
            const rarityClass = RARITY_COLORS[badge.rarity]

            return (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`relative p-4 rounded-xl border transition-all hover:scale-105 ${
                  unlocked
                    ? rarityClass
                    : 'bg-slate-800/80 border-slate-700 opacity-60 grayscale'
                }`}
              >
                <div className="text-4xl mb-2">{unlocked ? badge.icon : '❓'}</div>
                <div className={`font-bold text-sm mb-1 ${unlocked ? '' : 'text-slate-400'}`}>
                  {unlocked ? badge.name : '???'}
                </div>
                <div className={`text-xs capitalize ${unlocked ? 'text-slate-300' : 'text-slate-500'}`}>
                  {badge.rarity}
                </div>

                {/* Progress bar for locked badges */}
                {!unlocked && progress > 0 && (
                  <div className="mt-2">
                    <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{Math.round(progress)}%</p>
                  </div>
                )}

                {/* Unlocked indicator */}
                {unlocked && (
                  <div className="absolute top-2 right-2 text-green-400">
                    ✓
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {filteredBadges.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <div className="text-5xl mb-4">🔍</div>
            <p>No badges match your filters.</p>
          </div>
        )}
      </main>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl max-w-sm w-full overflow-hidden">
            <div className={`p-6 text-center border-b border-slate-700 ${RarityBg(selectedBadge.rarity)}`}>
              <div className="text-7xl mb-4">{isUnlocked(selectedBadge) ? selectedBadge.icon : '❓'}</div>
              <h2 className="text-2xl font-bold text-white">{isUnlocked(selectedBadge) ? selectedBadge.name : '???'}</h2>
              <p className="text-slate-300 mt-1">{selectedBadge.description}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm capitalize ${
                isUnlocked(selectedBadge) ? RARITY_COLORS[selectedBadge.rarity] : 'bg-slate-700 text-slate-400'
              }`}>
                {selectedBadge.rarity}
              </span>
            </div>

            <div className="p-6 space-y-4">
              {/* Rewards */}
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <p className="text-green-400 font-bold text-xl">+{selectedBadge.xpReward}</p>
                  <p className="text-slate-500 text-sm">XP</p>
                </div>
                <div className="text-center">
                  <p className="text-amber-400 font-bold text-xl">+{selectedBadge.goldReward}</p>
                  <p className="text-slate-500 text-sm">Gold</p>
                </div>
              </div>

              {/* Progress */}
              {!isUnlocked(selectedBadge) && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-amber-400">{Math.round(getProgress(selectedBadge))}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                      style={{ width: `${getProgress(selectedBadge)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {getRequirementText(selectedBadge, playerStats)}
                  </p>
                </div>
              )}

              {/* Category */}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Category</span>
                <span className="text-slate-300 capitalize">{CATEGORY_LABELS[selectedBadge.category]}</span>
              </div>

              {/* Status */}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className={isUnlocked(selectedBadge) ? 'text-green-400' : 'text-slate-300'}>
                  {isUnlocked(selectedBadge) ? 'Unlocked!' : 'Locked'}
                </span>
              </div>

              {/* Share button for unlocked badges */}
              {isUnlocked(selectedBadge) && (
                <button
                  onClick={() => {
                    generateBadgeCard(selectedBadge, game.character.name)
                  }}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  📤 Share Achievement
                </button>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700">
              <button
                onClick={() => setSelectedBadge(null)}
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

function RarityBg(rarity: Badge['rarity']): string {
  switch (rarity) {
    case 'legendary': return 'bg-gradient-to-b from-amber-900/50 to-slate-900'
    case 'epic': return 'bg-gradient-to-b from-purple-900/50 to-slate-900'
    case 'rare': return 'bg-gradient-to-b from-blue-900/50 to-slate-900'
    case 'uncommon': return 'bg-gradient-to-b from-green-900/50 to-slate-900'
    default: return 'bg-gradient-to-b from-slate-800 to-slate-900'
  }
}
