import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../../contexts/GameContext'
import { XPBar } from './XPBar'

const NAV_ITEMS = [
  { to: '/', icon: '🏠', label: 'Tavern' },
  { to: '/worldmap', icon: '🗺️', label: 'Map' },
  { to: '/quests', icon: '📜', label: 'Quests' },
  { to: '/sidequests', icon: '⚔️', label: 'Side Quests' },
  { to: '/skills', icon: '🎯', label: 'Skills' },
  { to: '/leaderboard', icon: '🏆', label: 'Rank' },
  { to: '/character', icon: '👤', label: 'Hero' },
  { to: '/rewards', icon: '🎁', label: 'Rewards' },
]

export function HUD() {
  const { game, completedCount, totalQuests } = useGame()
  const { character } = game
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-xl">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Bar - Character Info */}
        <div className="flex items-center justify-between h-14">
          {/* Left - Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="text-xl">⚔️</span>
            <span className="font-bold text-lg hidden sm:inline">DevOpsQuest</span>
          </Link>

          {/* Center - XP Bar (desktop only) */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <XPBar compact />
          </div>

          {/* Right - Stats */}
          <div className="flex items-center gap-3">
            {/* Streak */}
            <div className="flex items-center gap-1" title="Day Streak">
              <span className={character.streakDays > 0 ? 'text-orange-400' : 'text-slate-500'}>
                {character.streakDays > 3 ? '🔥' : '📅'}
              </span>
              <span className="text-sm font-medium text-slate-300 hidden sm:inline">{character.streakDays}</span>
            </div>

            {/* Gold */}
            <div className="flex items-center gap-1" title="Gold">
              <span className="text-yellow-400">💰</span>
              <span className="text-sm font-medium text-slate-300 hidden sm:inline">{character.gold}</span>
            </div>

            {/* Avatar - Desktop */}
            <Link
              to="/character"
              className="hidden md:flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <span className="text-xl">{character.avatar}</span>
              <div className="text-left">
                <div className="text-xs text-slate-400">{character.title}</div>
                <div className="text-sm font-bold text-amber-400">Lv {character.level}</div>
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              aria-label="Toggle menu"
            >
              <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center justify-between py-2 border-t border-slate-700/50">
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
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-3 py-1 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded transition-all"
              >
                <span className="hidden lg:inline">{item.icon} {item.label}</span>
                <span className="lg:hidden">{item.icon}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile XP Bar */}
        <div className="md:hidden py-2 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-400">Progress:</span>
            <span className="text-slate-300">{completedCount}/{totalQuests} quests</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${(completedCount / totalQuests) * 100}%` }}
            />
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700/50 animate-slide-down">
            <nav className="grid grid-cols-3 gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs text-slate-300">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Character quick view on mobile */}
            <div className="mt-4 p-3 rounded-lg bg-slate-800 flex items-center gap-3">
              <span className="text-3xl">{character.avatar}</span>
              <div>
                <div className="text-sm text-slate-400">{character.title}</div>
                <div className="font-bold text-amber-400">Level {character.level}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-sm text-slate-400">🔥 {character.streakDays} streak</div>
                <div className="text-sm text-yellow-400">💰 {character.gold}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
