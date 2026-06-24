import { useEffect } from 'react'
import { useGame } from '../../contexts/GameContext'
import { XPBar } from './XPBar'

export function VictoryModal() {
  const { game, dismissVictory } = useGame()

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

  const { xp, levelUp, newLevel } = game.lastVictory

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gradient-to-b from-amber-900/90 to-amber-950/90 border-2 border-amber-500 rounded-xl shadow-2xl overflow-hidden animate-[victory-glow_0.5s_ease-out]">
        {/* Victory Header */}
        <div className="relative bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 py-6 text-center">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2IiBoZWlnaHQ9IjYiPgo8cmVjdCB3aWR0aD0iNiIgaGVpZ2h0PSI2IiBmaWxsPSIjZmZmIj8+CjwhLSkgPCEtLSBzaGFwZXN0eWxlczovIGJhc2gta2V5ZnJhbWVzK3N2ZyosIDpzdmcgKi8gdmlld0JveD0iMCAwIDYgNiIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSIgZGlzcGxheT0iaW5saW5lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8bGluZSB4MT0iMCIgeTE9IjAiIHgyPSI2IiB5Mj0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiPgo8bGluZSB4MT0iNiIgeTE9IjAiIHgyPSIwLjc1IiB5Mj0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiPgo8bGluZSB4MT0iMyIgeTE9IjAiIHgyPSIzLjI1IiB5Mj0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiPgo8L3N2Zz4jKSkgZmlsdGVyPSJ1cmwoI2Jhc2gta2V5ZnJhbWVzK3N2ZyopIiBvcGFjaXR5PSIwLjM1IiBzdHlsZT0iZGlzcGxheTppbmxpbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjwhLS0+CjxnIGZvcm1hdD0idmlzaWJsZSIgaWQ9ImEiIHN0eWxlPSJkaXNwbGF5OmlubGluZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGxpbmUgeDE9IjAiIHkxPSIwIiB4Mj0iNiIgeTI9IjYiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSI+PC9saW5lPgo8bGluZSB4MT0iNiIgeTE9IjAiIHgyPSIwLjc1IiB5Mj0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+CjxsaW5lIHgxPSIzIiB5MT0iMCIgeDI9IjMuMjUiIHkyPSI2IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEiPjwvbGluZT4KPC9nPgo8IS0tPjwvc3ZnPg==')] opacity-20" />
          <div className="relative">
            <div className="text-5xl mb-2">⚔️</div>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              {levelUp ? 'LEVEL UP!' : 'QUEST COMPLETE!'}
            </h2>
          </div>
        </div>

        {/* Victory Content */}
        <div className="p-6 space-y-6">
          {/* XP Gained */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-900/50 rounded-lg border border-amber-600/50">
              <span className="text-2xl">✨</span>
              <span className="text-3xl font-bold text-amber-400">+{xp} XP</span>
            </div>
          </div>

          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-amber-200">Level Progress</span>
              <span className="text-amber-400">Level {game.character.level}</span>
            </div>
            <XPBar />
          </div>

          {/* Level Up Message */}
          {levelUp && (
            <div className="text-center p-4 bg-gradient-to-r from-purple-900/50 via-purple-800/50 to-purple-900/50 rounded-lg border border-purple-500/50">
              <div className="text-purple-300 text-sm mb-1">NEW TITLE EARNED</div>
              <div className="text-2xl font-bold text-purple-200">
                {game.character.title}
              </div>
              <div className="text-purple-400 text-sm mt-1">
                Level {newLevel}
              </div>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={dismissVictory}
            className="w-full py-3 px-6 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105 active:scale-95"
          >
            Continue Quest ⚔️
          </button>
        </div>
      </div>

      <style>{`
        @keyframes victory-glow {
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
      `}</style>
    </div>
  )
}
