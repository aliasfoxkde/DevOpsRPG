import { useState, useMemo } from 'react'
import { useGame } from '../contexts/GameContext'
import { realms, realmStories, allQuests } from '../data/quests'
import { getRandomEncouragement } from '../data/milestones'
import { Link } from 'react-router-dom'

type FilterStatus = 'all' | 'available' | 'completed' | 'locked'
type SortBy = 'level' | 'xp' | 'difficulty' | 'name'
type FilterDifficulty = 1 | 2 | 3 | 4 | 5 | 'all'

export default function QuestJournalPage() {
  const { game, isQuestCompleted, getNextQuest, getRealmProgress, completedCount, totalQuests, getWeakTopics, getTopicsDueForReview } = useGame()
  const { character } = game
  const encouragement = getRandomEncouragement()

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<FilterDifficulty>('all')
  const [sortBy, setSortBy] = useState<SortBy>('level')
  const [searchQuery, setSearchQuery] = useState('')

  const nextQuest = getNextQuest()
  const currentRealm = nextQuest ? realms[nextQuest.realmId] : null

  // Get unique technologies
  const technologies = useMemo(() => {
    const techs = new Set(allQuests.map(q => q.technologyId))
    return Array.from(techs).sort()
  }, [])

  const [filterTech, setFilterTech] = useState<string>('all')

  // Get unique realms for filtering
  const realmOptions = useMemo(() => {
    return Object.values(realms).map(r => ({ id: r.id, name: r.name }))
  }, [])

  const [filterRealm, setFilterRealm] = useState<string>('all')

  // Filter and sort quests
  const filteredQuests = useMemo(() => {
    let quests = [...allQuests]

    // Filter by status
    if (filterStatus === 'available') {
      quests = quests.filter(q => !isQuestCompleted(q.id))
    } else if (filterStatus === 'completed') {
      quests = quests.filter(q => isQuestCompleted(q.id))
    }

    // Filter by difficulty
    if (filterDifficulty !== 'all') {
      quests = quests.filter(q => q.difficulty === filterDifficulty)
    }

    // Filter by technology
    if (filterTech !== 'all') {
      quests = quests.filter(q => q.technologyId === filterTech)
    }

    // Filter by realm
    if (filterRealm !== 'all') {
      quests = quests.filter(q => q.realmId === filterRealm)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      quests = quests.filter(q =>
        q.title.toLowerCase().includes(query) ||
        q.description.toLowerCase().includes(query) ||
        q.technologyId.toLowerCase().includes(query)
      )
    }

    // Sort quests
    quests.sort((a, b) => {
      switch (sortBy) {
        case 'xp':
          return b.xpReward - a.xpReward
        case 'difficulty':
          return b.difficulty - a.difficulty
        case 'name':
          return a.title.localeCompare(b.title)
        case 'level':
        default:
          // Sort by realm order then by order in realm
          const realmOrder = Object.keys(realms).indexOf(a.realmId) - Object.keys(realms).indexOf(b.realmId)
          if (realmOrder !== 0) return realmOrder
          return a.order - b.order
      }
    })

    return quests
  }, [filterStatus, filterDifficulty, filterTech, filterRealm, searchQuery, sortBy, isQuestCompleted])

  const difficultyColors: Record<number, string> = {
    1: 'text-green-400 bg-green-900/30',
    2: 'text-blue-400 bg-blue-900/30',
    3: 'text-yellow-400 bg-yellow-900/30',
    4: 'text-orange-400 bg-orange-900/30',
    5: 'text-red-400 bg-red-900/30',
  }

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

      {/* Filter Bar */}
      <section className="max-w-6xl mx-auto px-4 py-4">
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="🔍 Search quests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="completed">Completed</option>
              <option value="locked">Locked</option>
            </select>

            {/* Realm Filter */}
            <select
              value={filterRealm}
              onChange={(e) => setFilterRealm(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Realms</option>
              {realmOptions.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>

            {/* Tech Filter */}
            <select
              value={filterTech}
              onChange={(e) => setFilterTech(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Technologies</option>
              {technologies.map(t => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value as FilterDifficulty)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Difficulties</option>
              <option value={1}>⭐ Beginner</option>
              <option value={2}>⭐⭐ Easy</option>
              <option value={3}>⭐⭐⭐ Medium</option>
              <option value={4}>⭐⭐⭐⭐ Hard</option>
              <option value={5}>⭐⭐⭐⭐⭐ Expert</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="level">Sort: Realm Order</option>
              <option value="xp">Sort: XP (High→Low)</option>
              <option value="difficulty">Sort: Difficulty</option>
              <option value="name">Sort: Name (A→Z)</option>
            </select>
          </div>

          <div className="mt-3 text-sm text-slate-400">
            Showing {filteredQuests.length} of {allQuests.length} quests
            {filteredQuests.length !== allQuests.length && (
              <button
                onClick={() => {
                  setFilterStatus('all')
                  setFilterDifficulty('all')
                  setFilterTech('all')
                  setFilterRealm('all')
                  setSearchQuery('')
                }}
                className="ml-2 text-amber-400 hover:text-amber-300 underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Smart Recommendations based on weak topics */}
      {(() => {
        const weakTopics = getWeakTopics()
        const dueTopics = getTopicsDueForReview()

        // Get recommended quests based on weak topics
        const recommendedQuests = allQuests
          .filter(q => {
            // Filter to available quests that aren't completed
            if (isQuestCompleted(q.id)) return false
            const questRealm = realms[q.realmId]
            if (character.level < questRealm.requiredLevel) return false

            // Match weak topics
            if (dueTopics.length > 0) {
              return dueTopics.includes(q.topicId)
            }

            // If no due topics, recommend based on low mastery
            const weakMatch = weakTopics.find(w => w.topicId === q.topicId)
            return weakMatch && weakMatch.masteryLevel < 2
          })
          .slice(0, 3)

        if (recommendedQuests.length === 0) return null

        return (
          <section className="max-w-6xl mx-auto px-4 py-4">
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30 p-4">
              <h3 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
                🎯 Smart Recommendations
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Based on your weak areas, we recommend:
              </p>
              <div className="grid gap-2">
                {recommendedQuests.map(quest => {
                  const questRealm = realms[quest.realmId]
                  return (
                    <Link
                      key={quest.id}
                      to={`/quest/${quest.id}`}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{questRealm.icon}</span>
                        <div>
                          <div className="font-medium text-white">{quest.title}</div>
                          <div className="text-xs text-slate-400">{quest.technologyId.toUpperCase()}</div>
                        </div>
                      </div>
                      <div className="text-amber-400 font-bold">{quest.xpReward} XP</div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })()}

      {/* Quest List */}
      <section className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid gap-3">
          {filteredQuests.map(quest => {
            const isCompleted = isQuestCompleted(quest.id)
            const questRealm = realms[quest.realmId]
            const isUnlocked = character.level >= questRealm.requiredLevel

            return (
              <Link
                key={quest.id}
                to={isUnlocked ? `/quest/${quest.id}` : '#'}
                className={`block p-4 rounded-xl border transition-all ${
                  !isUnlocked
                    ? 'bg-slate-900/50 border-slate-700/50 opacity-50 cursor-not-allowed'
                    : isCompleted
                    ? 'bg-green-900/20 border-green-700/50 hover:border-green-500'
                    : 'bg-slate-800/80 border-slate-600 hover:border-amber-500/50'
                }`}
                onClick={(e) => !isUnlocked && e.preventDefault()}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                      isCompleted ? 'bg-green-900/50' : 'bg-slate-700'
                    }`}>
                      {isCompleted ? '✓' : questRealm.icon}
                    </div>
                    <div>
                      <h3 className={`font-bold ${
                        isCompleted ? 'text-green-400 line-through' : 'text-white'
                      }`}>
                        {quest.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className={`px-2 py-0.5 rounded ${difficultyColors[quest.difficulty]}`}>
                          {'⭐'.repeat(quest.difficulty)}
                        </span>
                        <span>{quest.technologyId.toUpperCase()}</span>
                        <span>•</span>
                        <span>{questRealm.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${isCompleted ? 'text-green-400' : 'text-amber-400'}`}>
                      {quest.xpReward} XP
                    </div>
                    <div className="text-xs text-slate-500">
                      ~{quest.estimatedMinutes} min
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {filteredQuests.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <div className="text-4xl mb-4">🔍</div>
            <p>No quests match your filters.</p>
            <button
              onClick={() => {
                setFilterStatus('all')
                setFilterDifficulty('all')
                setFilterTech('all')
                setFilterRealm('all')
                setSearchQuery('')
              }}
              className="mt-2 text-amber-400 hover:text-amber-300 underline"
            >
              Clear all filters
            </button>
          </div>
        )}
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
