import { useTheme } from '../contexts/ThemeContext'
import { useGame } from '../contexts/GameContext'
import { useSoundEffects } from '../hooks/useSoundEffects'

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { game } = useGame()
  const { isMuted, toggleMute, playSound } = useSoundEffects()

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    playSound('click')
    setTheme(newTheme)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">⚙️ Settings</h1>
        <p className="text-slate-400">Customize your game experience</p>
      </div>

      {/* Theme Selection */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          🎨 Appearance
        </h2>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌙</span>
              <div>
                <div className="font-medium">Dark Mode</div>
                <div className="text-xs text-slate-400">Easy on the eyes</div>
              </div>
            </div>
            <input
              type="radio"
              name="theme"
              checked={theme === 'dark'}
              onChange={() => handleThemeChange('dark')}
              className="w-5 h-5 text-amber-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">☀️</span>
              <div>
                <div className="font-medium">Light Mode</div>
                <div className="text-xs text-slate-400">Bright and clean</div>
              </div>
            </div>
            <input
              type="radio"
              name="theme"
              checked={theme === 'light'}
              onChange={() => handleThemeChange('light')}
              className="w-5 h-5 text-amber-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💻</span>
              <div>
                <div className="font-medium">System</div>
                <div className="text-xs text-slate-400">Match your device settings</div>
              </div>
            </div>
            <input
              type="radio"
              name="theme"
              checked={theme === 'system'}
              onChange={() => handleThemeChange('system')}
              className="w-5 h-5 text-amber-500"
            />
          </label>
        </div>

        <div className="mt-4 text-center text-sm text-slate-400">
          Current: <span className="text-amber-400 capitalize">{resolvedTheme}</span>
        </div>
      </div>

      {/* Sound Settings */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          🔊 Sound
        </h2>

        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{isMuted ? '🔇' : '🔊'}</span>
            <div>
              <div className="font-medium">Sound Effects</div>
              <div className="text-xs text-slate-400">Play sounds for actions and achievements</div>
            </div>
          </div>
          <button
            onClick={() => {
              if (!isMuted) playSound('click')
              toggleMute()
            }}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              isMuted ? 'bg-slate-600' : 'bg-green-600'
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                isMuted ? 'left-1' : 'translate-x-8'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Game Stats */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          📊 Game Statistics
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{game.character.level}</div>
            <div className="text-xs text-slate-400">Level</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{game.character.xp}</div>
            <div className="text-xs text-slate-400">Total XP</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{game.character.gold}</div>
            <div className="text-xs text-slate-400">Gold</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{game.completedQuests.length}</div>
            <div className="text-xs text-slate-400">Quests</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{game.badges.filter(b => b.unlockedAt).length}</div>
            <div className="text-xs text-slate-400">Badges</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{game.character.streakDays}</div>
            <div className="text-xs text-slate-400">Day Streak 🔥</div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-900/20 rounded-xl border border-red-500/30 p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
          ⚠️ Danger Zone
        </h2>

        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
          <div>
            <div className="font-medium text-slate-200">Reset Progress</div>
            <div className="text-xs text-slate-400">Start fresh - this cannot be undone!</div>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Are you sure? This will reset ALL your progress and cannot be undone!')) {
                if (window.confirm('Really? You will lose everything - all XP, badges, companions, everything!')) {
                  playSound('click')
                  localStorage.clear()
                  window.location.reload()
                }
              }
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* About */}
      <div className="mt-8 text-center text-sm text-slate-500">
        <p>DevOpsQuest v1.0.0</p>
        <p className="mt-1">A gamified DevOps learning experience</p>
      </div>
    </div>
  )
}
