import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { STORY_ARCS, DIFFICULTY_CONFIG, type StoryArc } from '../data/storylines'

export default function StorylinesPage() {
  const { game } = useGame()
  const { character, completedQuests } = game

  const [selectedArc, setSelectedArc] = useState<StoryArc | null>(null)

  // Calculate progress for each arc
  const getArcProgress = (arc: StoryArc) => {
    let completed = 0
    for (const episode of arc.episodes) {
      const allQuestsDone = episode.questIds.every(qId =>
        completedQuests.some(q => q.questId === qId || q.technologyId === qId)
      )
      if (allQuestsDone) completed++
    }
    return { completed, total: arc.episodes.length }
  }

  // Check if an episode is unlocked
  const isEpisodeUnlocked = (arc: StoryArc, episodeIndex: number) => {
    if (episodeIndex === 0) return true
    // Previous episode must be completed
    const prevEpisode = arc.episodes[episodeIndex - 1]
    return prevEpisode.questIds.every(qId =>
      completedQuests.some(q => q.questId === qId || q.technologyId === qId)
    )
  }

  // Check if an episode is completed
  const isEpisodeCompleted = (arc: StoryArc, episodeIndex: number) => {
    const episode = arc.episodes[episodeIndex]
    return episode.questIds.every(qId =>
      completedQuests.some(q => q.questId === qId || q.technologyId === qId)
    )
  }

  // Get the next incomplete episode
  const getNextEpisode = (arc: StoryArc) => {
    for (let i = 0; i < arc.episodes.length; i++) {
      if (!isEpisodeCompleted(arc, i)) return i
    }
    return arc.episodes.length - 1
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
            <h1 className="text-xl font-bold text-white">📖 Story Quests</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Intro */}
        <div className="bg-gradient-to-r from-purple-900/30 via-slate-800 to-blue-900/30 rounded-xl border border-purple-600/50 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">🎭 Learning Storylines</h2>
          <p className="text-slate-400 mb-4">
            Embark on epic narrative-driven quests! Follow story arcs through interconnected challenges
            with real-world scenarios. Each storyline has multiple chapters that unlock as you progress.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400">
              ✨ Level {character.level} Quest Seeker
            </span>
            <span className="text-amber-400">
              🏆 {completedQuests.length} Quests Completed
            </span>
          </div>
        </div>

        {/* Story Arcs */}
        <div className="space-y-6">
          {STORY_ARCS.map(arc => {
            const progress = getArcProgress(arc)
            const progressPercent = Math.round((progress.completed / progress.total) * 100)
            const difficulty = DIFFICULTY_CONFIG[arc.difficulty]
            const isComplete = progress.completed === progress.total
            const nextEpisode = getNextEpisode(arc)

            return (
              <div
                key={arc.id}
                className={`bg-slate-800/80 rounded-xl border overflow-hidden ${
                  isComplete
                    ? 'border-green-600/50'
                    : 'border-slate-700 hover:border-purple-600/50'
                } transition-all`}
              >
                {/* Arc Header */}
                <button
                  onClick={() => setSelectedArc(selectedArc?.id === arc.id ? null : arc)}
                  className="w-full p-6 text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <span className="text-5xl">{arc.icon}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-white">{arc.title}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs ${difficulty.bg}`}
                                style={{ color: difficulty.color }}>
                            {difficulty.label}
                          </span>
                          {isComplete && (
                            <span className="px-2 py-0.5 rounded text-xs bg-green-900/50 text-green-400">
                              ✓ Complete
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-purple-400 mb-2">{arc.subtitle}</p>
                        <p className="text-slate-400 text-sm mb-3">{arc.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>{arc.episodes.length} Chapters</span>
                          <span>⏱️ {arc.estimatedTime}</span>
                          <span className="text-amber-400">+{arc.rewards.xpBonus} XP</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-2xl ${selectedArc?.id === arc.id ? 'rotate-90' : ''} transition-transform`}>
                        ▶
                      </span>
                      <div className="text-right">
                        <div className="text-sm text-slate-400">{progress.completed}/{progress.total}</div>
                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${isComplete ? 'bg-green-500' : 'bg-purple-500'}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded Episodes */}
                {selectedArc?.id === arc.id && (
                  <div className="border-t border-slate-700 p-6 bg-slate-900/30">
                    <h4 className="text-lg font-bold text-white mb-4">📜 Chapters</h4>
                    <div className="space-y-3">
                      {arc.episodes.map((episode, index) => {
                        const unlocked = isEpisodeUnlocked(arc, index)
                        const completed = isEpisodeCompleted(arc, index)
                        const isNext = index === nextEpisode && !completed

                        return (
                          <div
                            key={episode.id}
                            className={`p-4 rounded-lg border ${
                              completed
                                ? 'bg-green-900/20 border-green-800/50'
                                : unlocked
                                  ? isNext
                                    ? 'bg-amber-900/20 border-amber-700/50'
                                    : 'bg-slate-800/50 border-slate-700'
                                  : 'bg-slate-900/50 border-slate-800 opacity-50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                completed
                                  ? 'bg-green-600 text-white'
                                  : unlocked
                                    ? isNext
                                      ? 'bg-amber-600 text-white animate-pulse'
                                      : 'bg-purple-600 text-white'
                                    : 'bg-slate-700 text-slate-400'
                              }`}>
                                {completed ? '✓' : index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className={`font-medium ${completed ? 'text-green-400' : unlocked ? 'text-white' : 'text-slate-400'}`}>
                                    {episode.title}
                                  </h5>
                                  {isNext && (
                                    <span className="text-xs text-amber-400 animate-pulse">▶ Next Up</span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-400 mt-1">{episode.description}</p>
                                {unlocked && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-slate-500">
                                      {episode.questIds.length} quests
                                    </span>
                                    {!completed && (
                                      <button className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded transition-colors">
                                        Continue Story →
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Arc Rewards */}
                    <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <h5 className="text-sm font-medium text-slate-400 mb-2">Complete Arc Rewards</h5>
                      <div className="flex items-center gap-6">
                        <span className="text-green-400 font-bold">+{arc.rewards.xpBonus} XP</span>
                        <span className="text-amber-400 font-bold">+{arc.rewards.goldBonus} Gold</span>
                        {arc.rewards.badgeId && (
                          <span className="text-purple-400 font-bold">🏅 Special Badge</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {STORY_ARCS.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <div className="text-5xl mb-4">📖</div>
            <p>No storylines available yet. Check back soon!</p>
          </div>
        )}
      </main>
    </div>
  )
}
