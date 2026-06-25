import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

export interface GameEntry {
  id: string
  name: string
  icon: string
  category: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Mixed'
  players: string
  color: string
}

const ALL_GAMES: GameEntry[] = [
  // DevOps & Programming
  { id: 'devopsquest', name: 'DevOpsQuest', icon: '⚔️', category: 'DevOps', description: 'Master DevOps through quests', difficulty: 'Beginner', players: 'Solo', color: 'from-amber-600 to-orange-500' },
  { id: 'codecombat', name: 'Code Combat', icon: '🛡️', category: 'Programming', description: 'Learn Python/JavaScript through RPG battles', difficulty: 'Beginner', players: 'Solo', color: 'from-green-600 to-emerald-500' },
  { id: 'gitexplorer', name: 'Git Explorer', icon: '🌳', category: 'DevOps', description: 'Navigate version control challenges', difficulty: 'Beginner', players: 'Solo', color: 'from-orange-600 to-red-500' },
  { id: 'dockerdash', name: 'Docker Dash', icon: '🐳', category: 'DevOps', description: 'Containerize apps and race against time', difficulty: 'Intermediate', players: 'Solo', color: 'from-blue-600 to-cyan-500' },
  { id: 'k8skingdom', name: 'K8s Kingdom', icon: '👑', category: 'DevOps', description: 'Rule the Kubernetes realm', difficulty: 'Advanced', players: 'Solo', color: 'from-purple-600 to-indigo-500' },
  { id: 'pipelinepuzzle', name: 'Pipeline Puzzle', icon: '🔧', category: 'DevOps', description: 'Build CI/CD pipelines block by block', difficulty: 'Intermediate', players: 'Solo', color: 'from-cyan-600 to-teal-500' },

  // Math Games
  { id: 'numberstorm', name: 'Number Storm', icon: '🌀', category: 'Math', description: 'Race to solve arithmetic in stormy conditions', difficulty: 'Beginner', players: '1-4', color: 'from-blue-600 to-indigo-500' },
  { id: 'geomjam', name: 'Geom Jam', icon: '📐', category: 'Math', description: 'Shape matching and spatial reasoning', difficulty: 'Beginner', players: 'Solo', color: 'from-pink-600 to-rose-500' },
  { id: 'algebraassault', name: 'Algebra Assault', icon: '⚡', category: 'Math', description: 'Solve equations to defeat enemies', difficulty: 'Intermediate', players: 'Solo', color: 'from-yellow-600 to-amber-500' },
  { id: 'calcchallenge', name: 'Calculus Challenge', icon: '∞', category: 'Math', description: 'Derivatives and integrals under pressure', difficulty: 'Advanced', players: 'Solo', color: 'from-red-600 to-pink-500' },
  { id: 'statsquest', name: 'Stats Quest', icon: '📊', category: 'Math', description: 'Probability and statistics adventures', difficulty: 'Intermediate', players: 'Solo', color: 'from-green-600 to-teal-500' },
  { id: 'logicgrid', name: 'Logic Grid', icon: '🧩', category: 'Math', description: 'Solve logic puzzles with grids', difficulty: 'Intermediate', players: 'Solo', color: 'from-indigo-600 to-purple-500' },

  // Science Games
  { id: 'atomsmash', name: 'Atom Smash', icon: '⚛️', category: 'Science', description: 'Build molecules and explore chemistry', difficulty: 'Beginner', players: 'Solo', color: 'from-cyan-600 to-blue-500' },
  { id: 'physix', name: 'Physix Runner', icon: '🎯', category: 'Science', description: 'Physics-based platformer challenges', difficulty: 'Intermediate', players: 'Solo', color: 'from-purple-600 to-pink-500' },
  { id: 'bioquest', name: 'Bio Quest', icon: '🧬', category: 'Science', description: 'Journey through cells and DNA', difficulty: 'Intermediate', players: 'Solo', color: 'from-green-600 to-emerald-500' },
  { id: 'spacestrike', name: 'Space Strike', icon: '🚀', category: 'Science', description: 'Navigate orbital mechanics', difficulty: 'Advanced', players: 'Solo', color: 'from-indigo-600 to-violet-500' },
  { id: 'earthlab', name: 'Earth Lab', icon: '🌍', category: 'Science', description: 'Explore geology and ecosystems', difficulty: 'Beginner', players: 'Solo', color: 'from-amber-600 to-yellow-500' },

  // Reading & Language
  { id: 'wordwizard', name: 'Word Wizard', icon: '✨', category: 'Reading', description: 'Spelling bees and vocabulary battles', difficulty: 'Beginner', players: '1-4', color: 'from-violet-600 to-purple-500' },
  { id: 'storyforge', name: 'Story Forge', icon: '📖', category: 'Reading', description: 'Create stories with writing prompts', difficulty: 'Beginner', players: 'Solo', color: 'from-rose-600 to-pink-500' },
  { id: 'grammargrapple', name: 'Grammar Grapple', icon: '🥊', category: 'Reading', description: 'Fight grammar errors in the arena', difficulty: 'Intermediate', players: 'Solo', color: 'from-blue-600 to-cyan-500' },
  { id: 'speedread', name: 'Speed Read', icon: '⚡', category: 'Reading', description: 'Read fast, answer faster', difficulty: 'Intermediate', players: 'Solo', color: 'from-orange-600 to-amber-500' },

  // Robotics & Engineering
  { id: 'roborally', name: 'Robo Rally', icon: '🤖', category: 'Robotics', description: 'Program robots to complete courses', difficulty: 'Intermediate', players: '1-4', color: 'from-slate-600 to-gray-500' },
  { id: 'circuitsim', name: 'Circuit Sim', icon: '🔌', category: 'Robotics', description: 'Design and debug electronic circuits', difficulty: 'Advanced', players: 'Solo', color: 'from-yellow-600 to-green-500' },
  { id: 'bridgebuild', name: 'Bridge Build', icon: '🌉', category: 'Engineering', description: 'Build bridges and test physics', difficulty: 'Intermediate', players: 'Solo', color: 'from-amber-600 to-red-500' },

  // Trivia & Knowledge
  { id: 'triviatitans', name: 'Trivia Titans', icon: '🏅', category: 'Trivia', description: 'Compete in knowledge showdowns', difficulty: 'Mixed', players: '1-8', color: 'from-gold-600 to-yellow-500' },
  { id: 'historyhunt', name: 'History Hunt', icon: '🏛️', category: 'Trivia', description: 'Time-travel through historical events', difficulty: 'Mixed', players: 'Solo', color: 'from-amber-700 to-amber-500' },
  { id: 'sciexplorer', name: 'Science Explorer', icon: '🔬', category: 'Trivia', description: 'Discover science facts and phenomena', difficulty: 'Mixed', players: '1-4', color: 'from-teal-600 to-cyan-500' },
  { id: 'geographypulse', name: 'Geography Pulse', icon: '🌐', category: 'Trivia', description: 'Explore countries, capitals, and cultures', difficulty: 'Mixed', players: 'Solo', color: 'from-green-600 to-emerald-500' },

  // Puzzle Games
  { id: 'mazemaster', name: 'Maze Master', icon: '🌀', category: 'Puzzle', description: 'Navigate increasingly complex labyrinths', difficulty: 'Beginner', players: 'Solo', color: 'from-violet-600 to-indigo-500' },
  { id: 'patternpuzzle', name: 'Pattern Puzzle', icon: '🔮', category: 'Puzzle', description: 'Find sequences and predict next elements', difficulty: 'Intermediate', players: 'Solo', color: 'from-fuchsia-600 to-pink-500' },
  { id: 'crypticclimb', name: 'Cryptic Climb', icon: '⛰️', category: 'Puzzle', description: 'Solve riddles to climb the mountain', difficulty: 'Advanced', players: 'Solo', color: 'from-red-600 to-orange-500' },

  // Coming Soon
  { id: 'coming-soon-1', name: 'Quantum Quest', icon: '⚛️', category: 'Science', description: 'Coming soon...', difficulty: 'Expert', players: 'TBA', color: 'from-gray-600 to-gray-500' },
  { id: 'coming-soon-2', name: 'AI Trainer', icon: '🧠', category: 'AI', description: 'Coming soon...', difficulty: 'Advanced', players: 'TBA', color: 'from-purple-600 to-gray-500' },
  { id: 'coming-soon-3', name: 'Cyber Defense', icon: '🛡️', category: 'Security', description: 'Coming soon...', difficulty: 'Expert', players: 'Solo', color: 'from-red-700 to-gray-500' },
]

const CATEGORIES = ['All', 'DevOps', 'Math', 'Science', 'Reading', 'Robotics', 'Engineering', 'Trivia', 'Puzzle', 'AI', 'Security']
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert']

export default function GameLibraryPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [sortBy, setSortBy] = useState<'name' | 'category'>('name')

  const filteredGames = useMemo(() => {
    return ALL_GAMES.filter(game => {
      const matchesSearch = game.name.toLowerCase().includes(search.toLowerCase()) ||
                           game.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'All' || game.category === category
      const matchesDifficulty = difficulty === 'All' || game.difficulty === difficulty
      return matchesSearch && matchesCategory && matchesDifficulty
    }).sort((a, b) => sortBy === 'name' ? a.name.localeCompare(b.name) : a.category.localeCompare(b.category))
  }, [search, category, difficulty, sortBy])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">🎮 Game Library</h1>
          <p className="text-slate-400">Browse and discover all our learning games</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search games..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              >
                {DIFFICULTIES.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-4 mt-4">
            <span className="text-sm text-slate-400">Sort by:</span>
            <button
              onClick={() => setSortBy('name')}
              className={`px-3 py-1 rounded text-sm ${sortBy === 'name' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              Name
            </button>
            <button
              onClick={() => setSortBy('category')}
              className={`px-3 py-1 rounded text-sm ${sortBy === 'category' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              Category
            </button>
            <span className="text-sm text-slate-500 ml-auto">{filteredGames.length} games found</span>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden hover:border-amber-500/50 transition-all hover:shadow-lg hover:shadow-amber-500/10"
            >
              {/* Header */}
              <div className={`h-24 bg-gradient-to-br ${game.color} flex items-center justify-center relative`}>
                <span className="text-5xl">{game.icon}</span>
                {game.players === 'TBA' && (
                  <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Coming Soon</span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    game.category === 'DevOps' ? 'bg-amber-600/30 text-amber-400' :
                    game.category === 'Math' ? 'bg-blue-600/30 text-blue-400' :
                    game.category === 'Science' ? 'bg-green-600/30 text-green-400' :
                    game.category === 'Reading' ? 'bg-pink-600/30 text-pink-400' :
                    game.category === 'Robotics' ? 'bg-slate-600/30 text-slate-300' :
                    game.category === 'Trivia' ? 'bg-yellow-600/30 text-yellow-400' :
                    game.category === 'Puzzle' ? 'bg-purple-600/30 text-purple-400' :
                    'bg-slate-600/30 text-slate-400'
                  }`}>
                    {game.category}
                  </span>
                  <span className="text-xs text-slate-500">{game.players} players</span>
                </div>

                <h3 className="font-bold text-white mb-1">{game.name}</h3>
                <p className="text-sm text-slate-400 mb-3">{game.description}</p>

                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded ${
                    game.difficulty === 'Beginner' ? 'bg-green-600/30 text-green-400' :
                    game.difficulty === 'Intermediate' ? 'bg-yellow-600/30 text-yellow-400' :
                    game.difficulty === 'Advanced' ? 'bg-orange-600/30 text-orange-400' :
                    game.difficulty === 'Expert' ? 'bg-red-600/30 text-red-400' :
                    'bg-gray-600/30 text-gray-400'
                  }`}>
                    {game.difficulty}
                  </span>

                  {game.id === 'devopsquest' ? (
                    <Link
                      to="/"
                      className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                    >
                      Play Now →
                    </Link>
                  ) : game.players !== 'TBA' ? (
                    <span className="text-xs text-slate-500">Coming Soon</span>
                  ) : (
                    <span className="text-xs text-slate-600">TBA</span>
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
            <p className="text-slate-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
