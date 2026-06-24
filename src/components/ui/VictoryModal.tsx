import { useEffect, useState } from 'react'
import { useGame } from '../../contexts/GameContext'
import { XPBar } from './XPBar'
import { RARITY_COLORS } from '../../data/badges'

export function VictoryModal() {
  const { game, dismissVictory } = useGame()
  const [showParticles, setShowParticles] = useState(false)

  useEffect(() => {
    if (game.showVictory && game.lastVictory) {
      setShowParticles(true)
      setTimeout(() => setShowParticles(false), 3000)
    }
  }, [game.showVictory, game.lastVictory])

  // Handle 'n' key for continue
  useEffect(() => {
    const handleNext = () => {
      if (game.showVictory) {
        dismissVictory()
      }
    }
    window.addEventListener('game:next', handleNext)
    return () => window.removeEventListener('game:next', handleNext)
  }, [game.showVictory, dismissVictory])

  if (!game.showVictory || !game.lastVictory) return null

  const { xp, levelUp, newLevel, milestone, badge } = game.lastVictory

  // Particle effect component
  const Particles = () => {
    if (!showParticles) return null

    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      size: 4 + Math.random() * 8,
      color: ['✨', '⭐', '💫', '🌟', '🎉'][Math.floor(Math.random() * 5)],
    }))

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute animate-float-up text-xl"
            style={{
              left: `${p.x}%`,
              bottom: '-20px',
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          >
            {p.color}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      {/* Particles background */}
      <div className="absolute inset-0 overflow-hidden">
        <Particles />
      </div>

      <div className="relative w-full max-w-md bg-gradient-to-b from-amber-900/95 to-amber-950/95 border-2 border-amber-500 rounded-xl shadow-2xl overflow-hidden animate-[victory-scale_0.5s_ease-out]">
        {/* Victory Header */}
        <div className="relative bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 py-8 text-center">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2IiBoZWlnaHQ9IjYiPgo8cmVjdCB3aWR0aD0iNiIgaGVpZ2h0PSI2IiBmaWxsPSIjZmZmIj8+CjwhLSkgPCEtLSBzaGFwZXN0eWxlczovIGJhc2gta2V5ZnJhbWVzK3N2ZyosIDpzdmcgKi8gdmlld0JveD0iMCAwIDYgNiIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSIgZGlzcGxheT0iaW5saW5lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8bGluZSB4MT0iMCIgeTE9IjAiIHgyPSI2IiB5Mj0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiPgo8bGluZSB4MT0iNiIgeTE9IjAiIHgyPSIwLjc1IiB5Mj0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiPgo8bGluZSB4MT0iMyIgeTE9IjAiIHgyPSIzLjI1IiB5Mj0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiPgo8L3N2Zz4jKSkgZmlsdGVyPSJ1cmwoI2Jhc2gta2V5ZnJhbWVzK3N2ZyopIiBvcGFjaXR5PSIwLjM1IiBzdHlsZT0iZGlzcGxheTppbmxpbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjwhLS0+CjxnIGZvcm1hdD0idmlzaWJsZSIgaWQ9ImEiIHN0eWxlPSJkaXNwbGF5OmlubGluZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGxpbmUgeDE9IjAiIHkxPSIwIiB4Mj0iNiIgeTI9IjYiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSI+PC9saW5lPgo8bGluZSB4MT0iNiIgeTE9IjAiIHgyPSIwLjc1IiB5Mj0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+CjxsaW5lIHgxPSIzIiB5MT0iMCIgeDI9IjMuMjUiIHkyPSI2IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEiPjwvbGluZT4KPC9nPgo8IS0tPjwvc3ZnPg==')] opacity-30" />

          {/* Animated stars */}
          <div className="absolute top-2 left-4 text-2xl animate-pulse">⭐</div>
          <div className="absolute top-4 right-6 text-xl animate-pulse" style={{ animationDelay: '0.5s' }}>✨</div>
          <div className="absolute bottom-2 left-8 text-xl animate-pulse" style={{ animationDelay: '1s' }}>💫</div>

          <div className="relative">
            <div className="text-6xl mb-3 animate-bounce">⚔️</div>
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">
              {levelUp ? '🎉 LEVEL UP! 🎉' : 'QUEST COMPLETE!'}
            </h2>
          </div>
        </div>

        {/* Victory Content */}
        <div className="p-6 space-y-5">
          {/* XP Gained - Big and prominent */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-amber-900/60 rounded-xl border-2 border-amber-500/50 shadow-lg">
              <span className="text-4xl">✨</span>
              <div>
                <div className="text-sm text-amber-300">XP Earned</div>
                <div className="text-4xl font-bold text-amber-400">+{xp}</div>
              </div>
            </div>
          </div>

          {/* Milestone unlocked message */}
          {milestone && (
            <div className="text-center p-3 bg-gradient-to-r from-purple-900/50 via-purple-800/50 to-purple-900/50 rounded-lg border border-purple-500/50 animate-pulse">
              <div className="text-purple-300 text-sm mb-1">🏆 MILESTONE UNLOCKED</div>
              <div className="text-xl font-bold text-purple-200">
                {milestone.icon} {milestone.title}
              </div>
              <div className="text-purple-400 text-sm mt-1">
                +{milestone.xpBonus} XP Bonus!
              </div>
            </div>
          )}

          {/* Badge unlocked message */}
          {badge && (
            <div className="text-center p-3 bg-gradient-to-r from-green-900/50 via-green-800/50 to-green-900/50 rounded-lg border border-green-500/50 animate-pulse">
              <div className="text-green-300 text-sm mb-1">🎖️ BADGE EARNED</div>
              <div className="text-2xl">{badge.icon}</div>
              <div className={`text-lg font-bold ${RARITY_COLORS[badge.rarity].split(' ')[0]}`}>
                {badge.name}
              </div>
              <div className="text-green-400 text-sm">
                +{badge.xpReward} XP, +{badge.goldReward} Gold
              </div>
            </div>
          )}

          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-amber-200">Level Progress</span>
              <span className="text-amber-400 font-medium">Level {game.character.level}</span>
            </div>
            <XPBar />
            <div className="text-center text-xs text-slate-400">
              {game.character.xpToNextLevel - game.character.xp} XP to next level
            </div>
          </div>

          {/* Level Up Message */}
          {levelUp && (
            <div className="text-center p-4 bg-gradient-to-r from-blue-900/50 via-blue-800/50 to-blue-900/50 rounded-lg border border-blue-500/50">
              <div className="text-blue-300 text-sm mb-1">⭐ NEW TITLE EARNED</div>
              <div className="text-2xl font-bold text-blue-200">
                {game.character.title}
              </div>
              <div className="text-blue-400 text-sm mt-1">
                Welcome to Level {newLevel}!
              </div>
            </div>
          )}

          {/* Encouragement message */}
          <div className="text-center text-sm text-slate-400 italic">
            {game.completedQuests.length === 1
              ? "Great start! Keep going, hero! 🚀"
              : game.completedQuests.length < 10
              ? "You're finding your stride! 💪"
              : game.completedQuests.length < 50
              ? "Incredible progress! Keep it up! ⭐"
              : "You're on fire! 🔥"}
          </div>

          {/* Continue Button */}
          <button
            onClick={dismissVictory}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105 active:scale-95 text-lg"
          >
            Continue Quest ⚔️ (Press N)
          </button>

          {/* Hint for keyboard shortcut */}
          <div className="text-center text-xs text-slate-500">
            Press <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">N</kbd> to continue quickly
          </div>
        </div>
      </div>

      <style>{`
        @keyframes victory-scale {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes float-up {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up 3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
