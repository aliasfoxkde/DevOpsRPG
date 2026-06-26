import { useState, useEffect, useCallback } from 'react'
import { useGame } from '../contexts/GameContext'
import {
  PVP_RANKS,
  getRankByPoints,
  getRankProgress,
  generatePVPMatch,
  calculatePVPRewards,
  type PVPMatch,
  type PVPQuestion,
  type PVPMatchResult,
} from '../data/pvpArena'

type MatchState = 'idle' | 'matching' | 'ready' | 'battle' | 'result'

export default function PVPArenaPage() {
  const { addXP, addGold } = useGame()

  // PVP state
  const [matchState, setMatchState] = useState<MatchState>('idle')
  const [currentMatch, setCurrentMatch] = useState<PVPMatch | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [matchResult, setMatchResult] = useState<PVPMatchResult | null>(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [correctCount, setCorrectCount] = useState(0)
  const [matchStartTime, setMatchStartTime] = useState<number | null>(null)

  // PVP stats (placeholder - would need to add to GameState)
  const pvpPoints = 0
  const pvpWins = 0
  const pvpLosses = 0
  const pvpStreak = 0

  const currentRank = getRankByPoints(pvpPoints)
  const rankProgress = getRankProgress(pvpPoints)

  // Reset match state
  const resetMatch = useCallback(() => {
    setMatchState('idle')
    setCurrentMatch(null)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setMatchResult(null)
    setTimeLeft(60)
    setCorrectCount(0)
    setMatchStartTime(null)
  }, [])

  // Start matchmaking
  const startMatchmaking = () => {
    setMatchState('matching')
    setTimeout(() => {
      const match = generatePVPMatch(pvpPoints)
      setCurrentMatch(match)
      setMatchState('ready')
    }, 2000) // 2 second "matching" animation
  }

  // Start the battle
  const startBattle = () => {
    setMatchState('battle')
    setMatchStartTime(Date.now())
  }

  // Handle answer selection
  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return // Already answered

    setSelectedAnswer(answerIndex)

    const isCorrect = answerIndex === currentMatch!.questions[currentQuestionIndex].correctIndex
    if (isCorrect) {
      setCorrectCount(prev => prev + 1)
    }

    // Wait 1 second then move to next
    setTimeout(() => {
      setSelectedAnswer(null)

      if (currentQuestionIndex < currentMatch!.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
      } else {
        // Match complete
        finishMatch(correctCount + (isCorrect ? 1 : 0))
      }
    }, 1000)
  }

  // Finish the match
  const finishMatch = useCallback((finalCorrectCount: number) => {
    if (!currentMatch || !matchStartTime) return

    const timeSpent = Math.round((Date.now() - matchStartTime) / 1000)
    const won = finalCorrectCount > currentMatch.questions.length / 2

    const result = calculatePVPRewards(
      won,
      currentMatch.difficulty,
      finalCorrectCount,
      currentMatch.questions.length,
      currentRank
    )
    result.timeSpent = timeSpent

    // Apply rewards
    if (won) {
      addXP(result.xpEarned)
      addGold(result.goldEarned)
    }

    setMatchResult(result)
    setMatchState('result')
  }, [currentMatch, matchStartTime, currentRank, addXP, addGold])

  // Timer effect
  useEffect(() => {
    if (matchState !== 'battle') return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - finish match
          finishMatch(correctCount)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [matchState, correctCount, finishMatch])

  const currentQuestion: PVPQuestion | null = currentMatch?.questions[currentQuestionIndex] || null

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">⚔️ PvP Arena</h1>
        <p className="text-slate-400">Challenge other players in rapid-fire quiz battles!</p>
      </div>

      {/* Rank Display */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${currentRank.color}30`, border: `3px solid ${currentRank.color}` }}
            >
              {currentRank.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: currentRank.color }}>
                {currentRank.name}
              </h2>
              <p className="text-slate-400">{pvpPoints} Points</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{pvpWins}</div>
                <div className="text-xs text-slate-400">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{pvpLosses}</div>
                <div className="text-xs text-slate-400">Losses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{pvpStreak}</div>
                <div className="text-xs text-slate-400">Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rank Progress */}
        {rankProgress.next && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Progress to {rankProgress.next.name}</span>
              <span className="text-amber-400">{Math.round(rankProgress.progress)}%</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${rankProgress.progress}%`,
                  backgroundColor: currentRank.color,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Match Area */}
      {matchState === 'idle' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-6">⚔️</div>
          <h2 className="text-2xl font-bold mb-4">Ready for Battle?</h2>
          <p className="text-slate-400 mb-8">
            Test your DevOps knowledge against other players!<br />
            Win to earn points and climb the ranks.
          </p>
          <button
            onClick={startMatchmaking}
            className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl text-lg transition-all transform hover:scale-105"
          >
            ⚔️ Find Match
          </button>
        </div>
      )}

      {matchState === 'matching' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-6 animate-bounce">🔍</div>
          <h2 className="text-2xl font-bold mb-4">Finding Opponent...</h2>
          <p className="text-slate-400">Matching you with an opponent of similar rank</p>
        </div>
      )}

      {matchState === 'ready' && currentMatch && (
        <div className="text-center py-8">
          <div className="mb-8">
            <div className="text-8xl mb-4">{currentMatch.opponentAvatar}</div>
            <h2 className="text-3xl font-bold mb-2">{currentMatch.opponentName}</h2>
            <p className="text-slate-400">
              {currentMatch.difficulty === 'easy' ? '🥉 Easy' : currentMatch.difficulty === 'medium' ? '⚔️ Medium' : '🔥 Hard'} Match
            </p>
            <div className="mt-2 text-amber-400">
              {currentMatch.rewardMultiplier}x Rewards
            </div>
          </div>
          <button
            onClick={startBattle}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-xl text-lg transition-all transform hover:scale-105"
          >
            ⚔️ Start Battle
          </button>
        </div>
      )}

      {matchState === 'battle' && currentMatch && currentQuestion && (
        <div className="bg-card rounded-xl border border-border p-6">
          {/* Match Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{currentMatch.opponentAvatar}</span>
              <span className="text-slate-400">{currentMatch.opponentName}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-400">
                Q {currentQuestionIndex + 1}/{currentMatch.questions.length}
              </span>
              <span className={`px-3 py-1 rounded-full font-bold ${timeLeft <= 10 ? 'bg-red-600 animate-pulse' : 'bg-slate-700'}`}>
                ⏱️ {timeLeft}s
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-slate-700 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / currentMatch.questions.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div className="mb-8">
            <div className="text-sm text-slate-400 mb-2">{currentQuestion.topic}</div>
            <h3 className="text-xl font-bold text-white mb-6">{currentQuestion.question}</h3>

            {/* Answer Options */}
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option, index) => {
                let buttonClass = 'bg-slate-700 hover:bg-slate-600 text-white'

                if (selectedAnswer !== null) {
                  if (index === currentQuestion.correctIndex) {
                    buttonClass = 'bg-green-600 text-white'
                  } else if (index === selectedAnswer) {
                    buttonClass = 'bg-red-600 text-white'
                  } else {
                    buttonClass = 'bg-slate-800 text-slate-500'
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 rounded-lg text-left font-medium transition-all ${buttonClass}`}
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-600 mr-3 text-sm">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Your Stats */}
          <div className="flex items-center justify-between text-sm text-slate-400 pt-4 border-t border-slate-700">
            <span>Your Score: {correctCount}/{currentQuestionIndex + (selectedAnswer !== null ? 1 : 0)}</span>
            <span>{currentMatch.difficulty === 'easy' ? '🥉' : currentMatch.difficulty === 'medium' ? '⚔️' : '🔥'} {currentMatch.difficulty}</span>
          </div>
        </div>
      )}

      {matchState === 'result' && matchResult && (
        <div className="text-center py-8">
          <div className={`text-8xl mb-6 ${matchResult.won ? 'animate-bounce' : ''}`}>
            {matchResult.won ? '🏆' : '💔'}
          </div>
          <h2 className={`text-4xl font-bold mb-4 ${matchResult.won ? 'text-green-400' : 'text-red-400'}`}>
            {matchResult.won ? 'Victory!' : 'Defeat'}
          </h2>

          <div className="bg-card rounded-xl border border-border p-6 mb-8 max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${matchResult.won ? 'text-green-400' : 'text-red-400'}`}>
                  {matchResult.won ? '+' : ''}{matchResult.correctAnswers}/{matchResult.totalQuestions}
                </div>
                <div className="text-xs text-slate-400">Correct Answers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">
                  {matchResult.won ? '+' : '-'}{matchResult.pointsEarned || matchResult.pointsLost} pts
                </div>
                <div className="text-xs text-slate-400">Points</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-amber-400">+{matchResult.xpEarned} XP</div>
                <div className="text-xs text-slate-400">Experience</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-yellow-400">+{matchResult.goldEarned} Gold</div>
                <div className="text-xs text-slate-400">Gold</div>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500">
              Time: {Math.round(matchResult.timeSpent / 60)}m {matchResult.timeSpent % 60}s
            </div>
          </div>

          <button
            onClick={resetMatch}
            className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl text-lg transition-all transform hover:scale-105"
          >
            ⚔️ Battle Again
          </button>
        </div>
      )}

      {/* Ranks Info */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4 text-center">🏆 Rank Tiers</h2>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {PVP_RANKS.map(rank => (
            <div
              key={rank.id}
              className="text-center p-2 rounded-lg"
              style={{ backgroundColor: `${rank.color}20` }}
            >
              <div className="text-2xl mb-1">{rank.icon}</div>
              <div className="text-xs font-medium" style={{ color: rank.color }}>{rank.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
