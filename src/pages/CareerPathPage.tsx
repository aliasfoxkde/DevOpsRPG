import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { CAREER_PATHS, CATEGORY_COLORS, DIFFICULTY_CONFIG, type CareerPath } from '../data/careerPaths'

type FilterDemand = 'all' | 'high' | 'medium' | 'growing'

export default function CareerPathPage() {
  const { game } = useGame()
  const { completedQuests } = game

  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null)
  const [filterDemand, setFilterDemand] = useState<FilterDemand>('all')

  // Calculate player's progress in each technology
  const techProgress = useMemo(() => {
    const progress: Record<string, number> = {}
    for (const path of CAREER_PATHS) {
      for (const tech of path.technologies) {
        // Check how many quests for this technology the player has completed
        const techQuests = completedQuests.filter(q =>
          q.technologyId === tech.id || q.topicId.toLowerCase().includes(tech.id)
        )
        // For now, estimate progress based on completed quests (would need total quest count per tech)
        progress[tech.id] = Math.min(100, techQuests.length * 25)
      }
    }
    return progress
  }, [completedQuests])

  // Calculate overall path progress
  const getPathProgress = (path: CareerPath) => {
    const totalProgress = path.technologies.reduce((sum, tech) => {
      return sum + (techProgress[tech.id] || 0)
    }, 0)
    return Math.round(totalProgress / path.technologies.length)
  }

  // Filter paths by demand level
  const filteredPaths = useMemo(() => {
    if (filterDemand === 'all') return CAREER_PATHS
    return CAREER_PATHS.filter(p => p.demandLevel === filterDemand)
  }, [filterDemand])

  const DEMAND_COLORS = {
    high: 'bg-red-900/50 text-red-300 border-red-700/50',
    medium: 'bg-amber-900/50 text-amber-300 border-amber-700/50',
    growing: 'bg-green-900/50 text-green-300 border-green-700/50',
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
            <h1 className="text-xl font-bold text-white">🗺️ Career Paths</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Intro */}
        <div className="bg-gradient-to-r from-blue-900/30 via-slate-800 to-purple-900/30 rounded-xl border border-blue-600/50 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">🚀 Your DevOps Career Journey</h2>
          <p className="text-slate-400 mb-4">
            Explore different career paths in DevOps. Each path shows the technologies you need to master,
            estimated time to proficiency, and potential salary ranges.
          </p>

          {/* Demand filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterDemand('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterDemand === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All Paths
            </button>
            <button
              onClick={() => setFilterDemand('high')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterDemand === 'high'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              🔥 High Demand
            </button>
            <button
              onClick={() => setFilterDemand('growing')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterDemand === 'growing'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              📈 Growing
            </button>
          </div>
        </div>

        {/* Career Path Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPaths.map(path => {
            const progress = getPathProgress(path)

            return (
              <button
                key={path.id}
                onClick={() => setSelectedPath(path)}
                className="bg-slate-800/80 rounded-xl border border-slate-700 p-6 text-left hover:border-amber-600/50 hover:scale-[1.02] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{path.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">{path.name}</h3>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs border ${DEMAND_COLORS[path.demandLevel]}`}>
                        {path.demandLevel === 'high' ? '🔥 High Demand' :
                         path.demandLevel === 'growing' ? '📈 Growing' : '💼 Medium'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-400 text-sm mb-4">{path.description}</p>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-amber-400">{path.averageSalary}</p>
                    <p className="text-xs text-slate-500">Salary Range</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-400">{path.estimatedMonths}mo</p>
                    <p className="text-xs text-slate-500">Est. Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-400">{path.technologies.length}</p>
                    <p className="text-xs text-slate-500">Technologies</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Your Progress</span>
                    <span className="text-amber-400">{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {filteredPaths.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <div className="text-5xl mb-4">🗺️</div>
            <p>No career paths match your filter.</p>
          </div>
        )}
      </main>

      {/* Path Detail Modal */}
      {selectedPath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 border-b border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{selectedPath.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedPath.name}</h2>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs border ${DEMAND_COLORS[selectedPath.demandLevel]}`}>
                      {selectedPath.demandLevel === 'high' ? '🔥 High Demand' :
                       selectedPath.demandLevel === 'growing' ? '📈 Growing' : '💼 Medium'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPath(null)}
                  className="text-slate-400 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <p className="text-slate-400">{selectedPath.description}</p>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                  <p className="text-xl font-bold text-amber-400">{selectedPath.averageSalary}</p>
                  <p className="text-xs text-slate-500">Salary Range</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                  <p className="text-xl font-bold text-blue-400">{selectedPath.estimatedMonths} months</p>
                  <p className="text-xs text-slime-500">Time to Proficiency</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                  <p className="text-xl font-bold text-green-400">{getPathProgress(selectedPath)}%</p>
                  <p className="text-xs text-slate-500">Your Progress</p>
                </div>
              </div>

              {/* Prerequisites */}
              <div>
                <h3 className="text-lg font-bold text-white mb-2">📋 Prerequisites</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPath.prerequisites.map((prereq, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-700 rounded-lg text-sm text-slate-300">
                      {prereq}
                    </span>
                  ))}
                </div>
              </div>

              {/* Technology Skill Tree */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">🛠️ Technology Skill Tree</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPath.technologies.map(tech => {
                    const progress = techProgress[tech.id] || 0
                    const difficulty = DIFFICULTY_CONFIG[tech.difficulty]

                    return (
                      <div
                        key={tech.id}
                        className="bg-slate-900/50 rounded-lg p-3 border border-slate-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{tech.icon}</span>
                            <div>
                              <p className="font-medium text-white">{tech.name}</p>
                              <p
                                className="text-xs"
                                style={{ color: difficulty.color }}
                              >
                                {difficulty.label}
                              </p>
                            </div>
                          </div>
                          <span
                            className="px-2 py-0.5 rounded text-xs"
                            style={{
                              backgroundColor: `${CATEGORY_COLORS[tech.category]}30`,
                              color: CATEGORY_COLORS[tech.category],
                            }}
                          >
                            {tech.category.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: progress === 100 ? '#10b981' :
                                              progress > 0 ? '#f59e0b' : '#6b7280',
                            }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{progress}% complete</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Milestones */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">🏆 Milestones</h3>
                <div className="space-y-3">
                  {selectedPath.milestones.map(milestone => (
                    <div
                      key={milestone.id}
                      className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 flex items-start gap-3"
                    >
                      <span className="text-3xl">{milestone.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white">{milestone.name}</h4>
                          <span className="text-xs text-amber-400">
                            +{milestone.rewards.xpBonus} XP • +{milestone.rewards.goldBonus} 🪙
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{milestone.description}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          Requires: {milestone.requiredTechnologies.map(t => {
                            const tech = selectedPath.technologies.find(tc => tc.id === t)
                            return tech ? `${tech.icon} ${tech.name}` : t
                          }).join(', ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700">
              <button
                onClick={() => setSelectedPath(null)}
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
