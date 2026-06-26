import { useState, useEffect } from 'react'

const GAME_SHORTCUTS = [
  // Navigation
  { key: 'g h', description: 'Go to Home', category: 'Navigation' },
  { key: 'g l', description: 'Go to Learn', category: 'Navigation' },
  { key: 'g d', description: 'Go to Dashboard', category: 'Navigation' },
  { key: 'g q', description: 'Go to Quests', category: 'Navigation' },
  { key: 'g c', description: 'Go to Character', category: 'Navigation' },
  { key: 'g r', description: 'Go to Rewards', category: 'Navigation' },
  { key: 'g b', description: 'Go to Badges', category: 'Navigation' },
  { key: 'g w', description: 'Go to World Map', category: 'Navigation' },
  { key: 'g L', description: 'Go to Leaderboard', category: 'Navigation' },
  { key: 'g C', description: 'Go to Challenges', category: 'Navigation' },
  { key: 'g S', description: 'Go to Store', category: 'Navigation' },
  { key: 'g g', description: 'Go to Mini-Games', category: 'Navigation' },
  { key: 'g s', description: 'Go to Settings', category: 'Navigation' },
  // Vim-style
  { key: 'j', description: 'Scroll down', category: 'Navigation' },
  { key: 'k', description: 'Scroll up', category: 'Navigation' },
  { key: 'gg', description: 'Go to top', category: 'Navigation' },
  { key: 'G', description: 'Go to bottom', category: 'Navigation' },
  // Actions
  { key: 'n', description: 'Click primary button', category: 'Actions' },
  { key: '/', description: 'Focus search', category: 'Actions' },
  { key: 'Esc', description: 'Close modal / Blur input', category: 'Actions' },
  { key: '?', description: 'Show this help', category: 'Help' },
]

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('All')

  const categories = ['All', ...new Set(GAME_SHORTCUTS.map(s => s.category))]

  const filteredShortcuts = activeCategory === 'All'
    ? GAME_SHORTCUTS
    : GAME_SHORTCUTS.filter(s => s.category === activeCategory)

  // Listen for '?' key to toggle help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
          e.preventDefault()
          setIsOpen(prev => !prev)
        }
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (!isOpen) return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-16 sm:bottom-4 left-4 z-40 w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 text-lg flex items-center justify-center shadow-lg transition-colors active:scale-95 touch-manipulation"
      title="Keyboard Shortcuts (?)"
      aria-label="Show keyboard shortcuts"
    >
      ⌨️
    </button>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
    >
      <div
        className="bg-slate-800 rounded-xl border border-amber-600/50 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-amber-900/50 to-slate-800 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 id="keyboard-shortcuts-title" className="text-lg font-bold text-amber-400 flex items-center gap-2">
            ⌨️ Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white text-xl transition-colors"
            aria-label="Close keyboard shortcuts"
          >
            ✕
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 px-6 pt-4 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="grid gap-2">
            {filteredShortcuts.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-700/50"
              >
                <span className="text-slate-300">{shortcut.description}</span>
                <kbd className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-amber-400 font-mono text-sm">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50">
          <p className="text-slate-500 text-sm text-center">
            Press <kbd className="px-2 py-0.5 bg-slate-700 rounded text-amber-400 font-mono text-xs">?</kbd> to toggle this help
          </p>
        </div>
      </div>
    </div>
  )
}
