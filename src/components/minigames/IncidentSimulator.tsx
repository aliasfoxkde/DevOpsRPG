import { useState, useEffect, useCallback } from 'react'
import { useGame } from '../../contexts/GameContext'
import { INCIDENT_SCENARIOS, SEVERITY_COLORS, type IncidentScenario, type DiagnosticStep, type ResolutionStep } from '../../data/incidentScenarios'

interface IncidentSimulatorProps {
  onComplete?: (score: number, xpEarned: number) => void
}

type GameState = 'menu' | 'diagnosing' | 'resolving' | 'complete'
type Phase = 'diagnostics' | 'resolution'

interface TimerState {
  remaining: number
  penalty: number
}

export function IncidentSimulator({ onComplete }: IncidentSimulatorProps) {
  const { addXP, addGold } = useGame()

  // Game state
  const [gameState, setGameState] = useState<GameState>('menu')
  const [selectedScenario, setSelectedScenario] = useState<IncidentScenario | null>(null)
  const [phase, setPhase] = useState<Phase>('diagnostics')
  const [timer, setTimer] = useState<TimerState>({ remaining: 0, penalty: 0 })
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'hint'; message: string } | null>(null)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [showHint, setShowHint] = useState(false)
  const [finalScore, setFinalScore] = useState(0)

  const currentSteps = phase === 'diagnostics' ? selectedScenario?.diagnostics || [] : selectedScenario?.resolution || []
  const currentStep = currentSteps[currentStepIndex]

  // Timer effect
  useEffect(() => {
    if (gameState !== 'diagnosing' && gameState !== 'resolving') return

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev.remaining <= 0) {
          clearInterval(interval)
          // Timer expired - complete will be handled via gameState change
          return prev
        }
        const newRemaining = prev.remaining - 1
        if (newRemaining <= 0) {
          clearInterval(interval)
        }
        return { ...prev, remaining: newRemaining }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [gameState])

  // Handle time expiration - triggered when timer reaches 0
  useEffect(() => {
    if (timer.remaining <= 0 && (gameState === 'diagnosing' || gameState === 'resolving') && selectedScenario) {
      // Use setTimeout to avoid calling handleComplete synchronously
      const timeout = setTimeout(() => {
        if (!selectedScenario) return

        const timeBonus = Math.max(0, Math.round((timer.remaining / selectedScenario.estimatedTime) * 100))
        const accuracyBonus = Math.round((completedSteps.length / (selectedScenario.diagnostics.length + selectedScenario.resolution.length)) * 100)
        const penaltyFactor = Math.max(0, 1 - (timer.penalty / 60))
        const score = Math.round((timeBonus * 0.3 + accuracyBonus * 0.7) * penaltyFactor)

        setFinalScore(score)
        setGameState('complete')

        const xpEarned = Math.round((score / 100) * selectedScenario.xpReward)
        const goldEarned = Math.round((score / 100) * selectedScenario.goldReward)

        addXP(xpEarned)
        addGold(goldEarned)
        onComplete?.(score, xpEarned)
      }, 0)
      return () => clearTimeout(timeout)
    }
  }, [timer.remaining, gameState, selectedScenario, timer.penalty, completedSteps, addXP, addGold, onComplete])

  const startGame = useCallback((scenario: IncidentScenario) => {
    setSelectedScenario(scenario)
    setPhase('diagnostics')
    setTimer({ remaining: scenario.estimatedTime, penalty: 0 })
    setCurrentStepIndex(0)
    setInput('')
    setFeedback(null)
    setShowHint(false)
    setCompletedSteps([])
    setGameState('diagnosing')
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentStep || !input.trim()) return

    const isCorrect = input.trim().toLowerCase() === currentStep.command?.toLowerCase()

    if (isCorrect) {
      const clue = 'revealsClue' in currentStep ? currentStep.revealsClue : 'Correct!'
      setFeedback({ type: 'success', message: clue })
      setCompletedSteps(prev => [...prev, currentStep.id])
      setInput('')
      setShowHint(false)

      // Move to next step or next phase
      if (currentStepIndex < currentSteps.length - 1) {
        setTimeout(() => {
          setCurrentStepIndex(prev => prev + 1)
          setFeedback(null)
        }, 1500)
      } else if (phase === 'diagnostics') {
        // Move to resolution phase
        setTimeout(() => {
          setPhase('resolution')
          setCurrentStepIndex(0)
          setFeedback(null)
          setGameState('resolving')
        }, 1500)
      } else {
        // All done!
        setTimeout(() => {
          handleComplete()
        }, 1500)
      }
    } else {
      setFeedback({ type: 'error', message: 'Incorrect command. Try again or use a hint.' })
      setTimer(prev => ({ ...prev, penalty: prev.penalty + (currentStep as DiagnosticStep).timePenalty }))
      setInput('')
    }
  }

  const handleComplete = useCallback(() => {
    if (!selectedScenario) return

    const timeBonus = Math.max(0, Math.round((timer.remaining / selectedScenario.estimatedTime) * 100))
    const accuracyBonus = Math.round((completedSteps.length / (selectedScenario.diagnostics.length + selectedScenario.resolution.length)) * 100)
    const penaltyFactor = Math.max(0, 1 - (timer.penalty / 60)) // Reduce score for penalties
    const score = Math.round((timeBonus * 0.3 + accuracyBonus * 0.7) * penaltyFactor)

    setFinalScore(score)
    setGameState('complete')

    const xpEarned = Math.round((score / 100) * selectedScenario.xpReward)
    const goldEarned = Math.round((score / 100) * selectedScenario.goldReward)

    addXP(xpEarned)
    addGold(goldEarned)
    onComplete?.(score, xpEarned)
  }, [selectedScenario, timer, completedSteps, addXP, addGold, onComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.abs(seconds) / 60)
    const secs = Math.abs(seconds) % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleExit = () => {
    setGameState('menu')
    setSelectedScenario(null)
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-3">
          <span className="text-xl">🚨</span>
          <span className="text-slate-300 font-medium">Incident Response Simulator</span>
        </div>
        {selectedScenario && gameState !== 'menu' && (
          <div className="flex items-center gap-4">
            <span className={`font-mono text-sm ${timer.remaining < 30 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
              ⏱️ {formatTime(timer.remaining)}
            </span>
            {timer.penalty > 0 && (
              <span className="text-red-400 text-sm">+{timer.penalty}s penalty</span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Menu State */}
        {gameState === 'menu' && (
          <div>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🚨</div>
              <h2 className="text-2xl font-bold text-white mb-2">Incident Response Training</h2>
              <p className="text-slate-400 max-w-md mx-auto">
                Practice handling real-world incidents. Diagnose problems, run the right commands,
                and resolve issues before time runs out!
              </p>
            </div>

            {/* Scenario Selection */}
            <div className="space-y-3 max-w-2xl mx-auto">
              {INCIDENT_SCENARIOS.map(scenario => {
                const severity = SEVERITY_COLORS[scenario.severity]
                return (
                  <button
                    key={scenario.id}
                    onClick={() => startGame(scenario)}
                    className={`w-full p-4 rounded-xl border text-left transition-all hover:scale-[1.01] ${severity.bg} ${severity.border}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{scenario.icon}</span>
                        <div>
                          <h3 className="font-bold text-white">{scenario.title}</h3>
                          <p className="text-sm text-slate-400 mt-1">{scenario.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${severity.text}`}>
                              {severity.label}
                            </span>
                            <span className="text-xs text-slate-500">
                              Est. {Math.floor(scenario.estimatedTime / 60)}m
                            </span>
                            <span className="text-xs text-amber-400">
                              +{scenario.xpReward} XP
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Playing State */}
        {(gameState === 'diagnosing' || gameState === 'resolving') && selectedScenario && (
          <div>
            {/* Phase indicator */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className={`px-4 py-2 rounded-lg ${phase === 'diagnostics' ? 'bg-amber-600' : 'bg-slate-700'}`}>
                <span className="text-white font-medium">🔍 Diagnostics</span>
              </div>
              <div className="text-slate-500">→</div>
              <div className={`px-4 py-2 rounded-lg ${phase === 'resolution' ? 'bg-green-600' : 'bg-slate-700'}`}>
                <span className="text-white font-medium">✅ Resolution</span>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Progress</span>
                <span className="text-white">{currentStepIndex + 1} / {currentSteps.length}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-green-500 transition-all"
                  style={{ width: `${((currentStepIndex + (phase === 'resolution' ? selectedScenario.diagnostics.length : 0)) / (selectedScenario.diagnostics.length + selectedScenario.resolution.length)) * 100}%` }}
                />
              </div>
            </div>

            {/* Scenario Info */}
            <div className={`p-4 rounded-xl mb-4 ${SEVERITY_COLORS[selectedScenario.severity].bg} border ${SEVERITY_COLORS[selectedScenario.severity].border}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{selectedScenario.icon}</span>
                <h3 className="text-lg font-bold text-white">{selectedScenario.title}</h3>
              </div>
              <p className="text-sm text-slate-300">{selectedScenario.description}</p>

              {/* Symptoms (shown during diagnostics) */}
              {phase === 'diagnostics' && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 uppercase mb-1">Observed Symptoms:</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    {selectedScenario.symptoms.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-400">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Current Step */}
            {currentStep && (
              <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-700">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold">
                    {currentStepIndex + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{currentStep.action}</p>
                    {currentStep.command && (
                      <code className="text-sm text-green-400 mt-1 block font-mono">
                        $ {currentStep.command}
                      </code>
                    )}
                    {'verification' in currentStep && phase === 'resolution' && (
                      <p className="text-sm text-blue-400 mt-1">
                        Expected: {(currentStep as ResolutionStep).verification}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Completed Steps */}
            {completedSteps.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-slate-500 mb-2">Completed:</p>
                <div className="flex flex-wrap gap-2">
                  {completedSteps.map(stepId => (
                    <span key={stepId} className="px-2 py-1 bg-green-900/50 text-green-400 rounded text-sm">
                      ✓
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div className={`p-4 rounded-lg mb-4 ${
                feedback.type === 'success' ? 'bg-green-900/50 border border-green-600' :
                feedback.type === 'error' ? 'bg-red-900/50 border border-red-600' :
                'bg-amber-900/50 border border-amber-600'
              }`}>
                <p className={feedback.type === 'success' ? 'text-green-400' : 'text-red-400'}>
                  {feedback.message}
                </p>
              </div>
            )}

            {/* Command Input */}
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className={`w-full bg-slate-800 border-2 ${feedback?.type === 'error' ? 'border-red-500' : 'border-slate-700 focus:border-amber-500'} rounded-lg pl-8 pr-4 py-3 text-white font-mono focus:outline-none`}
                    placeholder="Enter command..."
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors"
                >
                  Run
                </button>
              </div>
            </form>

            {/* Hint Button */}
            {!showHint && currentStep && (
              <button
                onClick={() => setShowHint(true)}
                className="text-sm text-slate-500 hover:text-amber-400 transition-colors"
              >
                💡 Need a hint? (+10s penalty)
              </button>
            )}

            {/* Hint Display */}
            {showHint && currentStep && (
              <div className="mt-3 p-3 bg-amber-900/30 rounded-lg border border-amber-600/30">
                <p className="text-amber-400 text-sm">
                  💡 Hint: Try using <code className="font-mono bg-slate-800 px-1 rounded">{currentStep.command}</code>
                </p>
              </div>
            )}

            {/* Quit Button */}
            <button
              onClick={handleExit}
              className="mt-6 text-sm text-slate-500 hover:text-red-400 transition-colors"
            >
              Abort Incident (abandon scenario)
            </button>
          </div>
        )}

        {/* Complete State */}
        {gameState === 'complete' && selectedScenario && (
          <div className="text-center">
            <div className="text-6xl mb-4">{finalScore >= 80 ? '🏆' : finalScore >= 50 ? '⭐' : '💪'}</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {finalScore >= 80 ? 'Incident Resolved!' : finalScore >= 50 ? 'Good Effort!' : 'Keep Training!'}
            </h2>
            <p className="text-slate-400 mb-6">You handled the {selectedScenario.title} incident!</p>

            {/* Score Breakdown */}
            <div className="bg-slate-800/50 rounded-xl p-6 mb-6 max-w-md mx-auto">
              <div className="text-4xl font-bold text-amber-400 mb-2">{finalScore}%</div>
              <p className="text-slate-400 text-sm mb-4">Performance Score</p>

              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Time remaining</span>
                  <span className="text-white">{formatTime(timer.remaining)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Penalties</span>
                  <span className="text-red-400">+{timer.penalty}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Steps completed</span>
                  <span className="text-green-400">{completedSteps.length} / {selectedScenario.diagnostics.length + selectedScenario.resolution.length}</span>
                </div>
              </div>
            </div>

            {/* Rewards */}
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  +{Math.round((finalScore / 100) * selectedScenario.xpReward)} XP
                </p>
                <p className="text-xs text-slate-500">Experience</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-400">
                  +{Math.round((finalScore / 100) * selectedScenario.goldReward)} 🪙
                </p>
                <p className="text-xs text-slate-500">Gold</p>
              </div>
            </div>

            {/* Root Cause Reveal */}
            <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-left max-w-md mx-auto">
              <p className="text-sm text-slate-500 uppercase mb-1">Root Cause (learned)</p>
              <p className="text-slate-300">{selectedScenario.rootCause}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => startGame(selectedScenario)}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors"
              >
                🔄 Try Another
              </button>
              <button
                onClick={handleExit}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default IncidentSimulator
