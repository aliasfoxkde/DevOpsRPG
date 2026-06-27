import { useState } from 'react'
import { useGame } from '../../contexts/GameContext'
import { CommandTyper } from './CommandTyper'
import { MemoryMatch } from './MemoryMatch'
import { MathChallengeGame } from './MathChallenge'
import { CodePuzzleGame } from './CodePuzzle'
import { QuizDashGame } from './QuizDash'
import { TerminalSimulator } from './TerminalSimulator'
import { IncidentSimulator } from './IncidentSimulator'

type GameType = 'menu' | 'command' | 'memory' | 'math' | 'code' | 'quiz' | 'terminal' | 'incident'

interface MiniGameHubProps {
  onClose: () => void
}

const UNLOCK_LEVEL = 3

export function MiniGameHub({ onClose }: MiniGameHubProps) {
  const { game, addXP, addGold, grantBadge, incrementStat } = useGame()
  const { character } = game
  const [currentGame, setCurrentGame] = useState<GameType>('menu')
  const [gameResult, setGameResult] = useState<{ score: number; maxScore: number } | null>(null)

  const isUnlocked = character.level >= UNLOCK_LEVEL

  const handleGameComplete = (score: number, maxScore: number) => {
    setGameResult({ score, maxScore })
    // Award bonus XP based on performance
    const xpBonus = Math.round((score / maxScore) * 50)
    const goldBonus = Math.round((score / maxScore) * 25)
    addXP(xpBonus)
    addGold(goldBonus)

    // Check for badges
    if (score >= maxScore * 0.8) {
      grantBadge('speed_demon')
    }

    // Track minigame completion stats
    const statType: 'typer' | 'memory' | 'math' | 'minigame' | 'quiz' =
      currentGame === 'command' ? 'typer' :
      currentGame === 'memory' ? 'memory' :
      currentGame === 'math' ? 'math' :
      currentGame === 'quiz' ? 'quiz' :
      'minigame'
    incrementStat(statType)
  }

  const handleSkip = () => {
    setCurrentGame('menu')
    setGameResult(null)
  }

  const renderMenu = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">🎮 Mini-Games</h2>
      {!isUnlocked && (
        <p className="text-amber-400 text-center mb-4 text-sm">
          🔒 Unlocks at Level {UNLOCK_LEVEL} (Current: Level {character.level})
        </p>
      )}
      <p className="text-slate-400 text-center mb-8">
        {isUnlocked
          ? 'Practice your DevOps skills and earn bonus rewards!'
          : 'Complete more quests to unlock mini-games!'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => isUnlocked && setCurrentGame('command')}
          disabled={!isUnlocked}
          aria-label={isUnlocked ? 'Play Command Typer game' : `Command Typer - requires level ${UNLOCK_LEVEL}`}
          aria-disabled={!isUnlocked}
          className={`p-6 rounded-xl border transition-all group focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            isUnlocked
              ? 'bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-700/50 hover:border-orange-500'
              : 'bg-slate-800/30 border-slate-700/50 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className={`text-4xl mb-3 ${!isUnlocked && 'grayscale'}`}>⌨️</div>
          <h3 className="text-lg font-bold text-white mb-1">Command Typer</h3>
          <p className="text-sm text-slate-400">Type DevOps commands quickly and accurately</p>
          <div className="mt-3 text-xs text-orange-400">+50 XP potential</div>
          {!isUnlocked && <div className="mt-2 text-xs text-slate-500">Level {UNLOCK_LEVEL} to unlock</div>}
        </button>

        <button
          onClick={() => isUnlocked && setCurrentGame('memory')}
          disabled={!isUnlocked}
          aria-label={isUnlocked ? 'Play Memory Match game' : `Memory Match - requires level ${UNLOCK_LEVEL}`}
          aria-disabled={!isUnlocked}
          className={`p-6 rounded-xl border transition-all group focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            isUnlocked
              ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-700/50 hover:border-purple-500'
              : 'bg-slate-800/30 border-slate-700/50 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className={`text-4xl mb-3 ${!isUnlocked && 'grayscale'}`}>🧠</div>
          <h3 className="text-lg font-bold text-white mb-1">Memory Match</h3>
          <p className="text-sm text-slate-400">Match DevOps icons and concepts</p>
          <div className="mt-3 text-xs text-purple-400">+50 XP potential</div>
          {!isUnlocked && <div className="mt-2 text-xs text-slate-500">Level {UNLOCK_LEVEL} to unlock</div>}
        </button>

        <button
          onClick={() => isUnlocked && setCurrentGame('math')}
          disabled={!isUnlocked}
          aria-label={isUnlocked ? 'Play Math Challenge game' : `Math Challenge - requires level ${UNLOCK_LEVEL}`}
          aria-disabled={!isUnlocked}
          className={`p-6 rounded-xl border transition-all group focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            isUnlocked
              ? 'bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-700/50 hover:border-cyan-500'
              : 'bg-slate-800/30 border-slate-700/50 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className={`text-4xl mb-3 ${!isUnlocked && 'grayscale'}`}>🔢</div>
          <h3 className="text-lg font-bold text-white mb-1">Math Challenge</h3>
          <p className="text-sm text-slate-400">Solve DevOps calculation problems</p>
          <div className="mt-3 text-xs text-cyan-400">+75 XP potential</div>
          {!isUnlocked && <div className="mt-2 text-xs text-slate-500">Level {UNLOCK_LEVEL} to unlock</div>}
        </button>

        <button
          onClick={() => isUnlocked && setCurrentGame('code')}
          disabled={!isUnlocked}
          aria-label={isUnlocked ? 'Play Code Puzzle game' : `Code Puzzle - requires level ${UNLOCK_LEVEL}`}
          aria-disabled={!isUnlocked}
          className={`p-6 rounded-xl border transition-all group focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            isUnlocked
              ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-700/50 hover:border-green-500'
              : 'bg-slate-800/30 border-slate-700/50 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className={`text-4xl mb-3 ${!isUnlocked && 'grayscale'}`}>💻</div>
          <h3 className="text-lg font-bold text-white mb-1">Code Puzzle</h3>
          <p className="text-sm text-slate-400">Complete code snippets and find bugs</p>
          <div className="mt-3 text-xs text-green-400">+50 XP potential</div>
          {!isUnlocked && <div className="mt-2 text-xs text-slate-500">Level {UNLOCK_LEVEL} to unlock</div>}
        </button>

        <button
          onClick={() => isUnlocked && setCurrentGame('quiz')}
          disabled={!isUnlocked}
          aria-label={isUnlocked ? 'Play Quiz Dash game' : `Quiz Dash - requires level ${UNLOCK_LEVEL}`}
          aria-disabled={!isUnlocked}
          className={`p-6 rounded-xl border transition-all group focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            isUnlocked
              ? 'bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-700/50 hover:border-red-500'
              : 'bg-slate-800/30 border-slate-700/50 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className={`text-4xl mb-3 ${!isUnlocked && 'grayscale'}`}>⚡</div>
          <h3 className="text-lg font-bold text-white mb-1">Quiz Dash</h3>
          <p className="text-sm text-slate-400">Rapid-fire DevOps quiz challenge!</p>
          <div className="mt-3 text-xs text-red-400">+75 XP potential</div>
          {!isUnlocked && <div className="mt-2 text-xs text-slate-500">Level {UNLOCK_LEVEL} to unlock</div>}
        </button>

        <button
          onClick={() => isUnlocked && setCurrentGame('terminal')}
          disabled={!isUnlocked}
          aria-label={isUnlocked ? 'Play Incident Simulator game' : `Incident Simulator - requires level ${UNLOCK_LEVEL}`}
          aria-disabled={!isUnlocked}
          className={`p-6 rounded-xl border transition-all group focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            isUnlocked
              ? 'bg-gradient-to-br from-slate-900/30 to-slate-800/30 border-slate-600/50 hover:border-slate-400'
              : 'bg-slate-800/30 border-slate-700/50 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className={`text-4xl mb-3 ${!isUnlocked && 'grayscale'}`}>💻</div>
          <h3 className="text-lg font-bold text-white mb-1">Terminal Simulator</h3>
          <p className="text-sm text-slate-400">Type real DevOps commands</p>
          <div className="mt-3 text-xs text-slate-400">+100 XP potential</div>
          {!isUnlocked && <div className="mt-2 text-xs text-slate-500">Level {UNLOCK_LEVEL} to unlock</div>}
        </button>

        <button
          onClick={() => isUnlocked && setCurrentGame('incident')}
          disabled={!isUnlocked}
          aria-label={isUnlocked ? 'Play Incident Response game' : `Incident Response - requires level ${UNLOCK_LEVEL}`}
          aria-disabled={!isUnlocked}
          className={`p-6 rounded-xl border transition-all group focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            isUnlocked
              ? 'bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-700/50 hover:border-red-500'
              : 'bg-slate-800/30 border-slate-700/50 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className={`text-4xl mb-3 ${!isUnlocked && 'grayscale'}`}>🚨</div>
          <h3 className="text-lg font-bold text-white mb-1">Incident Response</h3>
          <p className="text-sm text-slate-400">Handle production emergencies</p>
          <div className="mt-3 text-xs text-red-400">+350 XP potential</div>
          {!isUnlocked && <div className="mt-2 text-xs text-slate-500">Level {UNLOCK_LEVEL} to unlock</div>}
        </button>
      </div>

      <button
        onClick={onClose}
        aria-label="Back to Game"
        className="mt-8 w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        Back to Game
      </button>
    </div>
  )

  const renderResult = () => {
    if (!gameResult) return null

    const percentage = Math.round((gameResult.score / gameResult.maxScore) * 100)
    const xpEarned = Math.round((gameResult.score / gameResult.maxScore) * 50)
    const goldEarned = Math.round((gameResult.score / gameResult.maxScore) * 25)

    return (
      <div className="p-6 text-center">
        <div className="text-6xl mb-4">{percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}</div>
        <h3 className="text-2xl font-bold text-white mb-2">
          {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
        </h3>

        <div className="my-6 space-y-3">
          <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
            <span className="text-slate-400">Score</span>
            <span className="text-amber-400 font-bold">{gameResult.score} / {gameResult.maxScore}</span>
          </div>
          <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
            <span className="text-slate-400">Accuracy</span>
            <span className="text-white font-bold">{percentage}%</span>
          </div>
          <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
            <span className="text-slate-400">XP Earned</span>
            <span className="text-green-400 font-bold">+{xpEarned} XP</span>
          </div>
          <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
            <span className="text-slate-400">Gold Earned</span>
            <span className="text-yellow-400 font-bold">+{goldEarned} 🪙</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setGameResult(null)
              setCurrentGame('menu')
            }}
            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            More Games
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-800 rounded-2xl border border-amber-600/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {currentGame === 'menu' && '🎮 Mini-Games'}
            {currentGame === 'command' && '⌨️ Command Typer'}
            {currentGame === 'memory' && '🧠 Memory Match'}
            {currentGame === 'math' && '🔢 Math Challenge'}
            {currentGame === 'code' && '💻 Code Puzzle'}
            {currentGame === 'quiz' && '⚡ Quiz Dash'}
            {currentGame === 'terminal' && '💻 Terminal Simulator'}
            {currentGame === 'incident' && '🚨 Incident Response'}
            {gameResult && '✨ Results'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto">
          {gameResult ? renderResult() :
           currentGame === 'menu' ? renderMenu() :
           currentGame === 'command' ? (
             <CommandTyper
               rounds={5}
               onComplete={handleGameComplete}
               onSkip={handleSkip}
             />
           ) : currentGame === 'memory' ? (
             <MemoryMatch
               pairs={6}
               onComplete={handleGameComplete}
               onSkip={handleSkip}
             />
           ) : currentGame === 'math' ? (
             <MathChallengeGame
               rounds={5}
               onComplete={handleGameComplete}
               onSkip={handleSkip}
             />
           ) : currentGame === 'quiz' ? (
             <QuizDashGame
               onComplete={handleGameComplete}
               onSkip={handleSkip}
             />
           ) : currentGame === 'terminal' ? (
             <TerminalSimulator
               onComplete={handleGameComplete}
             />
           ) : currentGame === 'incident' ? (
             <IncidentSimulator
               onComplete={handleGameComplete}
             />
           ) : (
             <CodePuzzleGame
               rounds={5}
               onComplete={handleGameComplete}
               onSkip={handleSkip}
             />
           )}
        </div>
      </div>
    </div>
  )
}
