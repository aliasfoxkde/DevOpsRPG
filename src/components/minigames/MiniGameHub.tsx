import { useState } from 'react'
import { useGame } from '../../contexts/GameContext'
import { MINI_GAMES, MINI_GAME_UNLOCK_LEVEL, miniGameById, type MiniGameId } from './gameCatalog'
import { CommandTyper } from './CommandTyper'
import { MemoryMatch } from './MemoryMatch'
import { MathChallengeGame } from './MathChallenge'
import { CodePuzzleGame } from './CodePuzzle'
import { QuizDashGame } from './QuizDash'
import { TerminalSimulator } from './TerminalSimulator'
import { IncidentSimulator } from './IncidentSimulator'

type HubView = 'menu' | MiniGameId

interface MiniGameHubProps {
  onClose: () => void
  /** Open straight onto one game instead of the menu. */
  initialGame?: MiniGameId
}

/**
 * Share of a round's maximum score that the player actually hit.
 *
 * The Terminal and Incident simulators report `(score, xpEarned)` rather than
 * `(score, maxScore)`, so a run that earns nothing arrives with a zero
 * denominator. Every reward below divides by it, so treat that as a 0% round
 * instead of letting the bonus maths turn into NaN XP, NaN gold and a
 * wrongly granted speed badge.
 */
function accuracyRatio(score: number, maxScore: number): number {
  return maxScore > 0 ? score / maxScore : 0
}

export function MiniGameHub({ onClose, initialGame }: MiniGameHubProps) {
  const { game, rewardBonuses, addXP, addGold, grantBadge, incrementStat } = useGame()
  const { character } = game
  const [currentGame, setCurrentGame] = useState<HubView>(initialGame ?? 'menu')
  const [gameResult, setGameResult] = useState<{ score: number; maxScore: number } | null>(null)

  const isUnlocked = character.level >= MINI_GAME_UNLOCK_LEVEL

  const handleGameComplete = (score: number, maxScore: number) => {
    setGameResult({ score, maxScore })
    // The payout caps come straight from the catalog, so a round can never pay
    // less than its menu tile advertised.
    const rewards = miniGameById(currentGame as MiniGameId)
    const ratio = accuracyRatio(score, maxScore)
    addXP(Math.round(ratio * rewards.xpPotential))
    addGold(Math.round(ratio * rewards.goldPotential))

    // Check for badges
    if (ratio >= 0.8) {
      grantBadge('speed_demon')
    }

    // Track minigame completion stats
    const statType: 'typer' | 'memory' | 'math' | 'minigame' | 'quiz' =
      currentGame === 'command'
        ? 'typer'
        : currentGame === 'memory'
          ? 'memory'
          : currentGame === 'math'
            ? 'math'
            : currentGame === 'quiz'
              ? 'quiz'
              : 'minigame'
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
          🔒 Unlocks at Level {MINI_GAME_UNLOCK_LEVEL} (Current: Level {character.level})
        </p>
      )}
      <p className="text-slate-400 text-center mb-8">
        {isUnlocked
          ? 'Practice your DevOps skills and earn bonus rewards!'
          : 'Complete more quests to unlock mini-games!'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MINI_GAMES.map((entry) => (
          <button
            key={entry.id}
            onClick={() => {
              if (isUnlocked) setCurrentGame(entry.id)
            }}
            disabled={!isUnlocked}
            aria-label={
              isUnlocked
                ? `Play ${entry.name} game`
                : `${entry.name} - requires level ${MINI_GAME_UNLOCK_LEVEL}`
            }
            aria-disabled={!isUnlocked}
            className={`p-6 rounded-xl border transition-all group focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              isUnlocked
                ? `bg-gradient-to-br ${entry.tileGradient}`
                : 'bg-slate-800/30 border-slate-700/50 grayscale cursor-not-allowed'
            }`}
          >
            <div className={`text-4xl mb-3 ${!isUnlocked && 'grayscale'}`}>{entry.icon}</div>
            <h3 className="text-lg font-bold text-white mb-1">{entry.name}</h3>
            <p className="text-sm text-slate-400">{entry.description}</p>
            <div className={`mt-3 text-xs ${entry.accent}`}>
              +{entry.xpPotential} XP potential
            </div>
            {!isUnlocked && (
              <div className="mt-2 text-xs text-slate-500">Level {MINI_GAME_UNLOCK_LEVEL} to unlock</div>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={onClose}
        aria-label="Back to Game"
        className="mt-8 w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        Back to Game
      </button>
    </div>
  )

  const renderResult = () => {
    if (!gameResult || currentGame === 'menu') return null

    const rewards = miniGameById(currentGame)
    const ratio = accuracyRatio(gameResult.score, gameResult.maxScore)
    // The time bonus can push the raw score past maxScore; accuracy itself
    // is still capped at a perfect score.
    const percentage = Math.min(100, Math.round(ratio * 100))
    // Display the amounts that actually land in the save (addXP/addGold apply
    // the same multipliers), not the raw pre-bonus roll.
    const xpEarned = Math.floor(
      Math.round(ratio * rewards.xpPotential) * rewardBonuses.xpMultiplier,
    )
    const goldEarned = Math.floor(
      Math.round(ratio * rewards.goldPotential) * rewardBonuses.goldMultiplier,
    )

    return (
      <div className="p-6 text-center">
        <div className="text-6xl mb-4">
          {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
        </h3>

        <div className="my-6 space-y-3">
          <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
            <span className="text-slate-400">Score</span>
            <span className="text-amber-400 font-bold">
              {gameResult.score} / {gameResult.maxScore}
            </span>
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

  const renderGame = () => {
    switch (currentGame) {
      case 'command':
        return <CommandTyper rounds={5} onComplete={handleGameComplete} onSkip={handleSkip} />
      case 'memory':
        return <MemoryMatch pairs={6} onComplete={handleGameComplete} onSkip={handleSkip} />
      case 'math':
        return <MathChallengeGame rounds={5} onComplete={handleGameComplete} onSkip={handleSkip} />
      case 'quiz':
        return <QuizDashGame onComplete={handleGameComplete} onSkip={handleSkip} />
      case 'terminal':
        return <TerminalSimulator onComplete={handleGameComplete} />
      case 'incident':
        return <IncidentSimulator onComplete={handleGameComplete} />
      case 'code':
        return <CodePuzzleGame rounds={5} onComplete={handleGameComplete} onSkip={handleSkip} />
      case 'menu':
        return renderMenu()
    }
  }

  const heading =
    currentGame === 'menu' ? '🎮 Mini-Games' : (() => {
      const entry = miniGameById(currentGame)
      return `${entry.icon} ${entry.name}`
    })()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-800 rounded-2xl border border-amber-600/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {heading}
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
          {gameResult ? renderResult() : renderGame()}
        </div>
      </div>
    </div>
  )
}
