import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { getRandomEncouragement } from '../data/milestones'
import { MiniGameHub } from '../components/minigames/MiniGameHub'

// Featured games for showcase
const FEATURED_GAMES = [
  { id: 'devopsquest', name: 'DevOpsQuest', icon: '⚔️', category: 'DevOps', color: 'from-amber-600 to-orange-500', desc: 'Master DevOps through quests' },
  { id: 'codecombat', name: 'Code Combat', icon: '🛡️', category: 'Programming', color: 'from-green-600 to-emerald-500', desc: 'Learn coding through RPG battles' },
  { id: 'numberstorm', name: 'Number Storm', icon: '🌀', category: 'Math', color: 'from-blue-600 to-indigo-500', desc: 'Arithmetic race challenges' },
  { id: 'gitexplorer', name: 'Git Explorer', icon: '🌳', category: 'DevOps', color: 'from-orange-600 to-red-500', desc: 'Version control adventures' },
  { id: 'wordwizard', name: 'Word Wizard', icon: '✨', category: 'Reading', color: 'from-violet-600 to-purple-500', desc: 'Vocabulary battles' },
  { id: 'atomsmash', name: 'Atom Smash', icon: '⚛️', category: 'Science', color: 'from-cyan-600 to-blue-500', desc: 'Chemistry adventures' },
  { id: 'dockerdash', name: 'Docker Dash', icon: '🐳', category: 'DevOps', color: 'from-blue-600 to-cyan-500', desc: 'Container racing' },
  { id: 'geomjam', name: 'Geom Jam', icon: '📐', category: 'Math', color: 'from-pink-600 to-rose-500', desc: 'Shape & spatial puzzles' },
  { id: 'roborally', name: 'Robo Rally', icon: '🤖', category: 'Robotics', color: 'from-slate-600 to-gray-500', desc: 'Program robot courses' },
  { id: 'triviatitans', name: 'Trivia Titans', icon: '🏅', category: 'Trivia', color: 'from-gold-600 to-yellow-500', desc: 'Knowledge showdowns' },
  { id: 'algebraassault', name: 'Algebra Assault', icon: '⚡', category: 'Math', color: 'from-yellow-600 to-amber-500', desc: 'Equation battles' },
  { id: 'bioquest', name: 'Bio Quest', icon: '🧬', category: 'Science', color: 'from-green-600 to-emerald-500', desc: 'Journey through cells & DNA' },
  { id: 'mazemaster', name: 'Maze Master', icon: '🌀', category: 'Puzzle', color: 'from-violet-600 to-indigo-500', desc: 'Navigate labyrinths' },
  { id: 'bridgebuild', name: 'Bridge Build', icon: '🌉', category: 'Engineering', color: 'from-amber-600 to-red-500', desc: 'Build & test bridges' },
  { id: 'historyhunt', name: 'History Hunt', icon: '🏛️', category: 'Trivia', color: 'from-amber-700 to-amber-500', desc: 'Time-travel events' },
  { id: 'physix', name: 'Physix Runner', icon: '🎯', category: 'Science', color: 'from-purple-600 to-pink-500', desc: 'Physics platformer' },
  { id: 'storyforge', name: 'Story Forge', icon: '📖', category: 'Reading', color: 'from-rose-600 to-pink-500', desc: 'Creative writing' },
  { id: 'k8skingdom', name: 'K8s Kingdom', icon: '👑', category: 'DevOps', color: 'from-purple-600 to-indigo-500', desc: 'Kubernetes realm' },
  { id: 'geographypulse', name: 'Geography Pulse', icon: '🌐', category: 'Trivia', color: 'from-green-600 to-emerald-500', desc: 'Explore the world' },
  { id: 'circuit', name: 'Circuit Sim', icon: '🔌', category: 'Robotics', color: 'from-yellow-600 to-green-500', desc: 'Electronics simulator' },
]

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
          <div className="absolute top-20 left-1/4 w-2 h-2 bg-amber-400/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute top-40 right-1/3 w-1 h-1 bg-amber-400/50 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          <div className="absolute top-60 left-1/3 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          <div className="absolute bottom-40 right-1/4 w-2 h-2 bg-amber-400/20 rounded-full animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.3s' }} />
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
                <span className="text-purple-300 text-sm">{game.activeCompanion.name} is with you!</span>
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
                  {game.achievements.filter(a => a.unlockedAt).length}
                </span>
                <span className="text-slate-400 ml-1">/ {game.achievements.length}</span>
              </div>
            </div>
          </div>

          {/* Encouragement */}
          <div className="mt-8 animate-fade-in">
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
                    {nextQuest.xpReward} XP • Difficulty: {[1, 2, 3, 4, 5].map(i => <span key={i} className={i <= nextQuest.difficulty ? 'text-red-400' : 'text-slate-700'}>💀</span>)} • ~{nextQuest.estimatedMinutes} min
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
              <span className="text-amber-400 font-bold">{Math.round((completedCount / totalQuests) * 100)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
                style={{ width: `${totalQuests > 0 ? (completedCount / totalQuests) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Realm Cards */}
          <div className="grid grid-cols-5 gap-4">
            {[
              { icon: '🏘️', name: 'Foundations', level: 1, desc: 'HTML, CSS, JS basics' },
              { icon: '🌲', name: 'Scripts', level: 5, desc: 'Git, SQL, Bash' },
              { icon: '🏰', name: 'Frameworks', level: 10, desc: 'React, Node.js' },
              { icon: '⛰️', name: 'Cloud', level: 15, desc: 'Docker, AWS' },
              { icon: '🏛️', name: 'DevOps', level: 20, desc: 'K8s, CI/CD, Terraform' },
            ].map((realm, idx) => {
              const isUnlocked = character.level >= realm.level
              const isCompleted = idx < Math.floor((completedCount / totalQuests) * 5)

              return (
                <div
                  key={idx}
                  className={`relative text-center p-4 rounded-xl transition-all hover:scale-105 ${
                    isUnlocked
                      ? 'bg-gradient-to-b from-slate-800 to-slate-900 border border-amber-600/30 shadow-lg shadow-amber-900/20'
                      : 'bg-slate-900/50 border border-slate-800 opacity-60'
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
                  <h3 className={`font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                    {realm.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-1">{realm.desc}</p>
                  <p className="text-xs text-amber-400/70">Lvl {realm.level}</p>
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
              <p className="text-slate-400 text-sm">Explore our full library of educational games</p>
            </div>
            <Link
              to="/games"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Browse All Games →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {FEATURED_GAMES.map((game) => (
              <div
                key={game.id}
                className="group relative bg-slate-800/60 rounded-xl border border-slate-700 overflow-hidden hover:border-amber-500/50 transition-all hover:shadow-lg hover:shadow-amber-500/10 cursor-pointer"
              >
                <div className={`h-16 bg-gradient-to-br ${game.color} flex items-center justify-center`}>
                  <span className="text-3xl group-hover:scale-110 transition-transform">{game.icon}</span>
                </div>
                <div className="p-2">
                  <p className="text-xs text-amber-400 font-medium truncate">{game.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{game.category}</p>
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs text-white font-medium bg-amber-600 px-2 py-1 rounded">Coming Soon</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 border-t border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-amber-400 mb-2">💬 What Learners Say</h2>
            <p className="text-slate-400">Join thousands of developers mastering DevOps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "Finally a fun way to learn Git! I used to dread version control, now I actually enjoy it.", name: "Sarah K.", role: "Frontend Dev", avatar: "👩‍💻" },
              { quote: "The streak system keeps me motivated. I've learned more in 2 weeks than in months of watching videos.", name: "Marcus J.", role: "Backend Engineer", avatar: "👨‍💻" },
              { quote: "As someone transitioning to DevOps, this was the perfect hands-on learning tool. Highly recommended!", name: "Priya P.", role: "DevOps Engineer", avatar: "👩‍🔧" },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-amber-600/30 transition-all">
                <div className="text-amber-400 text-2xl mb-3">"</div>
                <p className="text-slate-300 mb-4 italic">{testimonial.quote}</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{testimonial.avatar}</span>
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-slate-500 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-800/50 border-t border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-amber-400 mb-2">📊 Our Community</h2>
            <p className="text-slate-400">Growing stronger every day</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '10K+', label: 'Active Learners', icon: '👥' },
              { value: '50K+', label: 'Quests Completed', icon: '⚔️' },
              { value: '35+', label: 'Learning Games', icon: '🎮' },
              { value: '98%', label: 'Satisfaction', icon: '⭐' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-6 bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl border border-slate-700">
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
              <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
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
              { tip: "Maintain your daily streak for bonus gold and XP multipliers!", icon: "🔥" },
              { tip: "Use hint scrolls strategically on difficult quests - they're worth it!", icon: "💡" },
              { tip: "Companions provide passive XP/Gold bonuses - equip one today!", icon: "🐾" },
              { tip: "Complete side quests for extra rewards while leveling up.", icon: "⚔️" },
              { tip: "Visit the shop regularly for power-ups that boost your progress.", icon: "🏪" },
              { tip: "Check the world map to see all available realms and plan your journey.", icon: "🗺️" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
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
                An open source gamified DevOps learning experience. Level up while mastering real-world skills.
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
                <li><Link to="/quests" className="text-slate-400 hover:text-amber-400 transition-colors">Quest Journal</Link></li>
                <li><Link to="/worldmap" className="text-slate-400 hover:text-amber-400 transition-colors">World Map</Link></li>
                <li><Link to="/character" className="text-slate-400 hover:text-amber-400 transition-colors">Character</Link></li>
                <li><Link to="/games" className="text-slate-400 hover:text-amber-400 transition-colors">Game Library</Link></li>
                <li><Link to="/about" className="text-slate-400 hover:text-amber-400 transition-colors">About</Link></li>
                <li><Link to="/faq" className="text-slate-400 hover:text-amber-400 transition-colors">FAQ</Link></li>
                <li><Link to="/privacy-policy" className="text-slate-400 hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-white font-semibold mb-3">Categories</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-slate-400">⚔️ DevOps & CI/CD</span></li>
                <li><span className="text-slate-400">🧮 Math & Logic</span></li>
                <li><span className="text-slate-400">🔬 Science</span></li>
                <li><span className="text-slate-400">📖 Reading & Language</span></li>
                <li><span className="text-slate-400">🤖 Robotics</span></li>
                <li><span className="text-slate-400">🏅 Trivia</span></li>
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
              <Link to="/about" className="hover:text-amber-400 transition-colors">About</Link>
              <Link to="/games" className="hover:text-amber-400 transition-colors">Games</Link>
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
