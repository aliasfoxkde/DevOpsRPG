import { useEffect, useState, useMemo, useRef } from 'react'
import { useGame } from '../../contexts/GameContext'
import { realms, realmStories, allQuests } from '../../data/quests'
import { BADGES } from '../../data/badges'

interface RealmCompletionModalProps {
  realmId: string
  onClose: () => void
}

// Seeded random for deterministic particles
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

// Particle component with memoized deterministic particles
function Particles() {
  const [showParticles] = useState(true)

  const particles = useMemo(() => {
    const EMOJIS = ['🎉', '⭐', '✨', '🏆', '💫', '🎊', '🌟']
    return Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: seededRandom(i * 4 + 1) * 100,
      delay: seededRandom(i * 4 + 2) * 3,
      duration: 3 + seededRandom(i * 4 + 3) * 2,
      color: EMOJIS[Math.floor(seededRandom(i * 4 + 4) * 7)],
    }))
  }, [])

  if (!showParticles) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-particle-fall text-2xl"
          style={{
            left: `${p.x}%`,
            top: '-20px',
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

export function RealmCompletionModal({ realmId, onClose }: RealmCompletionModalProps) {
  const { game } = useGame()
  const [count, setCount] = useState(5)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const realm = realms[realmId]
  const realmStory = realmStories[realmId]
  const completedQuests = useMemo(() => {
    return game.completedQuests.filter(q => {
      const quest = allQuests.find((qq: { id: string }) => qq.id === q.questId)
      return quest?.realmId === realmId
    })
  }, [game.completedQuests, realmId])

  // Get badges earned for this realm
  const realmBadges = BADGES.filter(b => b.requirement.type === 'realm_complete' && b.requirement.value === Object.keys(realms).indexOf(realmId) + 1)

  useEffect(() => {
    // Start countdown
    timerRef.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [onClose])

  // Handle 'n' key for skip
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'n' || e.key === 'N' || e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!realm) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      {/* Particles background */}
      <div className="absolute inset-0 overflow-hidden">
        <Particles />
      </div>

      <div className="relative w-full max-w-lg bg-gradient-to-b from-amber-900 via-amber-950 to-slate-900 border-4 border-amber-500 rounded-2xl shadow-2xl overflow-hidden animate-pulse">
        {/* Glowing header */}
        <div className="relative bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 py-12 text-center">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_70%)]" />

          <div className="relative">
            <div className="text-7xl mb-4 animate-bounce">🏆</div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
              REALM COMPLETE!
            </h1>
            <h2 className="text-2xl font-bold text-amber-200">
              {realm.name}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Story text */}
          {realmStory && (
            <div className="text-center">
              <p className="text-slate-300 italic text-sm leading-relaxed">
                "{realmStory}"
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-amber-400">{completedQuests.length}</div>
                <div className="text-xs text-slate-400">Quests Conquered</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-400">
                  {game.character.xp - (game.completedQuests.length * 50)}
                </div>
                <div className="text-xs text-slate-400">Total XP Earned</div>
              </div>
            </div>
          </div>

          {/* Badges earned */}
          {realmBadges.length > 0 && (
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-3">🎖️ Badge Earned!</h3>
              <div className="flex justify-center gap-4">
                {realmBadges.map(badge => (
                  <div key={badge.id} className="p-3 bg-green-900/30 rounded-lg border border-green-500/50">
                    <div className="text-4xl mb-1">{badge.icon}</div>
                    <div className="text-sm font-bold text-green-400">{badge.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Big XP bonus */}
          <div className="text-center p-4 bg-gradient-to-r from-amber-900/50 via-amber-800/50 to-amber-900/50 rounded-xl border border-amber-500/50">
            <div className="text-5xl font-bold text-amber-400 mb-1">+500</div>
            <div className="text-amber-300">Realm Completion Bonus XP!</div>
          </div>

          {/* Next realm teaser */}
          {Object.keys(realms).indexOf(realmId) < Object.keys(realms).length - 1 && (
            <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-600">
              <p className="text-slate-400 text-sm">
                Next realm unlocks at level {Object.values(realms)[Object.keys(realms).indexOf(realmId) + 1]?.requiredLevel}
              </p>
            </div>
          )}

          {/* Continue button */}
          <button
            onClick={onClose}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl shadow-lg transform transition-all hover:scale-105 text-lg"
          >
            Continue to Next Realm ⚔️ ({count}s)
          </button>

          {/* Skip hint */}
          <div className="text-center text-xs text-slate-500">
            Press <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">N</kbd> or <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">ESC</kbd> to continue
          </div>
        </div>
      </div>

      <style>{`
        @keyframes particle-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-particle-fall {
          animation: particle-fall 4s linear forwards;
        }
      `}</style>
    </div>
  )
}
