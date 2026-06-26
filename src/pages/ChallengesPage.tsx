import { useState, useMemo, useEffect } from 'react'
import { useGame } from '../contexts/GameContext'
import { allQuests } from '../data/quests'

interface Challenge {
  id: string
  title: string
  description: string
  icon: string
  requirement: {
    type: 'complete_quests' | 'earn_xp' | 'maintain_streak' | 'minigame' | 'quiz'
    count: number
  }
  rewards: {
    xp: number
    gold: number
    badge?: string
  }
}

const WEEKLY_CHALLENGES: Challenge[] = [
  { id: 'weekly_quest_crusader', title: 'Quest Crusader', description: 'Complete 20 quests this week', icon: '⚔️', requirement: { type: 'complete_quests', count: 20 }, rewards: { xp: 600, gold: 250, badge: 'weekly_crusader' } },
  { id: 'weekly_xp_harvest', title: 'XP Harvest', description: 'Earn 3000 XP this week', icon: '💎', requirement: { type: 'earn_xp', count: 3000 }, rewards: { xp: 400, gold: 200 } },
  { id: 'weekly_streak_sentinel', title: 'Streak Sentinel', description: 'Maintain a 7-day streak', icon: '🔥', requirement: { type: 'maintain_streak', count: 7 }, rewards: { xp: 500, gold: 200, badge: 'streak_sentinel' } },
  { id: 'weekly_minigame_champion', title: 'Mini-Game Champion', description: 'Complete 8 mini-games this week', icon: '🎮', requirement: { type: 'minigame', count: 8 }, rewards: { xp: 350, gold: 150 } },
  { id: 'weekly_quiz_wizard', title: 'Quiz Wizard', description: 'Pass 15 quizzes this week', icon: '🧙', requirement: { type: 'quiz', count: 15 }, rewards: { xp: 450, gold: 225, badge: 'quiz_wizard' } },
]

const MONTHLY_CHALLENGES: Challenge[] = [
  { id: 'monthly_devops_champion', title: 'DevOps Champion', description: 'Complete 100 quests this month', icon: '🏆', requirement: { type: 'complete_quests', count: 100 }, rewards: { xp: 2500, gold: 1000, badge: 'devops_champion' } },
  { id: 'monthly_xp_legend', title: 'XP Legend', description: 'Earn 15000 XP this month', icon: '👑', requirement: { type: 'earn_xp', count: 15000 }, rewards: { xp: 1500, gold: 750 } },
  { id: 'monthly_streak_master', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '🔥', requirement: { type: 'maintain_streak', count: 30 }, rewards: { xp: 2000, gold: 1000, badge: 'monthly_master' } },
  { id: 'monthly_game_enthusiast', title: 'Game Enthusiast', description: 'Complete 40 mini-games this month', icon: '🎲', requirement: { type: 'minigame', count: 40 }, rewards: { xp: 1200, gold: 600 } },
  { id: 'monthly_quiz_oracle', title: 'Quiz Oracle', description: 'Pass 75 quizzes this month', icon: '🔮', requirement: { type: 'quiz', count: 75 }, rewards: { xp: 1800, gold: 900, badge: 'quiz_oracle' } },
]

function getNextWeekStart(): string {
  const next = new Date()
  let daysUntilMonday = (8 - next.getDay()) % 7
  if (daysUntilMonday === 0) daysUntilMonday = 7
  next.setDate(next.getDate() + daysUntilMonday)
  next.setHours(0, 0, 0, 0)
  return next.toISOString()
}

function getNextMonthStart(): string {
  const next = new Date()
  next.setMonth(next.getMonth() + 1)
  next.setDate(1)
  next.setHours(0, 0, 0, 0)
  return next.toISOString()
}

function formatTimeRemaining(expiresAt: string): string {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diff = expires.getTime() - now.getTime()

  if (diff <= 0) return 'Expired'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days}d ${hours}h remaining`
  if (hours > 0) return `${hours}h remaining`
  return 'Less than 1h'
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

interface ChallengeState {
  progress: number
  completed: boolean
  claimed: boolean
}

export default function ChallengesPage() {
  const { game, addXP, addGold, grantBadge, incrementStat, startDailyDash, abandonDailyDash } = useGame()
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [challengeStates, setChallengeStates] = useState<Record<string, ChallengeState>>({})
  const [dashTimeElapsed, setDashTimeElapsed] = useState(0)

  // Get challenges based on current tab
  const activeChallenges = activeTab === 'weekly' ? WEEKLY_CHALLENGES : MONTHLY_CHALLENGES
  const expiresAt = activeTab === 'weekly' ? getNextWeekStart() : getNextMonthStart()

  // Daily Dash timer effect
  useEffect(() => {
    if (!game.dailyDash.active || !game.dailyDash.startTime) {
      return
    }
    const interval = setInterval(() => {
      setDashTimeElapsed(Math.floor((Date.now() - game.dailyDash.startTime!) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [game.dailyDash.active, game.dailyDash.startTime])

  // Daily Dash completed quests for display
  const dailyDashQuests = useMemo(() => {
    if (activeTab !== 'daily') return []
    return game.dailyDash.completedQuests.map(qId => allQuests.find(q => q.id === qId)).filter(Boolean)
  }, [activeTab, game.dailyDash.completedQuests])

  // Calculate progress for each challenge based on game state
  const challengesWithProgress = useMemo(() => {
    return activeChallenges.map(c => {
      const stateKey = `${activeTab}_${c.id}`
      const savedState = challengeStates[stateKey] || { progress: 0, completed: false, claimed: false }

      let progress = savedState.progress

      // Calculate progress based on type
      switch (c.requirement.type) {
        case 'complete_quests':
          progress = Math.min(c.requirement.count, game.completedQuests.length)
          break
        case 'earn_xp':
          progress = Math.min(c.requirement.count, game.character.xp)
          break
        case 'maintain_streak':
          progress = Math.min(c.requirement.count, game.character.streakDays)
          break
        case 'minigame':
          progress = Math.min(c.requirement.count, game.stats.minigameCount)
          break
        case 'quiz':
          progress = Math.min(c.requirement.count, game.stats.quizCount)
          break
      }

      const isComplete = progress >= c.requirement.count
      const isClaimed = savedState.claimed

      return {
        ...c,
        type: activeTab,
        expiresAt,
        progress,
        completed: isComplete,
        claimed: isClaimed,
      }
    })
  }, [activeTab, activeChallenges, game, challengeStates, expiresAt])

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const totalQuests = challengesWithProgress.reduce((sum, c) => {
      if (c.requirement.type === 'complete_quests') return sum + c.requirement.count
      return sum
    }, 0)
    const completedQuests = challengesWithProgress.reduce((sum, c) => {
      if (c.requirement.type === 'complete_quests') return sum + Math.min(c.progress, c.requirement.count)
      return sum
    }, 0)
    return { total: totalQuests, completed: completedQuests }
  }, [challengesWithProgress])

  const handleClaim = (challenge: typeof challengesWithProgress[0]) => {
    if (challenge.completed || challenge.claimed) return

    // Grant rewards
    addXP(challenge.rewards.xp)
    addGold(challenge.rewards.gold)
    if (challenge.rewards.badge) {
      grantBadge(challenge.rewards.badge)
    }

    // Track challenge completion for badges
    incrementStat('challenge')

    // Mark as claimed
    const stateKey = `${activeTab}_${challenge.id}`
    setChallengeStates(prev => ({
      ...prev,
      [stateKey]: { ...prev[stateKey], claimed: true },
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">🎯 Challenges</h1>
        <p className="text-slate-400">Complete weekly and monthly challenges to earn epic rewards!</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-8 justify-center">
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${
            activeTab === 'daily'
              ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          ⚡ Daily Dash
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${
            activeTab === 'weekly'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          📅 Weekly Challenges
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${
            activeTab === 'monthly'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          🗓️ Monthly Challenges
        </button>
      </div>

      {/* Daily Dash Section */}
      {activeTab === 'daily' && (
        <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-xl border border-red-500/30 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-red-400 mb-1">⚡ Daily Dash Speedrun</h2>
              <p className="text-slate-400 text-sm">Complete 5 quests as fast as possible!</p>
            </div>
            <div className="text-right">
              {game.dailyDash.bestTime !== null && (
                <div className="text-sm text-slate-400">Best Time</div>
              )}
              <div className={`text-2xl font-bold ${game.dailyDash.bestTime !== null ? 'text-yellow-400' : 'text-slate-500'}`}>
                {game.dailyDash.bestTime !== null ? formatTime(game.dailyDash.bestTime) : '--:--'}
              </div>
            </div>
          </div>

          {/* Timer Display */}
          {game.dailyDash.active ? (
            <div className="text-center mb-6">
              <div className="text-sm text-slate-400 mb-1">Time Elapsed</div>
              <div className="text-5xl font-bold font-mono text-orange-400 animate-pulse">
                {formatTime(dashTimeElapsed)}
              </div>
            </div>
          ) : (
            <div className="text-center mb-6">
              <button
                onClick={startDailyDash}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold text-xl rounded-lg transition-all transform hover:scale-105"
              >
                ⚡ START DAILY DASH
              </button>
              <p className="text-slate-500 text-sm mt-2">Complete 5 quests to finish the dash!</p>
            </div>
          )}

          {/* Progress Dots */}
          <div className="flex justify-center gap-4 mb-6">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all ${
                  i < game.dailyDash.completedQuests.length
                    ? 'bg-green-500 text-white scale-110'
                    : i === game.dailyDash.completedQuests.length && game.dailyDash.active
                    ? 'bg-orange-500 text-white ring-4 ring-orange-300 animate-pulse'
                    : 'bg-slate-700 text-slate-500'
                }`}
              >
                {i < game.dailyDash.completedQuests.length ? '✓' : i + 1}
              </div>
            ))}
          </div>

          {/* Active Quests During Dash */}
          {game.dailyDash.active && (
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h3 className="text-sm font-bold text-slate-300 mb-3">Complete these quests:</h3>
              <div className="grid gap-2">
                {dailyDashQuests.length > 0 ? dailyDashQuests.map(quest => quest && (
                  <div key={quest.id} className="flex items-center gap-2 text-sm text-green-400">
                    <span>✓</span>
                    <span>{quest.title}</span>
                  </div>
                )) : (
                  <p className="text-slate-500 text-sm">Complete quests to track them here!</p>
                )}
              </div>
              <button
                onClick={abandonDailyDash}
                className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-400 text-sm font-bold rounded-lg transition-colors"
              >
                🛑 Abandon Dash
              </button>
            </div>
          )}

          {/* Completed Dash Summary */}
          {!game.dailyDash.active && game.dailyDash.bestTime !== null && game.dailyDash.completedQuests.length > 0 && (
            <div className="text-center">
              <div className="text-green-400 font-bold mb-2">🎉 Last Dash Complete!</div>
              <div className="text-slate-400 text-sm">
                {game.dailyDash.completedQuests.length} quests in {formatTime(
                  game.dailyDash.bestTime && game.dailyDash.completedQuests.length === 5
                    ? game.dailyDash.bestTime
                    : 0
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overall Progress (Weekly/Monthly) */}
      {activeTab !== 'daily' && (
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {activeTab === 'weekly' ? '📅 This Week' : '🗓️ This Month'}
          </h2>
          <div className="text-sm text-slate-400">
            {formatTimeRemaining(expiresAt)}
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-300">Overall Progress</span>
            <span className="text-amber-400">
              {overallProgress.completed} / {overallProgress.total} quests
            </span>
          </div>
          <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                activeTab === 'weekly'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                  : 'bg-gradient-to-r from-purple-600 to-purple-400'
              }`}
              style={{ width: `${Math.min(100, (overallProgress.completed / overallProgress.total) * 100)}%` }}
            />
          </div>
        </div>
      </div>
      )}

      {/* Challenge List */}
      {activeTab !== 'daily' && (
      <div className="grid gap-4">
        {challengesWithProgress.map((challenge) => {
          const progressPercent = Math.min(100, Math.round((challenge.progress / challenge.requirement.count) * 100))
          const canClaim = challenge.completed && !challenge.claimed

          return (
            <div
              key={challenge.id}
              className={`bg-card rounded-xl border p-5 transition-all ${
                challenge.claimed
                  ? 'border-green-500/50 bg-green-900/20'
                  : challenge.completed
                  ? 'border-amber-500/50 bg-amber-900/20 animate-pulse'
                  : 'border-border'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                  challenge.claimed
                    ? 'bg-green-900/50'
                    : 'bg-slate-800'
                }`}>
                  {challenge.claimed ? '✓' : challenge.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className={`font-bold text-lg ${
                        challenge.claimed ? 'text-green-400' : 'text-white'
                      }`}>
                        {challenge.title}
                      </h3>
                      <p className="text-sm text-slate-400">{challenge.description}</p>
                    </div>
                    {challenge.claimed && (
                      <span className="px-3 py-1 bg-green-900/50 text-green-400 rounded-full text-sm font-bold">
                        CLAIMED
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Progress</span>
                      <span className={challenge.completed ? 'text-green-400' : 'text-amber-400'}>
                        {challenge.progress} / {challenge.requirement.count}
                        {challenge.requirement.type === 'complete_quests' && ' quests'}
                        {challenge.requirement.type === 'earn_xp' && ' XP'}
                        {challenge.requirement.type === 'maintain_streak' && ' days'}
                        {challenge.requirement.type === 'minigame' && ' games'}
                        {challenge.requirement.type === 'quiz' && ' quizzes'}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          challenge.claimed
                            ? 'bg-green-500'
                            : challenge.completed
                            ? 'bg-amber-500'
                            : activeTab === 'weekly'
                            ? 'bg-amber-600/60'
                            : 'bg-purple-600/60'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-purple-400">+{challenge.rewards.xp} XP</span>
                    <span className="text-orange-400">+{challenge.rewards.gold} Gold</span>
                    {challenge.rewards.badge && (
                      <span className="text-blue-400">+ Badge</span>
                    )}
                  </div>
                </div>

                {/* Claim Button */}
                <div className="flex flex-col items-center justify-center">
                  {canClaim ? (
                    <button
                      onClick={() => handleClaim(challenge)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-lg transition-all animate-bounce"
                    >
                      CLAIM!
                    </button>
                  ) : challenge.claimed ? (
                    <div className="text-green-400 text-2xl">✓</div>
                  ) : (
                    <div className="text-slate-600 text-2xl">🔒</div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      )}

      {/* Info Footer */}
      {activeTab === 'daily' ? (
        <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <h3 className="font-bold text-red-400 mb-2">⚡ How Daily Dash Works</h3>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• Start the Daily Dash to begin a 5-quest speedrun</li>
            <li>• Complete quests as fast as you can - your time is tracked!</li>
            <li>• Abandoning resets your current progress but keeps your best time</li>
            <li>• Your best time is saved - beat it tomorrow!</li>
          </ul>
        </div>
      ) : (
        <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <h3 className="font-bold text-amber-400 mb-2">💡 How Challenges Work</h3>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• Weekly challenges reset every Monday at midnight</li>
            <li>• Monthly challenges reset on the 1st of each month</li>
            <li>• Progress is automatically tracked as you complete quests and mini-games</li>
            <li>• Claim your rewards before the challenge period ends!</li>
          </ul>
        </div>
      )}
    </div>
  )
}
