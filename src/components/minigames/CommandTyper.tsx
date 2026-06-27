import { useState, useEffect, useRef, useCallback } from 'react'
import { getRandomCommands, type Command } from '../../data/minigames'
import { GAME_DURATION } from '../../utils/gameUtils'

interface CommandTyperProps {
  category?: Command['category']
  rounds?: number
  onComplete: (score: number, maxScore: number) => void
  onSkip: () => void
}

export function CommandTyper({ category, rounds = 5, onComplete, onSkip }: CommandTyperProps) {
  const [gameCommands] = useState<Command[]>(() => getRandomCommands(rounds, category))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [input, setInput] = useState('')
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION.COMMAND_TYPER)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing')
  // Initialize charStates based on first command - must stay in sync with gameCommands
  const [charStates, setCharStates] = useState<('correct' | 'wrong' | 'pending')[]>(() =>
    new Array(gameCommands[0]?.command.length || 0).fill('pending')
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const currentCommand = gameCommands[currentIndex]
  const maxScore = rounds * 100

  // Declare callbacks before useEffect that depends on them
  const handleFinish = useCallback(() => {
    setGameState('finished')
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const handleComplete = useCallback(() => {
    onComplete(score, maxScore)
  }, [onComplete, score, maxScore])

  const checkAnswer = useCallback(() => {
    if (!currentCommand || input.trim() === '') return

    const isCorrect = input.trim() === currentCommand.command

    if (isCorrect) {
      setCorrectCount(c => c + 1)
      // Base score + time bonus
      const timeBonus = Math.floor(timeLeft / 3) * 10
      const roundScore = 100 + timeBonus
      setScore(s => s + roundScore)
    } else {
      setWrongCount(c => c + 1)
    }

    // Move to next or finish
    if (currentIndex < gameCommands.length - 1) {
      setCurrentIndex(i => i + 1)
      setInput('')
    } else {
      handleFinish()
    }
  }, [currentCommand, input, currentIndex, gameCommands.length, timeLeft, handleFinish])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleFinish()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState, currentIndex, handleFinish])

  // Update character states as user types
  useEffect(() => {
    if (!currentCommand) return

    const target = currentCommand.command
    const newCharStates: ('correct' | 'wrong' | 'pending')[] = []

    for (let i = 0; i < target.length; i++) {
      if (i < input.length) {
        newCharStates.push(input[i] === target[i] ? 'correct' : 'wrong')
      } else {
        newCharStates.push('pending')
      }
    }

    requestAnimationFrame(() => {
      setCharStates(newCharStates)
    })
  }, [input, currentCommand])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'playing') return
    setInput(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkAnswer()
    }
  }

  // Focus input on mount and whenever window is clicked
  useEffect(() => {
    const handleClick = () => inputRef.current?.focus()
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  if (gameCommands.length === 0) {
    return (
      <div className="bg-slate-800/80 rounded-xl border border-amber-600/50 p-6 text-center">
        <p className="text-slate-400">Loading commands...</p>
      </div>
    )
  }

  if (gameState === 'finished') {
    const percentage = Math.round((correctCount / rounds) * 100)
    const passed = percentage >= 60

    return (
      <div className="bg-slate-800/80 rounded-xl border border-amber-600/50 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            ⌨️ Command Typer Complete!
          </h2>
        </div>
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">{passed ? '🎉' : '💪'}</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {passed ? 'Commands Mastered!' : 'Keep Practicing!'}
          </h3>
          <p className="text-slate-300 mb-4">
            You typed {correctCount} out of {rounds} commands correctly ({percentage}%)
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">{correctCount}</div>
              <div className="text-xs text-slate-400">Correct</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-400">{wrongCount}</div>
              <div className="text-xs text-slate-400">Wrong</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-amber-400">{score}</div>
              <div className="text-xs text-slate-400">Score</div>
            </div>
          </div>

          {passed && (
            <div className="text-green-400 mb-4">
              +{Math.round(score / 2)} Bonus XP earned!
            </div>
          )}

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={passed ? handleComplete : onSkip}
              className={`px-8 py-3 font-bold rounded-lg shadow-lg transform transition-all hover:scale-105 ${
                passed
                  ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white'
                  : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white'
              }`}
            >
              {passed ? '✨ Claim Rewards' : '🔄 Practice More'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/80 rounded-xl border border-amber-600/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            ⌨️ Command Typer
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-400">✓ {correctCount}</span>
            <span className="text-red-400">✗ {wrongCount}</span>
            <span className="text-slate-400">{currentIndex + 1}/{rounds}</span>
            <span className={`font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
              ⏱ {timeLeft}s
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Command display */}
        <div className="mb-6">
          <p className="text-slate-400 text-sm mb-2">{currentCommand?.description}</p>
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-lg">
            <span className="text-slate-500">$ </span>
            {charStates.map((state, i) => (
              <span
                key={i}
                className={
                  state === 'correct' ? 'text-green-400' :
                  state === 'wrong' ? 'text-red-400 bg-red-900/30' :
                  'text-slate-500'
                }
              >
                {currentCommand?.command[i] || ' '}
              </span>
            ))}
            <span className="animate-blink">▋</span>
          </div>
        </div>

        {/* Input */}
        <div className="mb-6">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type the command..."
            className="w-full p-4 rounded-lg bg-slate-900 border border-slate-700 text-white text-lg font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / rounds) * 100}%` }}
            />
          </div>
        </div>

        {/* Category indicator */}
        <div className="text-center">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
            currentCommand?.category === 'git' ? 'bg-orange-900/50 text-orange-400' :
            currentCommand?.category === 'docker' ? 'bg-blue-900/50 text-blue-400' :
            currentCommand?.category === 'bash' ? 'bg-green-900/50 text-green-400' :
            currentCommand?.category === 'kubernetes' ? 'bg-purple-900/50 text-purple-400' :
            currentCommand?.category === 'aws' ? 'bg-yellow-900/50 text-yellow-400' :
            'bg-slate-700 text-slate-400'
          }`}>
            {currentCommand?.category.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  )
}
