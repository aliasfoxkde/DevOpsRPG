import { useGame } from '../contexts/GameContext'
import { realms, realmStories, allQuests } from '../data/quests'
import { getRandomEncouragement } from '../data/milestones'
import { Link } from 'react-router-dom'

export default function QuestJournalPage() {
  const { game, isQuestCompleted, getNextQuest, getRealmProgress, completedCount, totalQuests } = useGame()
  const { character } = game
  const encouragement = getRandomEncouragement()

  const nextQuest = getNextQuest()
  const currentRealm = nextQuest ? realms[nextQuest.realmId] : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-amber-900/30 via-slate-900 to-purple-900/30 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-amber-400 mb-2">
            ⚔️ Quest Journal ⚔️
          </h1>
          <p className="text-slate-400 mb-4">
            Your journey to become a DevOps Master awaits
          </p>

          {/* Current Quest CTA */}
          {nextQuest && (
            <div className="mt-6 p-4 bg-slate-800/80 rounded-xl border border-amber-600/50 max-w-lg mx-auto">
              <div className="text-sm text-amber-400 mb-1">CURRENT QUEST</div>
              <Link
                to={`/quest/${nextQuest.id}`}
                className="block text-xl font-bold text-white hover:text-amber-400 transition-colors mb-2"
              >
                {nextQuest.title}
              </Link>
              <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                <span>✨ {nextQuest.xpReward} XP</span>
                <span>⏱️ ~{nextQuest.estimatedMinutes} min</span>
                <span>📍 {currentRealm?.name}</span>
              </div>
              <Link
                to={`/quest/${nextQuest.id}`}
                className="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105"
              >
                ⚔️ Begin Battle
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Realm Map */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
          🗺️ World Map
        </h2>

        <div className="space-y-6">
          {Object.values(realms).map((realm, index) => {
            const progress = getRealmProgress(realm.id)
            const realmQuests = allQuests.filter(q => q.realmId === realm.id)
            const prevRealm = index > 0 ? Object.values(realms)[index - 1] : null
            const prevRealmComplete = prevRealm && getRealmProgress(prevRealm.id).completed === getRealmProgress(prevRealm.id).total
            const isUnlocked = character.level >= realm.requiredLevel ||
              (index === 0) ||
              (prevRealm && prevRealmComplete)
            const isCurrentRealm = currentRealm?.id === realm.id

            return (
              <div
                key={realm.id}
                className={`relative p-6 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'bg-slate-800/80 border-slate-600 hover:border-amber-500/50'
                    : 'bg-slate-900/50 border-slate-700/50 opacity-60'
                }`}
              >
                {/* Realm Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`text-4xl ${!isUnlocked && 'grayscale opacity-50'}`}>
                      {realm.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        {realm.name}
                        {!isUnlocked && <span className="text-sm text-slate-500">🔒</span>}
                        {isCurrentRealm && <span className="text-sm text-amber-400 animate-pulse">▶️</span>}
                      </h3>
                      <p className="text-sm text-slate-400">
                        Requires Level {realm.requiredLevel} • {realm.technologies.length} Technologies
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-400">
                      {progress.completed}/{progress.total}
                    </div>
                    <div className="text-xs text-slate-500">Quests</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
                    style={{ width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%` }}
                  />
                </div>

                {/* Description */}
                <p className="text-slate-400 text-sm mb-4">{realm.description}</p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {realm.technologies.map(techId => {
                    const techQuests = realmQuests.filter(q => q.technologyId === techId)
                    const techCompleted = techQuests.filter(q => isQuestCompleted(q.id)).length
                    const totalTechQuests = techQuests.length

                    return (
                      <div
                        key={techId}
                        className={`px-3 py-1 rounded-full text-sm ${
                          techCompleted === totalTechQuests && totalTechQuests > 0
                            ? 'bg-green-900/50 text-green-400 border border-green-700'
                            : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                        }`}
                      >
                        {techCompleted}/{totalTechQuests} {techId.toUpperCase()}
                      </div>
                    )
                  })}
                </div>

                {/* Start Quest Button */}
                {isUnlocked && nextQuest?.realmId === realm.id && (
                  <Link
                    to={`/quest/${nextQuest.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors"
                  >
                    ⚔️ Continue Quest
                  </Link>
                )}

                {/* Story for unlocked realms */}
                {isUnlocked && realmStories[realm.id] && (
                  <details className="mt-4">
                    <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-400">
                      📖 Read Realm Lore
                    </summary>
                    <pre className="mt-2 p-4 bg-slate-900/50 rounded-lg text-slate-300 text-sm whitespace-pre-wrap font-mono">
                      {realmStories[realm.id]}
                    </pre>
                  </details>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Overall Progress */}
      <section className="max-w-4xl mx-auto px-4 py-8 border-t border-slate-800">
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-200 mb-4">Overall Journey Progress</h3>
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
              <span>{completedCount} Quests Completed</span>
              <span>{totalQuests} Total</span>
            </div>
            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 transition-all duration-700"
                style={{ width: `${totalQuests > 0 ? (completedCount / totalQuests) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-2 text-amber-400 font-medium">
              {Math.round(totalQuests > 0 ? (completedCount / totalQuests) * 100 : 0)}% Complete
            </p>
          </div>

          {/* Daily Encouragement */}
          <div className="mt-8 p-4 bg-gradient-to-r from-purple-900/30 via-slate-800 to-blue-900/30 rounded-xl border border-purple-500/30 max-w-lg mx-auto">
            <p className="text-purple-300 italic text-lg">"{encouragement}"</p>
            <p className="text-slate-500 text-sm mt-2">Keep going, hero! ⚔️</p>
          </div>
        </div>
      </section>
    </div>
  )
}
