import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { allQuests, realms } from '../data/quests'
import { w3schoolsContent } from '../data/w3schools-content'
import Quiz from '../components/ui/Quiz'

type ViewMode = 'study' | 'quiz'

export default function BattleArenaPage() {
  const { questId } = useParams<{ questId: string }>()
  const navigate = useNavigate()
  const { completeQuest, isQuestCompleted, getNextQuest } = useGame()
  const [viewMode, setViewMode] = useState<ViewMode>('study')

  const quest = allQuests.find(q => q.id === questId)

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
  const isCompleted = isQuestCompleted(quest.id)
  const nextQuest = getNextQuest()

  const handleComplete = () => {
    completeQuest(quest.id)
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
              <span className="text-xl">{realm.icon}</span>
              <span className="text-slate-300 hidden sm:inline">{realm.name}</span>
            </div>
            <div className="text-amber-400 font-bold">
              ✨ {quest.xpReward} XP
            </div>
          </div>
        </div>
      </header>

      {/* Battle Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Quest Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block px-4 py-1 bg-slate-800 rounded-full text-sm text-slate-400 mb-4">
            {quest.type === 'boss' ? '🏆 BOSS BATTLE' : '⚔️ BATTLE'}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            {quest.title}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            {techContent?.description || quest.description}
          </p>
        </div>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-6 sm:mb-8 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Difficulty:</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <span key={i} className={i <= quest.difficulty ? 'text-red-400' : 'text-slate-700'}>
                  💀
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Est. Time:</span>
            <span className="text-slate-300">~{quest.estimatedMinutes} min</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Status:</span>
            {isCompleted ? (
              <span className="text-green-400">✅ Completed</span>
            ) : (
              <span className="text-amber-400">⚔️ In Progress</span>
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
                  <div className="text-center py-8 text-slate-500">
                    <p>Content coming soon for this topic.</p>
                    <p className="text-sm mt-2">Check back after The Great Rebuild!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Battle Actions - Study */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isCompleted ? (
                <>
                  <div className="text-center p-4 bg-green-900/30 rounded-xl border border-green-700/50">
                    <span className="text-3xl">✅</span>
                    <p className="text-green-400 font-bold mt-2">Quest Completed!</p>
                  </div>
                  <button
                    onClick={handleContinue}
                    className="px-6 sm:px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105 text-sm sm:text-base"
                  >
                    {nextQuest ? `⚔️ Next: ${nextQuest.title}` : '🏆 View All Quests'}
                  </button>
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
              <div className="text-slate-200 font-medium text-xs sm:text-base">
                {'💀'.repeat(quest.difficulty)}
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
