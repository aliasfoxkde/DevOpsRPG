import { Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { CERTIFICATIONS, DIFFICULTY_COLORS, DIFFICULTY_LABELS, type Certification } from '../data/certifications'
import { allQuests, type Quest } from '../data/quests'

export default function CertificationsPage() {
  const { game } = useGame()

  // Check if certification requirements are met
  const checkRequirements = (cert: Certification): {
    met: boolean
    levelMet: boolean
    questMet: boolean
    techsMet: boolean
  } => {
    const levelMet = game.character.level >= cert.level
    const questMet = game.completedQuests.length >= cert.requiredQuests

    // Check technology completion
    const techProgress: Record<string, { completed: number; total: number }> = {}
    for (const techId of cert.requiredTechnologies) {
      const techQuests = allQuests.filter((q: Quest) => q.technologyId.toLowerCase() === techId.toLowerCase())
      const completed = game.completedQuests.filter(cq =>
        techQuests.some((tq: Quest) => tq.id === cq.questId)
      ).length
      techProgress[techId] = { completed, total: techQuests.length }
    }
    const techsMet = cert.requiredTechnologies.every(
      techId => (techProgress[techId]?.completed || 0) >= 3
    )

    return {
      met: levelMet && questMet && techsMet,
      levelMet,
      questMet,
      techsMet,
    }
  }

  // Get certification state
  const getCertState = (cert: Certification): 'locked' | 'available' | 'earned' => {
    // Check if already earned (has the badge)
    const hasBadge = game.badges.some(b => b.id === cert.badgeId && b.unlockedAt)
    if (hasBadge) return 'earned'

    // Check if requirements are met
    const reqs = checkRequirements(cert)
    if (reqs.met) return 'available'

    return 'locked'
  }

  // Group by difficulty
  const byDifficulty = CERTIFICATIONS.reduce((acc, cert) => {
    if (!acc[cert.difficulty]) acc[cert.difficulty] = []
    acc[cert.difficulty].push(cert)
    return acc
  }, {} as Record<string, Certification[]>)

  // Stats
  const earned = CERTIFICATIONS.filter(c => getCertState(c) === 'earned').length
  const available = CERTIFICATIONS.filter(c => getCertState(c) === 'available').length

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-amber-400 hover:text-amber-300 transition-colors text-sm mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-400 mb-2">🏆 Certifications</h1>
          <p className="text-slate-400">Earn certifications as proof of your DevOps expertise!</p>
        </div>

        {/* Stats Bar */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-4 mb-8">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-3xl font-bold text-amber-400">{earned}</div>
              <div className="text-sm text-slate-400">Earned</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">{available}</div>
              <div className="text-sm text-slate-400">Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-400">{CERTIFICATIONS.length - earned - available}</div>
              <div className="text-sm text-slate-400">Locked</div>
            </div>
          </div>
        </div>

        {/* Certifications by Difficulty */}
        <div className="space-y-8">
          {(['foundation', 'associate', 'professional', 'expert'] as const).map(diff => {
            const certs = byDifficulty[diff] || []
            if (certs.length === 0) return null

            return (
              <div key={diff} className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                <h2
                  className="text-xl font-bold mb-4 flex items-center gap-2"
                  style={{ color: DIFFICULTY_COLORS[diff] }}
                >
                  <span className="text-2xl">
                    {diff === 'foundation' ? '🌱' :
                     diff === 'associate' ? '⚡' :
                     diff === 'professional' ? '🔥' : '👑'}
                  </span>
                  <span>{DIFFICULTY_LABELS[diff]}</span>
                  <span className="text-sm text-slate-500 ml-auto">
                    {certs.filter(c => getCertState(c) === 'earned').length}/{certs.length}
                  </span>
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certs.map(cert => {
                    const state = getCertState(cert)
                    const reqs = checkRequirements(cert)

                    return (
                      <div
                        key={cert.id}
                        className={`rounded-lg border p-4 transition-all ${
                          state === 'earned'
                            ? 'bg-gradient-to-br from-amber-900/30 to-slate-800 border-amber-500/50'
                            : state === 'available'
                            ? 'bg-gradient-to-br from-green-900/30 to-slate-800 border-green-500/50'
                            : 'bg-slate-800/50 border-slate-700/50'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-3">
                          <span className={`text-3xl ${state === 'locked' ? 'grayscale opacity-50' : ''}`}>
                            {cert.icon}
                          </span>
                          <div className="flex-1">
                            <h3 className={`font-bold ${state === 'earned' ? 'text-amber-400' : 'text-slate-200'}`}>
                              {cert.fullName}
                            </h3>
                            <p className="text-xs text-slate-400">{cert.name}</p>
                          </div>
                          {state === 'earned' && (
                            <span className="text-xl">✅</span>
                          )}
                          {state === 'available' && (
                            <span className="text-xl">⭐</span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-slate-400 mb-3">{cert.description}</p>

                        {/* Requirements */}
                        <div className="space-y-1 text-xs mb-3">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Level:</span>
                            <span className={reqs.levelMet ? 'text-green-400' : 'text-red-400'}>
                              Lv {cert.level} {reqs.levelMet ? '✓' : '✗'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Quests:</span>
                            <span className={reqs.questMet ? 'text-green-400' : 'text-red-400'}>
                              {game.completedQuests.length}/{cert.requiredQuests} {reqs.questMet ? '✓' : '✗'}
                            </span>
                          </div>
                          {cert.requiredTechnologies.length > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Tech:</span>
                              <span className={reqs.techsMet ? 'text-green-400' : 'text-red-400'}>
                                {cert.requiredTechnologies.join(', ')} {reqs.techsMet ? '✓' : '✗'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Rewards */}
                        <div className="flex gap-2 text-xs mb-3">
                          <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded">
                            +{cert.xpReward} XP
                          </span>
                          <span className="px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded">
                            +{cert.goldReward} Gold
                          </span>
                        </div>

                        {/* Flavor text */}
                        <p className="text-xs italic text-slate-500">
                          "{cert.flavorText}"
                        </p>

                        {/* State indicator */}
                        {state === 'locked' && (
                          <div className="mt-3 text-center">
                            <span className="text-xs text-slate-500">Complete requirements to unlock</span>
                          </div>
                        )}
                        {state === 'available' && (
                          <div className="mt-3 text-center">
                            <span className="text-sm text-green-400 font-medium">🎉 Available to claim!</span>
                          </div>
                        )}
                        {state === 'earned' && (
                          <div className="mt-3 text-center">
                            <span className="text-sm text-amber-400 font-medium">✓ Certification Earned!</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
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
