import { Link } from 'react-router-dom'
import { useGame } from '../../contexts/GameContext'
import { XPBar } from './XPBar'

export function HUD() {
  const { game, completedCount, totalQuests } = useGame()
  const { character } = game

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-xl">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Bar - Character Info */}
        <div className="flex items-center justify-between h-14">
          {/* Left - Logo */}
          <Link to="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors">
            <span className="text-xl">⚔️</span>
            <span className="font-bold text-lg hidden sm:inline">DevOpsQuest</span>
          </Link>

          {/* Center - XP Bar (compact) */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <XPBar compact />
          </div>

          {/* Right - Stats */}
          <div className="flex items-center gap-4">
            {/* Streak */}
            <div className="flex items-center gap-1" title="Day Streak">
              <span className={character.streakDays > 0 ? 'text-orange-400' : 'text-slate-500'}>
                {character.streakDays > 3 ? '🔥' : '📅'}
              </span>
              <span className="text-sm font-medium text-slate-300">{character.streakDays}</span>
            </div>

            {/* Gold */}
            <div className="flex items-center gap-1" title="Gold">
              <span className="text-yellow-400">💰</span>
              <span className="text-sm font-medium text-slate-300">{character.gold}</span>
            </div>

            {/* Avatar */}
            <Link
              to="/character"
              className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <span className="text-xl">{character.avatar}</span>
              <div className="hidden sm:block text-left">
                <div className="text-xs text-slate-400">{character.title}</div>
                <div className="text-sm font-bold text-amber-400">Lv {character.level}</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Bottom Bar - Progress & Nav */}
        <div className="flex items-center justify-between py-2 border-t border-slate-700/50">
          {/* Quest Progress */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Progress:</span>
            <div className="flex items-center gap-1">
              <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${(completedCount / totalQuests) * 100}%` }}
                />
              </div>
              <span className="text-slate-300">{completedCount}/{totalQuests}</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className="px-3 py-1 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded transition-all"
            >
              🏠 Tavern
            </Link>
            <Link
              to="/worldmap"
              className="px-3 py-1 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded transition-all"
            >
              🗺️ Map
            </Link>
            <Link
              to="/quests"
              className="px-3 py-1 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded transition-all"
            >
              📜 Quests
            </Link>
            <Link
              to="/leaderboard"
              className="px-3 py-1 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded transition-all"
            >
              🏆 Rank
            </Link>
            <Link
              to="/character"
              className="px-3 py-1 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded transition-all"
            >
              👤 Hero
            </Link>
            <Link
              to="/rewards"
              className="px-3 py-1 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded transition-all"
            >
              🎁 Rewards
            </Link>
          </nav>
        </div>

        {/* Mobile XP Bar */}
        <div className="md:hidden pb-2">
          <XPBar compact />
        </div>
      </div>
    </header>
  )
}
