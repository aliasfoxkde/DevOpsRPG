// Single source of truth for the mini-game roster. The hub menu, the game
// library and the home page all render from this table, and a round's payout
// is capped by the same numbers the cards advertise — the teaser can never
// drift from what the game actually pays.

export type MiniGameId = 'command' | 'memory' | 'math' | 'code' | 'quiz' | 'terminal' | 'incident'

/** Hero level required before any mini-game can be played. */
export const MINI_GAME_UNLOCK_LEVEL = 3

export interface MiniGameEntry {
  id: MiniGameId
  name: string
  icon: string
  description: string
  /** Maximum bonus XP a round at 100% accuracy can pay. */
  xpPotential: number
  /** Maximum bonus gold for the same round (kept at half the XP cap). */
  goldPotential: number
  /** Menu tile gradient, so every caller paints the tiles identically. */
  tileGradient: string
  /** Accent colour for the XP teaser line. */
  accent: string
}

export const MINI_GAMES: MiniGameEntry[] = [
  {
    id: 'command',
    name: 'Command Typer',
    icon: '⌨️',
    description: 'Type DevOps commands quickly and accurately',
    xpPotential: 50,
    goldPotential: 25,
    tileGradient: 'from-orange-900/30 to-red-900/30 border-orange-700/50 hover:border-orange-500',
    accent: 'text-orange-400',
  },
  {
    id: 'memory',
    name: 'Memory Match',
    icon: '🧠',
    description: 'Match DevOps icons and concepts',
    xpPotential: 50,
    goldPotential: 25,
    tileGradient: 'from-purple-900/30 to-pink-900/30 border-purple-700/50 hover:border-purple-500',
    accent: 'text-purple-400',
  },
  {
    id: 'math',
    name: 'Math Challenge',
    icon: '🔢',
    description: 'Solve DevOps calculation problems',
    xpPotential: 75,
    goldPotential: 38,
    tileGradient: 'from-cyan-900/30 to-blue-900/30 border-cyan-700/50 hover:border-cyan-500',
    accent: 'text-cyan-400',
  },
  {
    id: 'code',
    name: 'Code Puzzle',
    icon: '💻',
    description: 'Complete code snippets and find bugs',
    xpPotential: 50,
    goldPotential: 25,
    tileGradient: 'from-green-900/30 to-emerald-900/30 border-green-700/50 hover:border-green-500',
    accent: 'text-green-400',
  },
  {
    id: 'quiz',
    name: 'Quiz Dash',
    icon: '⚡',
    description: 'Rapid-fire DevOps quiz challenge!',
    xpPotential: 75,
    goldPotential: 38,
    tileGradient: 'from-red-900/30 to-orange-900/30 border-red-700/50 hover:border-red-500',
    accent: 'text-red-400',
  },
  {
    id: 'terminal',
    name: 'Terminal Simulator',
    icon: '💻',
    description: 'Type real DevOps commands',
    xpPotential: 100,
    goldPotential: 50,
    tileGradient: 'from-slate-900/30 to-slate-800/30 border-slate-600/50 hover:border-slate-400',
    accent: 'text-slate-400',
  },
  {
    id: 'incident',
    name: 'Incident Response',
    icon: '🚨',
    description: 'Handle production emergencies',
    xpPotential: 350,
    goldPotential: 175,
    tileGradient: 'from-red-900/30 to-orange-900/30 border-red-700/50 hover:border-red-500',
    accent: 'text-red-400',
  },
]

/** The catalog entry for a game id — guaranteed to exist for hub ids. */
export function miniGameById(id: MiniGameId): MiniGameEntry {
  const entry = MINI_GAMES.find((game) => game.id === id)
  if (!entry) throw new Error(`Unknown mini-game id: ${id}`)
  return entry
}
