import { useState, useEffect } from 'react'

const GAME_SHORTCUTS = [
  { key: 'N', description: 'Auto-solve / Click primary button' },
  { key: 'Esc', description: 'Skip / Close modal' },
  { key: 'g h', description: 'Go to Home' },
  { key: 'g l', description: 'Go to Learn' },
  { key: 'g d', description: 'Go to Dashboard' },
  { key: 'g q', description: 'Go to Quests' },
  { key: 'g c', description: 'Go to Character' },
  { key: 'g r', description: 'Go to Rewards' },
  { key: 'g b', description: 'Go to Badges' },
  { key: 'g w', description: 'Go to World Map' },
]

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)

  // Listen for '?' key to toggle help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div className="bg-slate-800 rounded-xl border border-amber-600/50 shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-amber-900/50 to-slate-800 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
            ⌨️ Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {GAME_SHORTCUTS.map((shortcut) => (
              <div key={shortcut.key} className="flex items-center justify-between">
                <span className="text-slate-300">{shortcut.description}</span>
                <kbd className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-amber-400 font-mono text-sm">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-700">
            <p className="text-slate-500 text-sm text-center">
              Press <kbd className="px-2 py-0.5 bg-slate-700 rounded text-amber-400 font-mono text-xs">?</kbd> or click the keyboard icon to toggle this help
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
