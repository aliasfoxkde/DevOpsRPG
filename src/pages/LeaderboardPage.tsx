import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { realms } from '../data/quests'
import { XP_PER_LEVEL } from '../utils/gameUtils'

// Realm ladder in unlock order — the only leaderboard a fully client-side
// game can state without inventing rivals: how far the hero has climbed
// through the realms, and the personal records the save actually holds.
const REALM_LADDER = Object.values(realms).sort((a, b) => a.requiredLevel - b.requiredLevel)

interface RecordTile {
  icon: string
  label: string
  value: string
}

export default function LeaderboardPage() {
  const { game } = useGame()
  const { character, completedQuests, badges, completedTopics, stats } = game

  const xpToNext = character.xpToNextLevel
  const nextLevel = character.level + 1

  const unlockedBadges = useMemo(
    () => badges.filter((badge) => badge.unlockedAt).length,
    [badges],
  )
  const masteredTechs = useMemo(
    () => Object.values(game.skillXp).filter((xp) => xp > 0).length,
    [game.skillXp],
  )
  const miniGameRounds =
    stats.minigameCount + stats.typerCount + stats.memoryCount + stats.mathCount

  const records: RecordTile[] = [
    { icon: '⚔️', label: 'Quests Completed', value: String(completedQuests.length) },
    { icon: '📖', label: 'Topics Learned', value: String(completedTopics.length) },
    { icon: '🏅', label: 'Badges Earned', value: `${unlockedBadges} / ${badges.length}` },
    { icon: '🧠', label: 'Technologies Trained', value: String(masteredTechs) },
    {
      icon: '⚡',
      label: 'Fastest Quest',
      // The fresh-save sentinel is Infinity, which is not a record
      value:
        Number.isFinite(stats.fastestQuestTime) && stats.fastestQuestTime > 0
          ? `${stats.fastestQuestTime}s`
          : '—',
    },
    { icon: '🎯', label: 'Perfect Quizzes', value: String(stats.quizPerfectCount) },
    { icon: '🎮', label: 'Mini-game Rounds', value: String(miniGameRounds) },
    {
      icon: '⏱️',
      label: 'Best Daily Dash',
      value: game.dailyDash.bestTime !== null ? `${game.dailyDash.bestTime}s` : '—',
    },
    { icon: '🔥', label: 'Current Streak', value: `${character.streakDays} days` },
    { icon: '🥊', label: 'Sparring Wins', value: String(game.pvpStats.wins) },
    { icon: '✨', label: 'Prestige Level', value: String(game.prestigeLevel) },
    { icon: '🪙', label: 'Gold Held', value: character.gold.toLocaleString() },
  ]

  // The ladder position: highest realm the level requirement already allows.
  const currentRealm = [...REALM_LADDER].reverse().find((r) => character.level >= r.requiredLevel)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              ← Home
            </Link>
            <h1 className="text-xl font-bold text-white">🏆 Leaderboard</h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <p className="text-slate-400 text-center mb-6 text-sm">
          DevOpsQuest runs entirely in your browser, so the only standings that exist are your
          own: the realm ladder below is where every hero&apos;s climb is measured.
        </p>

        {/* Player Rank Card */}
        <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 rounded-xl border border-amber-600/50 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center text-3xl font-bold text-white">
                {character.level}
              </div>
              <div>
                <p className="text-amber-400 font-bold text-lg">{character.name}</p>
                <p className="text-slate-400 text-sm">
                  Level {character.level} {character.class}
                </p>
                {currentRealm && (
                  <p className="text-slate-500 text-xs">
                    {currentRealm.icon} {currentRealm.name}
                  </p>
                )}
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-slate-400 text-sm">Level {nextLevel} in</p>
              <p className="text-2xl font-bold text-white">
                {Math.max(0, xpToNext - character.xp).toLocaleString()} XP
              </p>
              <div
                className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden mt-2"
                role="progressbar"
                aria-label={`Progress to level ${nextLevel}`}
                aria-valuemin={0}
                aria-valuemax={XP_PER_LEVEL}
                aria-valuenow={Math.max(0, character.xp - (character.level - 1) * XP_PER_LEVEL)}
              >
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, ((character.xp - (character.level - 1) * XP_PER_LEVEL) / XP_PER_LEVEL) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Realm Ladder */}
        <section aria-labelledby="realm-ladder-heading" className="mb-8">
          <h2 id="realm-ladder-heading" className="text-2xl font-bold text-white mb-4">
            🗺️ Realm Ladder
          </h2>
          <div className="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden">
            <div className="divide-y divide-slate-700/50">
              {REALM_LADDER.map((realm, index) => {
                const isCompleted = game.completedRealms.includes(realm.id)
                const isUnlocked = character.level >= realm.requiredLevel
                return (
                  <div
                    key={realm.id}
                    className={`grid grid-cols-12 gap-2 px-4 py-3 items-center ${
                      isUnlocked ? 'bg-amber-900/10' : ''
                    }`}
                  >
                    <div className="col-span-1 text-lg">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div className="col-span-4 sm:col-span-3">
                      <p
                        className={`font-bold ${isUnlocked ? 'text-amber-400' : 'text-slate-500'}`}
                      >
                        <span aria-hidden="true">{realm.icon}</span> {realm.name}
                      </p>
                    </div>
                    <div className="col-span-3 text-center">
                      <span className="md:hidden text-slate-500 text-xs">Requires </span>
                      <span className="text-white font-bold">Lv {realm.requiredLevel}</span>
                    </div>
                    <div className="col-span-4 sm:col-span-4 text-right text-xs text-slate-400">
                      {isCompleted
                        ? '✅ Completed'
                        : isUnlocked
                          ? '⭐ Unlocked'
                          : `🔒 Reach level ${realm.requiredLevel}`}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Personal Records */}
        <section aria-labelledby="records-heading">
          <h2 id="records-heading" className="text-2xl font-bold text-white mb-4">
            📜 Personal Records
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {records.map((record) => (
              <div
                key={record.label}
                className="bg-slate-800/80 rounded-lg p-4 text-center border border-slate-700"
              >
                <span className="text-2xl mb-1 block" aria-hidden="true">
                  {record.icon}
                </span>
                <p className="text-lg font-bold text-white">{record.value}</p>
                <p className="text-slate-500 text-xs">{record.label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
