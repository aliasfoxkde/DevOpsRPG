import { useVoiceNarration } from '../../hooks/useVoiceNarration'

export function VoiceSettings() {
  const { settings, voices, isSpeaking, speak, stop, toggleEnabled, updateSettings, isSupported } = useVoiceNarration()

  if (!isSupported) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          🔊 Voice Narration
        </h2>
        <p className="text-slate-400 text-sm">
          Voice narration is not supported in your browser.
        </p>
      </div>
    )
  }

  const englishVoices = voices.filter(v => v.lang.startsWith('en'))

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          🔊 Voice Narration
        </h2>
        <button
          onClick={toggleEnabled}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            settings.enabled
              ? 'bg-green-600 hover:bg-green-500 text-white'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
          }`}
        >
          {settings.enabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {settings.enabled && (
        <>
          <p className="text-slate-400 text-sm mb-4">
            Enable voice narration to hear quest descriptions, feedback, and achievements spoken aloud.
          </p>

          {/* Test voice */}
          <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Test Voice</span>
              <div className="flex gap-2">
                <button
                  onClick={() => speak('Hello! Your voice narration is working correctly.', 'high')}
                  disabled={isSpeaking}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm rounded transition-colors"
                >
                  {isSpeaking ? 'Speaking...' : 'Play'}
                </button>
                {isSpeaking && (
                  <button
                    onClick={stop}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded transition-colors"
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Voice selection */}
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-2">Voice</label>
            <select
              value={settings.voiceURI || ''}
              onChange={(e) => updateSettings({ voiceURI: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">Default</option>
              {englishVoices.map(voice => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Volume */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <label className="text-slate-400">Volume</label>
              <span className="text-slate-300">{Math.round(settings.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Rate */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <label className="text-slate-400">Speed</label>
              <span className="text-slate-300">{settings.rate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.rate}
              onChange={(e) => updateSettings({ rate: parseFloat(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Pitch */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <label className="text-slate-400">Pitch</label>
              <span className="text-slate-300">{settings.pitch.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.pitch}
              onChange={(e) => updateSettings({ pitch: parseFloat(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Sample narrations */}
          <div className="mt-6 pt-4 border-t border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Sample Narrations</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => speak('Correct! Great job.')}
                disabled={isSpeaking}
                className="px-3 py-2 bg-green-600/30 hover:bg-green-600/50 disabled:bg-slate-700 disabled:text-slate-500 text-green-400 text-sm rounded transition-colors"
              >
                ✅ Correct Answer
              </button>
              <button
                onClick={() => speak('Quest complete! You earned fifty XP and twenty gold.')}
                disabled={isSpeaking}
                className="px-3 py-2 bg-amber-600/30 hover:bg-amber-600/50 disabled:bg-slate-700 disabled:text-slate-500 text-amber-400 text-sm rounded transition-colors"
              >
                🏆 Quest Complete
              </button>
              <button
                onClick={() => speak('Congratulations! You reached level five.')}
                disabled={isSpeaking}
                className="px-3 py-2 bg-purple-600/30 hover:bg-purple-600/50 disabled:bg-slate-700 disabled:text-slate-500 text-purple-400 text-sm rounded transition-colors"
              >
                ⭐ Level Up
              </button>
              <button
                onClick={() => speak('New badge unlocked: First Steps!')}
                disabled={isSpeaking}
                className="px-3 py-2 bg-cyan-600/30 hover:bg-cyan-600/50 disabled:bg-slate-700 disabled:text-slate-500 text-cyan-400 text-sm rounded transition-colors"
              >
                🏅 Badge Unlocked
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
