import { useState, useEffect, useRef } from 'react'
import { commands, type Command } from '../../data/minigames'

interface CommandTyperProps {
  onComplete: (score: number, bonusXP: number) => void
  onSkip: () => void
  category?: Command['category']
}

export default function CommandTyper({ onComplete, onSkip, category }: CommandTyperProps) {
  const [pool] = useState<Command[]>(() => {
    const filtered = category
      ? commands.filter(c => c.category === category)
      : commands
    const shuffled = [...filtered].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 10)
  })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [input, setInput] = useState('')
  const [started, setStarted] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [finished, setFinished] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (started && inputRef.current) {
      inputRef.current.focus()
    }
  }, [started])

  const current = pool[currentIndex]

  const handleStart = () => {
    setStarted(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)

    // Auto-advance on exact match
    if (value === current.command) {
      setCorrect(c => c + 1)
      setStreak(s => s + 1)
      setInput('')
      setShowHint(false)

      if (currentIndex < pool.length - 1) {
        setCurrentIndex(i => i + 1)
      } else {
        handleFinish()
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.length > 0) {
      if (input !== current.command) {
        setIncorrect(i => i + 1)
        setStreak(0)
      }
    }
    if (e.key === 'Tab' && !showHint) {
      e.preventDefault()
      setShowHint(true)
    }
    if (e.key === 'Escape') {
      onSkip()
    }
  }

  const handleFinish = () => {
    const accuracy = correct / (correct + incorrect || 1)
    const baseScore = correct * 10
    const streakBonus = Math.floor(streak / 3) * 5
    const accuracyBonus = accuracy > 0.9 ? 50 : accuracy > 0.7 ? 25 : 0
    const totalXP = baseScore + streakBonus + accuracyBonus

    setFinished(true)
    setTimeout(() => onComplete(baseScore + streakBonus + accuracyBonus, totalXP), 1500)
  }

  if (!started) {
    return (
      <div className="bg-slate-800/80 rounded-xl border border-amber-600/50 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            ⌨️ Command Typer
          </h2>
        </div>
        <div className="p-8 text-center">
          <div className="text-6xl mb-6">⌨️</div>
          <h3 className="text-2xl font-bold text-white mb-4">Test Your Command Skills!</h3>
          <p className="text-slate-300 mb-6 max-w-md mx-auto">
            Type DevOps commands as fast as you can. Correct commands auto-advance.
            Press Tab for hints, Enter to check, Esc to skip.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105 text-lg"
            >
              🚀 Start Challenge
            </button>
            <button
              onClick={onSkip}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-lg transition-colors"
            >
              Skip Mini-Game
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="bg-slate-800/80 rounded-xl border border-green-600/50 overflow-hidden">
        <div className="bg-gradient-to-r from-green-900/30 via-slate-800 to-green-900/30 px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            ⌨️ Challenge Complete!
          </h2>
        </div>
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-slate-300">Calculating your score...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/80 rounded-xl border border-amber-600/50 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            ⌨️ Command Typer
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-400">✓ {correct}</span>
            <span className="text-red-400">✗ {incorrect}</span>
            <span className="text-amber-400">🔥 {streak}</span>
            <span className="text-slate-400">{currentIndex + 1}/{pool.length}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-700 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / pool.length) * 100}%` }}
          />
        </div>

        {/* Command to type */}
        <div className="mb-6 text-center">
          <p className="text-slate-400 text-sm mb-2">Type this command:</p>
          <code className="text-2xl font-mono text-green-400 bg-slate-900 px-4 py-2 rounded-lg">
            {current.command}
          </code>
          <p className="text-slate-400 text-sm mt-2">{current.description}</p>
          <p className="text-slate-500 text-xs mt-1">Category: {current.category}</p>
        </div>

        {/* Input */}
        <div className="mb-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full bg-slate-900 border-2 border-slate-600 rounded-lg px-4 py-3 text-xl font-mono text-white focus:outline-none focus:border-amber-500 transition-colors"
            placeholder="Type the command..."
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>

        {/* Hint */}
        {showHint && (
          <div className="mb-4 p-3 bg-amber-900/30 border border-amber-700 rounded-lg">
            <p className="text-amber-400 text-sm">
              💡 Start typing and it will auto-complete when correct!
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Tab = Hint | Enter = Check | Esc = Skip</span>
          <span>{pool.length - currentIndex - 1} remaining</span>
        </div>
      </div>
    </div>
  )
}
