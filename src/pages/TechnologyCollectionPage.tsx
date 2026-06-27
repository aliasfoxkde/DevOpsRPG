import { Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { TECHNOLOGY_COLLECTION, RARITY_COLORS, CATEGORY_NAMES, type TechnologyCard } from '../data/technologyCollection'
import { allQuests } from '../data/quests'

export default function TechnologyCollectionPage() {
  const { game } = useGame()

  // Calculate completion for each technology based on actual quests
  const getTechCompletion = (techId: string): { completed: number; total: number; percentage: number } => {
    const techQuests = allQuests.filter(q => q.technologyId.toLowerCase() === techId.toLowerCase())
    const completed = game.completedQuests.filter(cq =>
      techQuests.some(tq => tq.id === cq.questId)
    ).length
    const total = techQuests.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return { completed, total, percentage }
  }

  // Get collection state for each card
  const getCardState = (card: TechnologyCard): 'locked' | 'in_progress' | 'completed' => {
    const { completed } = getTechCompletion(card.id)
    if (completed === 0) return 'locked'
    if (completed >= card.requiredQuests) return 'completed'
    return 'in_progress'
  }

  // Group cards by category
  const cardsByCategory = TECHNOLOGY_COLLECTION.reduce((acc, card) => {
    if (!acc[card.category]) acc[card.category] = []
    acc[card.category].push(card)
    return acc
  }, {} as Record<string, TechnologyCard[]>)

  // Stats
  const totalCards = TECHNOLOGY_COLLECTION.length
  const completedCards = TECHNOLOGY_COLLECTION.filter(card => getCardState(card) === 'completed').length
  const inProgressCards = TECHNOLOGY_COLLECTION.filter(card => getCardState(card) === 'in_progress').length

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-amber-400 hover:text-amber-300 transition-colors text-sm mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-400 mb-2">📚 Technology Collection</h1>
          <p className="text-slate-400">Complete quests to unlock technology cards and build your collection!</p>
        </div>

        {/* Stats Bar */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-4 mb-8">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-3xl font-bold text-amber-400">{completedCards}</div>
              <div className="text-sm text-slate-400">Unlocked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">{inProgressCards}</div>
              <div className="text-sm text-slate-400">In Progress</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-400">{totalCards - completedCards - inProgressCards}</div>
              <div className="text-sm text-slate-400">Locked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">{Math.round((completedCards / totalCards) * 100)}%</div>
              <div className="text-sm text-slate-400">Complete</div>
            </div>
          </div>
        </div>

        {/* Collection by Category */}
        <div className="space-y-8">
          {Object.entries(cardsByCategory).map(([category, cards]) => (
            <div key={category} className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                <span>{category === 'fundamentals' ? '📖' :
                       category === 'containers' ? '🐳' :
                       category === 'cloud' ? '☁️' :
                       category === 'orchestration' ? '☸️' :
                       category === 'infrastructure' ? '🏗️' :
                       category === 'security' ? '🔒' :
                       category === 'programming' ? '💻' :
                       category === 'databases' ? '🗄️' : '📚'}</span>
                <span>{CATEGORY_NAMES[category as TechnologyCard['category']] || category}</span>
                <span className="text-sm text-slate-500 ml-auto">
                  {cards.filter(c => getCardState(c) === 'completed').length}/{cards.length}
                </span>
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {cards.map(card => {
                  const state = getCardState(card)
                  const { completed, total, percentage } = getTechCompletion(card.id)
                  const rarityColor = RARITY_COLORS[card.rarity]

                  return (
                    <div
                      key={card.id}
                      className={`relative rounded-lg border p-4 transition-all ${
                        state === 'completed'
                          ? 'bg-gradient-to-br from-amber-900/30 to-slate-800 border-amber-500/50'
                          : state === 'in_progress'
                          ? 'bg-gradient-to-br from-blue-900/30 to-slate-800 border-blue-500/50'
                          : 'bg-slate-800/50 border-slate-700/50 opacity-60'
                      }`}
                    >
                      {/* Lock overlay for locked cards */}
                      {state === 'locked' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-lg z-10">
                          <span className="text-3xl">🔒</span>
                        </div>
                      )}

                      {/* Card Header */}
                      <div className="text-center mb-2">
                        <div className={`text-4xl mb-2 ${state === 'locked' ? 'grayscale opacity-50' : ''}`}>
                          {card.icon}
                        </div>
                        <h3 className={`font-bold text-sm ${state === 'completed' ? 'text-amber-400' : 'text-slate-200'}`}>
                          {card.name}
                        </h3>
                        <span
                          className="text-xs px-2 py-0.5 rounded uppercase"
                          style={{
                            backgroundColor: `${rarityColor}20`,
                            color: rarityColor
                          }}
                        >
                          {card.rarity}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Progress</span>
                          <span>{completed}/{card.requiredQuests} quests</span>
                        </div>
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              state === 'completed' ? 'bg-amber-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(100, percentage)}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="mt-2 flex justify-between text-xs text-slate-500">
                        <span>{total} total quests</span>
                        {state === 'completed' && <span className="text-green-400">✓ Unlocked</span>}
                      </div>

                      {/* Hover tooltip with flavor */}
                      {state !== 'locked' && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                          <p className="italic">"{card.flavorText}"</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
