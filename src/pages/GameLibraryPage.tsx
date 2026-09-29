import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import {
  MINI_GAMES,
  MINI_GAME_UNLOCK_LEVEL,
  type MiniGameId,
} from '../components/minigames/gameCatalog'
import { MiniGameHub } from '../components/minigames/MiniGameHub'

type SortKey = 'name' | 'reward'

export default function GameLibraryPage() {
  const { game } = useGame()
  const { character } = game
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('name')
  const [activeGame, setActiveGame] = useState<MiniGameId | null>(null)

  const isUnlocked = character.level >= MINI_GAME_UNLOCK_LEVEL

  const filteredGames = useMemo(() => {
    const query = search.trim().toLowerCase()
    return MINI_GAMES.filter(
      (miniGame) =>
        query === '' ||
        miniGame.name.toLowerCase().includes(query) ||
        miniGame.description.toLowerCase().includes(query),
    ).sort((a, b) =>
      sortBy === 'name' ? a.name.localeCompare(b.name) : b.xpPotential - a.xpPotential,
    )
  }, [search, sortBy])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">🎮 Game Library</h1>
          <p className="text-slate-400">
            The mini-games inside DevOpsQuest — every one playable today, each paying the bonus XP
            it advertises.
          </p>
        </div>

        {/* Search & Sort */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="game-search" className="block text-sm text-slate-400 mb-1">
                Search
              </label>
              <input
                id="game-search"
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                }}
                placeholder="Search games..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <span className="block text-sm text-slate-400 mb-1">Sort by</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSortBy('name')
                  }}
                  aria-pressed={sortBy === 'name'}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    sortBy === 'name'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  Name
                </button>
                <button
                  onClick={() => {
                    setSortBy('reward')
                  }}
                  aria-pressed={sortBy === 'reward'}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    sortBy === 'reward'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  Top Reward
                </button>
                <span className="text-sm text-slate-500 ml-auto">
                  {filteredGames.length} of {MINI_GAMES.length} games
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGames.map((miniGame) => (
            <div
              key={miniGame.id}
              className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden hover:border-amber-500/50 transition-all hover:shadow-lg hover:shadow-amber-500/10"
            >
              <div className="h-24 bg-gradient-to-br from-slate-700/60 to-slate-800 flex items-center justify-center relative">
                <span className="text-5xl">{miniGame.icon}</span>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-white mb-1">{miniGame.name}</h3>
                <p className="text-sm text-slate-400 mb-3">{miniGame.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-400">+{miniGame.xpPotential} XP potential</span>
                  {isUnlocked ? (
                    <button
                      onClick={() => {
                        setActiveGame(miniGame.id)
                      }}
                      aria-label={`Play ${miniGame.name}`}
                      className="text-xs font-medium text-amber-400 hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded px-1"
                    >
                      ▶ Play
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">
                      🔒 Level {MINI_GAME_UNLOCK_LEVEL}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredGames.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-bold text-white mb-2">No games found</h3>
            <p className="text-slate-400">Try adjusting your search</p>
          </div>
        )}

        {/* The campaign itself is the biggest game in the library */}
        <div className="mt-8 bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 rounded-xl border border-amber-600/50 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-5xl">⚔️</span>
              <div>
                <h3 className="text-lg font-bold text-white">DevOpsQuest Campaign</h3>
                <p className="text-slate-400 text-sm">
                  Quests, quizzes and the realm ladder — the main game this library lives inside.
                </p>
              </div>
            </div>
            <Link
              to="/"
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-lg shadow-lg transition-all hover:scale-105"
            >
              Continue Campaign →
            </Link>
          </div>
        </div>
      </div>

      {/* The hub renders the actual game, opened straight onto the pick */}
      {activeGame && (
        <MiniGameHub
          onClose={() => {
            setActiveGame(null)
          }}
          initialGame={activeGame}
        />
      )}
    </div>
  )
}
