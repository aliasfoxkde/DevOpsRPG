import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { getRandomEncouragement } from '../data/milestones'
import { MiniGameHub } from '../components/minigames/MiniGameHub'

export default function HomePage() {
  const { game, getNextQuest, completedCount, totalQuests } = useGame()
  const { character } = game
  const nextQuest = getNextQuest()
  const [showMiniGames, setShowMiniGames] = useState(false)
  const encouragement = getRandomEncouragement()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-900 to-slate-900" />

        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          {/* Character Greeting */}
          <div className="mb-8">
            <div className="text-8xl mb-4 animate-bounce">{character.avatar}</div>
            <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">
              Welcome, {character.name}
            </h1>
            <p className="text-xl text-slate-300">{character.title}</p>
          </div>

          {/* Level & XP */}
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-slate-800/80 rounded-full border border-amber-600/50 mb-8">
            <span className="text-amber-400 font-bold">Level {character.level}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">{character.xp} XP Total</span>
            <span className="text-slate-500">•</span>
            <span className="text-orange-400">🔥 {character.streakDays} Day Streak</span>
          </div>

          {/* Current Quest CTA */}
          {nextQuest && (
            <div className="mb-8">
              <p className="text-slate-400 mb-4">Your current quest awaits:</p>
              <Link
                to={`/quest/${nextQuest.id}`}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl shadow-2xl transform transition-all hover:scale-105 text-lg"
              >
                <span className="text-2xl">⚔️</span>
                <span>{nextQuest.title}</span>
                <span className="text-amber-200">+{nextQuest.xpReward} XP</span>
              </Link>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 text-sm">
            <div>
              <span className="text-2xl font-bold text-green-400">{completedCount}</span>
              <span className="text-slate-400 ml-1">/ {totalQuests} Quests</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-yellow-400">{character.gold}</span>
              <span className="text-slate-400 ml-1">Gold</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-purple-400">
                {game.achievements.filter(a => a.unlockedAt).length}
              </span>
              <span className="text-slate-400 ml-1">/ {game.achievements.length} Achievements</span>
            </div>
          </div>

          {/* Encouragement */}
          <div className="mt-8">
            <p className="text-purple-300 italic text-lg">"{encouragement}"</p>
          </div>
        </div>
      </section>

      {/* The Story Section */}
      <section className="bg-slate-800/50 border-y border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-amber-400 mb-2">📜 The Chronicle</h2>
            <p className="text-slate-400 italic">
              "Ten years ago, The Great Outage changed everything..."
            </p>
          </div>

          <div className="prose prose-invert prose-amber max-w-none">
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
              <p className="text-slate-300 leading-relaxed mb-4">
                The world relied on <span className="text-amber-400 font-medium">The Eternal CI/CD</span> — an ancient automated system that silently deployed code across the globe. Hospitals, banks, transportation — all ran on its flawless deployments.
              </p>
              <p className="text-slate-300 leading-relaxed mb-4">
                Then came <span className="text-red-400 font-medium">The Great Outage</span>. A corrupted configuration file brought everything crashing down. Three years to rebuild. The corruption was never fully purged.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Now, <span className="text-green-400 font-medium">The Corruption stirs again</span>. The Guild has summoned you to become a <span className="text-amber-400 font-medium">DevOps Master</span>. Only you can master the Eternal Pipeline before it rises once more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-100 mb-8 text-center">What would you like to do?</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Continue Quest */}
          <Link
            to="/quests"
            className="group p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-all hover:shadow-lg hover:shadow-amber-500/10"
          >
            <div className="text-4xl mb-4">📜</div>
            <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-amber-400 transition-colors">
              Quest Journal
            </h3>
            <p className="text-slate-400 text-sm">
              View available quests, check realm progress, and continue your journey.
            </p>
          </Link>

          {/* Character Sheet */}
          <Link
            to="/character"
            className="group p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-all hover:shadow-lg hover:shadow-amber-500/10"
          >
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-amber-400 transition-colors">
              Character Sheet
            </h3>
            <p className="text-slate-400 text-sm">
              View your stats, achievements, equipment, and journey progress.
            </p>
          </Link>

          {/* Continue Learning */}
          {nextQuest && (
            <Link
              to={`/quest/${nextQuest.id}`}
              className="group p-6 bg-gradient-to-br from-amber-900/30 to-slate-900 rounded-xl border border-amber-600/30 hover:border-amber-500/50 transition-all hover:shadow-lg hover:shadow-amber-500/10 md:col-span-2"
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">⚔️</div>
                <div>
                  <h3 className="text-xl font-bold text-amber-400 mb-1">
                    Begin Battle: {nextQuest.title}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {nextQuest.xpReward} XP • Difficulty: {'💀'.repeat(nextQuest.difficulty)} • ~{nextQuest.estimatedMinutes} min
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* Mini Games */}
          <button
            onClick={() => setShowMiniGames(true)}
            className="group p-6 bg-gradient-to-br from-purple-900/30 to-slate-900 rounded-xl border border-purple-600/30 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10 text-left"
          >
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-purple-400 transition-colors">
              Mini-Games
            </h3>
            <p className="text-slate-400 text-sm">
              Practice DevOps skills and earn bonus XP and gold!
            </p>
          </button>
        </div>
      </section>

      {/* Mini Games Modal */}
      {showMiniGames && (
        <MiniGameHub onClose={() => setShowMiniGames(false)} />
      )}

      {/* Realm Preview */}
      <section className="bg-slate-800/30 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-slate-100 mb-8 text-center">Your Journey</h2>

          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
            {[
              { icon: '🏘️', name: 'Foundations', level: 1 },
              { icon: '🌲', name: 'Scripts', level: 5 },
              { icon: '🏰', name: 'Frameworks', level: 10 },
              { icon: '⛰️', name: 'Cloud', level: 15 },
              { icon: '🏛️', name: 'DevOps', level: 20 },
            ].map((realm, idx) => {
              const isUnlocked = character.level >= realm.level
              const isCompleted = idx < 2 || (character.level >= 10 && idx < 3)

              return (
                <div
                  key={idx}
                  className={`flex-shrink-0 text-center p-4 rounded-xl transition-all ${
                    isUnlocked
                      ? 'bg-slate-800/80 border border-slate-700'
                      : 'bg-slate-900/50 border border-slate-800 opacity-50'
                  }`}
                >
                  <div className={`text-3xl mb-2 ${!isUnlocked && 'grayscale'}`}>
                    {isCompleted ? '✅' : isUnlocked ? realm.icon : '🔒'}
                  </div>
                  <div className={`text-sm font-medium ${isUnlocked ? 'text-slate-200' : 'text-slate-500'}`}>
                    {realm.name}
                  </div>
                  <div className="text-xs text-slate-500">Lv {realm.level}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
