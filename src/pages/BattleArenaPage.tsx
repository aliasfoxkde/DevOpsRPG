import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { allQuests, getNextQuest as getNextQuestFromData, realms } from '../data/quests'
import { w3schoolsContent } from '../data/w3schools-content'
import { technologies } from '../data/technologies'
import Quiz from '../components/ui/Quiz'
import QuickMiniGame from '../components/ui/QuickMiniGame'
import TreasureChest, { getRandomLoot, type LootDrop } from '../components/ui/TreasureChest'
import CelebrationOverlay, { StreakBonus, MilestonePopup } from '../components/ui/CelebrationOverlay'
import { RealmCompletionModal } from '../components/ui/RealmCompletionModal'

type ViewMode = 'study' | 'quiz'

export default function BattleArenaPage() {
  const { questId } = useParams<{ questId: string }>()
  const navigate = useNavigate()
  const { game, completeQuest, isQuestCompleted, getNextQuest, addXP, addGold, incrementStat } = useGame()
  const [viewMode, setViewMode] = useState<ViewMode>('study')
  const [justCompleted, setJustCompleted] = useState(false)
  const [showMiniGame, setShowMiniGame] = useState(false)
  const [chestLoot, setChestLoot] = useState<LootDrop | null>(null)
  const [showChest, setShowChest] = useState(false)
  const [bonusXP, setBonusXP] = useState(0)
  const [showEncounter, setShowEncounter] = useState(false)
  const [encounterXP, setEncounterXP] = useState(0)
  const [encounterGold, setEncounterGold] = useState(0)
  const [showStreak, setShowStreak] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showMilestone, setShowMilestone] = useState(false)
  const [milestoneData, setMilestoneData] = useState<{ icon: string; title: string; message: string; xpBonus: number } | null>(null)
  const [showBadge, setShowBadge] = useState(false)
  const [badgeData, setBadgeData] = useState<{ icon: string; name: string; description: string } | null>(null)
  const [showRealmComplete, setShowRealmComplete] = useState(false)

  // Timer refs for cleanup
  const milestoneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const badgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const realmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const streakShowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const streakHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const minigameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const encounterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Lock to prevent handleComplete being called multiple times
  const completionLockRef = useRef(false)
  // Lock to prevent multiple navigations
  const navigationLockRef = useRef(false)

  const quest = allQuests.find(q => q.id === questId)
  const nextQuest = quest ? getNextQuest() : null

  // All hooks must be called before any early returns
  // Watch for milestone and badge unlocks from game state
  useEffect(() => {
    if (game.lastVictory?.milestone) {
      const m = game.lastVictory.milestone
      requestAnimationFrame(() => {
        setMilestoneData({ icon: m.icon, title: m.title, message: m.message, xpBonus: m.xpBonus })
      })
      milestoneTimerRef.current = setTimeout(() => setShowMilestone(true), 2000)
    }
    if (game.lastVictory?.badge) {
      const b = game.lastVictory.badge
      requestAnimationFrame(() => {
        setBadgeData({ icon: b.icon, name: b.name, description: b.description })
      })
      badgeTimerRef.current = setTimeout(() => setShowBadge(true), 2500)
    }

    return () => {
      if (milestoneTimerRef.current) clearTimeout(milestoneTimerRef.current)
      if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current)
    }
  }, [game.lastVictory])

  // Watch for realm completion
  useEffect(() => {
    if (game.showRealmCompletion) {
      realmTimerRef.current = setTimeout(() => setShowRealmComplete(true), 3000)
    }
    return () => {
      if (realmTimerRef.current) clearTimeout(realmTimerRef.current)
    }
  }, [game.showRealmCompletion])

  // Auto-navigate to next quest after completion
  useEffect(() => {
    if (justCompleted && !navigationLockRef.current) {
      navigationLockRef.current = true
      // Pass the completed quest ID so we can exclude it from next quest calculation
      // This avoids stale closure issues where completedQuests wasn't updated yet
      const completedQuestId = questId
      const timer = setTimeout(() => {
        // Re-read completed quests from localStorage to ensure we have fresh state
        try {
          const saved = localStorage.getItem('devopsquest_game')
          if (saved) {
            const freshGame = JSON.parse(saved)
            const completedIds = new Set<string>(freshGame.completedQuests.map((q: { topicId: string }) => q.topicId))
            // Always exclude the just-completed quest to avoid showing it as "next"
            if (completedQuestId) {
              completedIds.add(completedQuestId)
            }
            const nextQ = getNextQuestFromData(completedIds)
            if (nextQ) {
              navigate(`/quest/${nextQ.id}`)
            } else {
              navigate('/quests')
            }
          } else {
            navigate('/quests')
          }
        } catch {
          navigate('/quests')
        }
      }, 2500) // Increased delay to ensure state is persisted
      return () => clearTimeout(timer)
    } else {
      // Reset navigation lock when not completing
      navigationLockRef.current = false
    }
  }, [justCompleted, questId, getNextQuest, navigate])

  // Cleanup all pending timers on unmount
  useEffect(() => {
    return () => {
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current)
      if (milestoneTimerRef.current) clearTimeout(milestoneTimerRef.current)
      if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current)
      if (realmTimerRef.current) clearTimeout(realmTimerRef.current)
      if (streakShowTimerRef.current) clearTimeout(streakShowTimerRef.current)
      if (streakHideTimerRef.current) clearTimeout(streakHideTimerRef.current)
      if (minigameTimerRef.current) clearTimeout(minigameTimerRef.current)
      if (chestTimerRef.current) clearTimeout(chestTimerRef.current)
      if (encounterTimerRef.current) clearTimeout(encounterTimerRef.current)
    }
  }, [])

  if (!quest) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Quest Not Found</h1>
          <Link to="/quests" className="text-amber-400 hover:text-amber-300">
            ← Return to Quest Journal
          </Link>
        </div>
      </div>
    )
  }

  const realm = realms[quest.realmId]
  const techContent = w3schoolsContent.technologies[quest.technologyId]
  const topicContent = techContent?.topics.find(t => t.id === quest.topicId)
  const techData = technologies[quest.technologyId]
  const topicUrl = techData?.topics.find(t => t.id === quest.topicId)?.url

  // Guard against missing content - show error state
  if (!techContent || !techData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Quest Content Unavailable</h1>
          <p className="text-slate-400">The requested learning content could not be found.</p>
        </div>
      </div>
    )
  }
  const isCompleted = isQuestCompleted(quest.id)

  const handleComplete = (isPerfect: boolean, wrongAnswers: number = 0, passedWith80: boolean = false) => {
    // CRITICAL: Double-check quest isn't already completed - this prevents re-completing after refresh
    if (isQuestCompleted(quest.id)) {
      console.warn('Quest already completed, preventing re-completion')
      return
    }
    // Prevent multiple calls from rapid clicks
    if (completionLockRef.current) return
    completionLockRef.current = true

    // Track quiz stats before completing (includes wrong answers for no_mistakes badge)
    // Also track topic for spaced repetition system
    incrementStat('quiz', isPerfect, wrongAnswers, passedWith80, quest?.topicId)
    completeQuest(quest.id)
    setJustCompleted(true)

    // Show confetti on completion
    setShowConfetti(true)
    confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 3000)

    // Check for streak milestone
    const streak = game.character.streakDays
    if (streak >= 3 && streak % 7 === 0) {
      streakShowTimerRef.current = setTimeout(() => setShowStreak(true), 500)
      streakHideTimerRef.current = setTimeout(() => setShowStreak(false), 2500)
    }

    // 25% chance for bonus mini-game
    if (Math.random() < 0.25) {
      minigameTimerRef.current = setTimeout(() => setShowMiniGame(true), 800)
    }

    // 30% chance for treasure chest
    if (Math.random() < 0.30) {
      const loot = getRandomLoot(quest.difficulty)
      setChestLoot(loot)
      chestTimerRef.current = setTimeout(() => {
        setShowChest(true)
      }, 1200)
    }

    // 20% chance for random encounter
    if (Math.random() < 0.20) {
      const encounterXPAmount = Math.floor(Math.random() * 30) + 20
      const encounterGoldAmount = Math.floor(Math.random() * 15) + 10
      setEncounterXP(encounterXPAmount)
      setEncounterGold(encounterGoldAmount)
      encounterTimerRef.current = setTimeout(() => {
        addXP(encounterXPAmount)
        addGold(encounterGoldAmount)
        setShowEncounter(true)
      }, 1500)
    }
  }

  const handleMiniGameComplete = (success: boolean, xpWon: number) => {
    setShowMiniGame(false)
    if (success && xpWon > 0) {
      addXP(xpWon)
      setBonusXP(xpWon)
    }
  }

  const handleEncounterComplete = () => {
    setShowEncounter(false)
  }

  const handleContinue = () => {
    if (nextQuest) {
      navigate(`/quest/${nextQuest.id}`)
    } else {
      navigate('/quests')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Battle Header */}
      <header className="bg-slate-800/80 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              to="/quests"
              className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1 text-sm sm:text-base"
            >
              ← Quest Journal
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-lg">{realm.icon}</span>
              <span className="text-slate-300 hidden sm:inline">{realm.name}</span>
            </div>
            <div className="text-amber-400 font-bold">
              {quest.xpReward} XP
            </div>
          </div>
        </div>
      </header>

      {/* Battle Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Quest Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block px-4 py-1 bg-slate-800 rounded-full text-sm text-slate-400 mb-4">
            {quest.type === 'boss' ? 'BOSS BATTLE' : 'QUEST'}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            {quest.title}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            {techContent?.description || quest.description}
          </p>
        </div>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-6 sm:mb-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Difficulty:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <span key={i} className={`text-sm ${i <= quest.difficulty ? 'text-red-400' : 'text-slate-700'}`}>
                  ●
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Est. Time:</span>
            <span className="text-slate-300">~{quest.estimatedMinutes} min</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Status:</span>
            {isCompleted ? (
              <span className="text-green-400 font-medium">Completed</span>
            ) : (
              <span className="text-amber-400 font-medium">In Progress</span>
            )}
          </div>
        </div>

        {/* Mode Toggle (only for incomplete quests) */}
        {!isCompleted && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('study')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'study'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📖 Study
              </button>
              <button
                onClick={() => setViewMode('quiz')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'quiz'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📝 Quiz
              </button>
            </div>
          </div>
        )}

        {viewMode === 'study' ? (
          <>
            {/* Content Card - Study Mode */}
            <div className="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-red-900/30 via-slate-800 to-blue-900/30 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  📋 Intel Briefing
                </h2>
              </div>

              <div className="p-4 sm:p-6">
                {topicContent ? (
                  <div className="space-y-6">
                    {topicContent.sections.map((section, idx) => (
                      <div key={idx} className="border-l-2 border-amber-600/50 pl-4">
                        <h3 className="text-lg font-bold text-amber-400 mb-2">
                          {section.heading}
                        </h3>
                        <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                          {section.content}
                        </p>
                      </div>
                    ))}

                    {topicContent.codeExamples.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-bold text-amber-400 mb-3">
                          💻 Code Examples
                        </h3>
                        <div className="space-y-4">
                          {topicContent.codeExamples.map((code, idx) => (
                            <pre
                              key={idx}
                              className="bg-slate-900/80 rounded-lg p-3 sm:p-4 overflow-x-auto border border-slate-700 text-xs sm:text-sm"
                            >
                              <code className="text-green-400 font-mono">
                                {code}
                              </code>
                            </pre>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-2">📚 Study Material</p>
                    {topicUrl ? (
                      <>
                        <p className="text-amber-400 mb-4">Learn from external resources:</p>
                        <a
                          href={topicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-lg transition-colors"
                        >
                          📖 Open Learning Resource
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </>
                    ) : (
                      <p className="text-amber-400">Study material available via quiz.</p>
                    )}
                    <p className="text-slate-500 text-sm mt-4">Complete the quiz below to earn XP!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Battle Actions - Study */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isCompleted ? (
                <>
                  <div className={`text-center p-4 rounded-xl border ${justCompleted ? 'bg-green-900/50 border-green-500/50 animate-pulse' : 'bg-green-900/30 border-green-700/50'}`}>
                    <span className="text-3xl">{justCompleted ? '🎉' : '✅'}</span>
                    <p className={`font-bold mt-2 ${justCompleted ? 'text-green-300' : 'text-green-400'}`}>
                      {justCompleted ? 'Excellent! Moving to next quest...' : 'Quest Completed!'}
                    </p>
                    {justCompleted && nextQuest && (
                      <p className="text-sm text-green-200 mt-1">⚔️ {nextQuest.title}</p>
                    )}
                    {(bonusXP > 0 || chestLoot) && (
                      <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
                        {bonusXP > 0 && (
                          <span className="px-3 py-1 bg-purple-900/50 rounded-full text-purple-300 text-sm font-bold">
                            🎮 +{bonusXP} Bonus XP!
                          </span>
                        )}
                        {chestLoot && (
                          <span className="px-3 py-1 bg-amber-900/50 rounded-full text-amber-300 text-sm font-bold">
                            📦 {chestLoot.name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {!justCompleted && (
                    <button
                      onClick={handleContinue}
                      className="px-6 sm:px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105 text-sm sm:text-base"
                    >
                      {nextQuest ? `⚔️ Next: ${nextQuest.title}` : '🏆 View All Quests'}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setViewMode('quiz')}
                    className="px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105 text-sm sm:text-base"
                  >
                    📝 Take Quiz to Complete (+{quest.xpReward} XP)
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          /* Quiz Mode */
          <Quiz
            topicId={quest.topicId}
            onPass={handleComplete}
            onSkip={() => setViewMode('study')}
          />
        )}

        {/* Mini-game popup */}
        {showMiniGame && (
          <QuickMiniGame
            onComplete={handleMiniGameComplete}
            onSkip={() => setShowMiniGame(false)}
          />
        )}

        {/* Treasure Chest popup */}
        {showChest && chestLoot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="text-center">
              <TreasureChest questDifficulty={quest.difficulty} preGeneratedLoot={chestLoot} onChestOpen={(loot) => {
                if (loot.type === 'xp') addXP(loot.value)
                if (loot.type === 'gold') addGold(loot.value)
              }} />
              <p className="mt-4 text-2xl font-bold text-amber-400">{chestLoot.name}!</p>
              <p className="text-slate-400 mt-2 capitalize">{chestLoot.rarity} loot acquired!</p>
              <button
                onClick={() => setShowChest(false)}
                className="mt-4 px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg"
              >
                Awesome!
              </button>
            </div>
          </div>
        )}

        {/* Random Encounter popup */}
        {showEncounter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="text-center">
              <span className="text-6xl">⚡</span>
              <p className="mt-4 text-2xl font-bold text-orange-400">Random Event!</p>
              <p className="text-slate-300 mt-2">You discovered a bonus reward!</p>
              <div className="mt-4 flex items-center justify-center gap-4">
                <span className="px-4 py-2 bg-amber-900/50 rounded-full text-amber-400 font-bold">+{encounterXP} XP</span>
                <span className="px-4 py-2 bg-yellow-900/50 rounded-full text-yellow-400 font-bold">+{encounterGold} Gold</span>
              </div>
              <button
                onClick={handleEncounterComplete}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold rounded-lg"
              >
                Claim! 🎉
              </button>
            </div>
          </div>
        )}

        {/* Confetti celebration */}
        {showConfetti && <CelebrationOverlay />}

        {/* Streak milestone celebration */}
        {showStreak && <StreakBonus streak={game.character.streakDays} />}

        {/* Milestone unlock celebration */}
        {showMilestone && milestoneData && (
          <MilestonePopup
            icon={milestoneData.icon}
            title={milestoneData.title}
            message={milestoneData.message}
            xpBonus={milestoneData.xpBonus}
            onComplete={() => setShowMilestone(false)}
          />
        )}

        {/* Badge unlock celebration */}
        {showBadge && badgeData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="text-center animate-bounce-in">
              <div className="text-7xl mb-4">{badgeData.icon}</div>
              <div className="inline-block px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-blue-200 text-sm font-bold mb-3">
                🎖️ BADGE EARNED!
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{badgeData.name}</h2>
              <p className="text-slate-300 text-lg mb-4">{badgeData.description}</p>
              <button
                onClick={() => setShowBadge(false)}
                className="mt-4 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg"
              >
                Awesome!
              </button>
            </div>
          </div>
        )}

        {/* Realm Completion Modal */}
        {showRealmComplete && game.showRealmCompletion && (
          <RealmCompletionModal
            realmId={game.showRealmCompletion}
            onClose={() => setShowRealmComplete(false)}
          />
        )}

        {/* Quest Navigation */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <h3 className="text-lg font-bold text-slate-200 mb-4 text-center">Quest Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center text-sm">
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-slate-500 mb-1">Technology</div>
              <div className="text-slate-200 font-medium">{quest.technologyId.toUpperCase()}</div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-slate-500 mb-1">Realm</div>
              <div className="text-slate-200 font-medium hidden sm:block">{realm.name}</div>
              <div className="text-slate-200 font-medium sm:hidden">{realm.icon}</div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-slate-500 mb-1">Difficulty</div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <span key={i} className={i <= quest.difficulty ? 'text-red-400' : 'text-slate-700'}>
                    💀
                  </span>
                ))}
              </div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-slate-500 mb-1">Reward</div>
              <div className="text-amber-400 font-medium">✨ {quest.xpReward} XP</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
