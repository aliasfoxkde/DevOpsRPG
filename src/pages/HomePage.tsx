import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { getRandomEncouragement } from '../data/milestones'
import { MiniGameHub } from '../components/minigames/MiniGameHub'
import { realms } from '../data/quests'
import { technologies } from '../data/technologies'
import { MINI_GAMES } from '../components/minigames/gameCatalog'

// The realm preview mirrors the world map's data instead of a hand-copied list.
const REALM_LADDER = Object.values(realms).sort((a, b) => a.requiredLevel - b.requiredLevel)

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
        {/* Animated background with particles */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-900 to-slate-900" />
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating particles */}
          <div
            className="absolute top-20 left-1/4 w-2 h-2 bg-amber-400/30 rounded-full animate-ping"
            style={{ animationDuration: '3s' }}
          />
          <div
            className="absolute top-40 right-1/3 w-1 h-1 bg-amber-400/50 rounded-full animate-ping"
            style={{ animationDuration: '2s', animationDelay: '0.5s' }}
          />
          <div
            className="absolute top-60 left-1/3 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-ping"
            style={{ animationDuration: '4s', animationDelay: '1s' }}
          />
          <div
            className="absolute bottom-40 right-1/4 w-2 h-2 bg-amber-400/20 rounded-full animate-ping"
            style={{ animationDuration: '3.5s', animationDelay: '0.3s' }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          {/* Character Greeting */}
          <div className="mb-8">
            {/* Animated avatar with glow */}
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl animate-pulse" />
              <div className="relative text-8xl animate-bounce">{character.avatar}</div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-2 drop-shadow-lg">
              Welcome, {character.name}
            </h1>
            <p className="text-xl text-slate-300">{character.title}</p>
            {/* Companion if active */}
            {game.activeCompanion && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-purple-900/50 rounded-full border border-purple-500/30">
                <span>{game.activeCompanion.icon}</span>
                <span className="text-purple-300 text-sm">
                  {game.activeCompanion.name} is with you!
                </span>
              </div>
            )}
          </div>

          {/* Level & XP */}
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-slate-800/80 rounded-full border border-amber-600/50 mb-8 shadow-lg shadow-amber-600/10">
            <span className="text-amber-400 font-bold">Level {character.level}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">{character.xp} XP Total</span>
            <span className="text-slate-500">•</span>
            <span className="text-orange-400">🔥 {character.streakDays} Day Streak</span>
          </div>

          {/* Current Quest CTA */}
          {nextQuest && (
            <div className="mb-8">
              <p className="text-slate-400 mb-4">⚔️ Your current quest awaits:</p>
              <Link
                to={`/quest/${nextQuest.id}`}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl shadow-2xl transform transition-all hover:scale-105 text-lg overflow-hidden"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="relative text-2xl">⚔️</span>
                <span className="relative">{nextQuest.title}</span>
                <span className="relative text-amber-200">+{nextQuest.xpReward} XP</span>
              </Link>
            </div>
          )}

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-lg border border-slate-700">
              <span className="text-2xl">✅</span>
              <div>
                <span className="text-xl font-bold text-green-400">{completedCount}</span>
                <span className="text-slate-400 ml-1">/ {totalQuests} Quests</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-lg border border-slate-700">
              <span className="text-2xl">💰</span>
              <div>
                <span className="text-xl font-bold text-yellow-400">{character.gold}</span>
                <span className="text-slate-400 ml-1">Gold</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-lg border border-slate-700">
              <span className="text-2xl">🏆</span>
              <div>
                <span className="text-xl font-bold text-purple-400">
                  {game.achievements.filter((a) => a.unlockedAt).length}
                </span>
                <span className="text-slate-400 ml-1">/ {game.achievements.length}</span>
              </div>
            </div>
          </div>

          {/* Encouragement */}
          <div className="mt-8 animate-fade-in">
            <p className="text-purple-300 italic text-lg">&quot;{encouragement}&quot;</p>
          </div>
        </div>
      </section>

      {/* The Story Section */}
      <section className="bg-slate-800/50 border-y border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-amber-400 mb-2">📜 The Chronicle</h2>
            <p className="text-slate-400 italic">
              &quot;Ten years ago, The Great Outage changed everything...&quot;
            </p>
          </div>

          <div className="prose prose-invert prose-amber max-w-none">
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
              <p className="text-slate-300 leading-relaxed mb-4">
                The world relied on{' '}
                <span className="text-amber-400 font-medium">The Eternal CI/CD</span> — an ancient
                automated system that silently deployed code across the globe. Hospitals, banks,
                transportation — all ran on its flawless deployments.
              </p>
              <p className="text-slate-300 leading-relaxed mb-4">
                Then came <span className="text-red-400 font-medium">The Great Outage</span>. A
                corrupted configuration file brought everything crashing down. Three years to
                rebuild. The corruption was never fully purged.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Now, <span className="text-green-400 font-medium">The Corruption stirs again</span>.
                The Guild has summoned you to become a{' '}
                <span className="text-amber-400 font-medium">DevOps Master</span>. Only you can
                master the Eternal Pipeline before it rises once more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-100 mb-8 text-center">
          What would you like to do?
        </h2>

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
                    {nextQuest.xpReward} XP • Difficulty:{' '}
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className={i <= nextQuest.difficulty ? 'text-red-400' : 'text-slate-700'}
                      >
                        💀
                      </span>
                    ))}{' '}
                    • ~{nextQuest.estimatedMinutes} min
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* Mini Games */}
          <button
            onClick={() => {
              setShowMiniGames(true)
            }}
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
        <MiniGameHub
          onClose={() => {
            setShowMiniGames(false)
          }}
        />
      )}

      {/* Realm Preview - Your Journey Section */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-amber-400 mb-2">⚔️ Your Journey</h2>
            <p className="text-slate-400">Progress through the realms and become a DevOps Master</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">Overall Progress</span>
              <span className="text-amber-400 font-bold">
                {Math.round((completedCount / totalQuests) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
                style={{ width: `${totalQuests > 0 ? (completedCount / totalQuests) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Realm Cards - straight from the world map data */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {REALM_LADDER.map((realm) => {
              const isUnlocked = character.level >= realm.requiredLevel
              const isCompleted = game.completedRealms.includes(realm.id)
              const sampleTechs = realm.technologies
                .map((techId) => technologies[techId].name)
                .slice(0, 3)
                .join(', ')

              return (
                <div
                  key={realm.id}
                  className={`relative text-center p-4 rounded-xl transition-all hover:scale-105 ${
                    isUnlocked
                      ? 'bg-gradient-to-b from-slate-800 to-slate-900 border border-amber-600/30 shadow-lg shadow-amber-900/20'
                      : 'bg-slate-900/50 border border-slate-800 grayscale'
                  }`}
                >
                  {/* Status Badge */}
                  <div className="absolute -top-2 -right-2">
                    {isCompleted ? (
                      <span className="text-lg">✅</span>
                    ) : isUnlocked ? (
                      <span className="text-lg">⭐</span>
                    ) : (
                      <span className="text-lg">🔒</span>
                    )}
                  </div>

                  <div className={`text-4xl mb-2 ${!isUnlocked && 'grayscale opacity-50'}`}>
                    {realm.icon}
                  </div>
                  <h3
                    className={`font-bold mb-1 text-sm ${isUnlocked ? 'text-white' : 'text-slate-500'}`}
                  >
                    {realm.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-1">{sampleTechs}</p>
                  <p className="text-xs text-amber-400/70">Lvl {realm.requiredLevel}</p>
                </div>
              )
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-8">
            <Link
              to="/worldmap"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-lg shadow-lg shadow-amber-600/30 transition-all hover:scale-105"
            >
              <span>🗺️</span>
              <span>View World Map</span>
            </Link>
          </div>
        </div>
      </section>

      {/* More Learning Games */}
      <section className="bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">🎮 More Learning Games</h2>
              <p className="text-slate-400 text-sm">
                Explore our full library of educational games
              </p>
            </div>
            <Link
              to="/games"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Browse All Games →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {MINI_GAMES.map((miniGame) => (
              <Link
                key={miniGame.id}
                to="/games"
                className="group bg-slate-800/60 rounded-xl border border-slate-700 overflow-hidden hover:border-amber-500/50 transition-all hover:shadow-lg hover:shadow-amber-500/10"
              >
                <div className="h-16 bg-gradient-to-br from-slate-700/60 to-slate-800 flex items-center justify-center">
                  <span className="text-3xl group-hover:scale-110 transition-transform">
                    {miniGame.icon}
                  </span>
                </div>
                <div className="p-2">
                  <p className="text-xs text-amber-400 font-medium truncate">{miniGame.name}</p>
                  <p className="text-[10px] text-slate-500">{miniGame.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog Stats - the real content counts */}
      <section className="bg-slate-800/50 border-t border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-amber-400 mb-2">📊 Inside DevOpsQuest</h2>
            <p className="text-slate-400">Everything in the game, all playable today</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                value: Object.keys(technologies).length,
                label: 'Technologies',
                icon: '📚',
              },
              { value: totalQuests, label: 'Quests', icon: '⚔️' },
              { value: Object.keys(realms).length, label: 'Realms', icon: '🗺️' },
              { value: MINI_GAMES.length, label: 'Mini-Games', icon: '🎮' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-6 bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl border border-slate-700"
              >
                <span className="text-4xl mb-3 block">{stat.icon}</span>
                <div className="text-3xl font-bold text-amber-400 mb-1">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors / Supported By */}
      <section className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-300 mb-2">🚀 Built With</h2>
            <p className="text-slate-500 text-sm">Open source technologies powering DevOpsQuest</p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8">
            {[
              { name: 'React', icon: '⚛️' },
              { name: 'TypeScript', icon: '📘' },
              { name: 'Tailwind', icon: '🎨' },
              { name: 'Vite', icon: '⚡' },
              { name: 'Cloudflare', icon: '☁️' },
              { name: 'GitHub', icon: '🐙' },
            ].map((sponsor, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700"
              >
                <span className="text-xl">{sponsor.icon}</span>
                <span className="text-slate-300 font-medium">{sponsor.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="bg-gradient-to-b from-slate-800 to-slate-900 border-t border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-amber-400 mb-2">💡 Pro Tips</h2>
            <p className="text-slate-400">Maximize your learning efficiency</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { tip: 'Maintain your daily streak for bonus gold and XP multipliers!', icon: '🔥' },
              {
                tip: "Use hint scrolls strategically on difficult quests - they're worth it!",
                icon: '💡',
              },
              { tip: 'Companions provide passive XP/Gold bonuses - equip one today!', icon: '🐾' },
              { tip: 'Complete side quests for extra rewards while leveling up.', icon: '⚔️' },
              {
                tip: 'Visit the shop regularly for power-ups that boost your progress.',
                icon: '🏪',
              },
              {
                tip: 'Check the world map to see all available realms and plan your journey.',
                icon: '🗺️',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700"
              >
                <span className="text-2xl">{item.icon}</span>
                <p className="text-slate-300 text-sm">{item.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-lg mb-3">
                <span className="text-xl">⚔️</span>
                <span>DevOpsQuest</span>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                An open source gamified DevOps learning experience. Level up while mastering
                real-world skills.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://github.com/aliasfoxkde/DevOpsRPG"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <span className="text-xl">🐙</span>
                </a>
                <a
                  href="https://f7b4e42f.devopsquest.pages.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                  aria-label="Play Game"
                >
                  <span className="text-xl">🎮</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/quests"
                    className="text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    Quest Journal
                  </Link>
                </li>
                <li>
                  <Link
                    to="/worldmap"
                    className="text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    World Map
                  </Link>
                </li>
                <li>
                  <Link
                    to="/character"
                    className="text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    Character
                  </Link>
                </li>
                <li>
                  <Link
                    to="/games"
                    className="text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    Game Library
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-slate-400 hover:text-amber-400 transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy-policy"
                    className="text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Categories - the real game systems */}
            <div>
              <h4 className="text-white font-semibold mb-3">Game Systems</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: '⚔️ Quests & Quizzes', to: '/quests' },
                  { label: '🗺️ World Map', to: '/worldmap' },
                  { label: '🎮 Mini-Games', to: '/games' },
                  { label: '📜 Storylines', to: '/storylines' },
                  { label: '🎓 Certifications', to: '/certifications' },
                  { label: '🏆 Leaderboard', to: '/leaderboard' },
                ].map((system) => (
                  <li key={system.to}>
                    <Link
                      to={system.to}
                      className="text-slate-400 hover:text-amber-400 transition-colors"
                    >
                      {system.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contribute */}
            <div>
              <h4 className="text-white font-semibold mb-3">Contribute</h4>
              <p className="text-slate-400 text-sm mb-3">
                DevOpsQuest is open source. Contributions welcome!
              </p>
              <a
                href="https://github.com/aliasfoxkde/DevOpsRPG"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <span>🐙</span>
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © 2026 DevOpsQuest. Open source under MIT License.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link to="/about" className="hover:text-amber-400 transition-colors">
                About
              </Link>
              <Link to="/games" className="hover:text-amber-400 transition-colors">
                Games
              </Link>
              <a
                href="https://github.com/aliasfoxkde/DevOpsRPG"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-400 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://f7b4e42f.devopsquest.pages.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-400 transition-colors"
              >
                Play Now
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
