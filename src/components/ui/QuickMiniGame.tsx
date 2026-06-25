import { useState, useEffect } from 'react'

interface TriviaQuestion {
  question: string
  options: string[]
  correctIndex: number
  devopsTip: string
}

const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    question: "What does CI/CD stand for?",
    options: ["Continuous Integration/Continuous Deployment", "Code Input/Code Output", "Central Integration/Delivery", "Container Interface/Container Data"],
    correctIndex: 0,
    devopsTip: "CI/CD pipelines automate the process of integrating code changes and deploying them to production!"
  },
  {
    question: "Which tool is commonly used for containerization?",
    options: ["Docker", "Git", "Jenkins", "Kubernetes"],
    correctIndex: 0,
    devopsTip: "Docker containers package applications with their dependencies for consistent deployment across environments."
  },
  {
    question: "What is the main benefit of Infrastructure as Code?",
    options: ["Reproducible infrastructure", "Faster computers", "Better coffee", "More meetings"],
    correctIndex: 0,
    devopsTip: "IaC allows you to version control your infrastructure and deploy it consistently!"
  },
  {
    question: "What does 'git merge' do?",
    options: ["Combines branch histories", "Deletes a branch", "Creates a new repository", "Pushes code to remote"],
    correctIndex: 0,
    devopsTip: "Merging integrates changes from one branch into another, preserving the commit history!"
  },
  {
    question: "What is a 'pull request' used for?",
    options: ["Propose and review code changes", "Download repositories", "Delete branches", "Create containers"],
    correctIndex: 0,
    devopsTip: "Pull requests let team members review, discuss, and approve code changes before merging!"
  },
  {
    question: "Which is a benefit of microservices architecture?",
    options: ["Independent scaling of services", "Single large application", "No network communication needed", "One deployment for everything"],
    correctIndex: 0,
    devopsTip: "Microservices can be scaled independently, allowing better resource utilization!"
  },
]

interface MatchingPair {
  term: string
  definition: string
}

const MATCHING_GAMES: MatchingPair[][] = [
  [
    { term: "Docker", definition: "Container platform" },
    { term: "Kubernetes", definition: "Container orchestrator" },
    { term: "Jenkins", definition: "CI/CD automation" },
    { term: "Git", definition: "Version control" },
  ],
  [
    { term: "API", definition: "Application Programming Interface" },
    { term: "DNS", definition: "Domain Name System" },
    { term: "HTTP", definition: "Hypertext Transfer Protocol" },
    { term: "SSH", definition: "Secure Shell" },
  ],
  [
    { term: "HTML", definition: "HyperText Markup Language" },
    { term: "CSS", definition: "Cascading Style Sheets" },
    { term: "JS", definition: "JavaScript" },
    { term: "SQL", definition: "Structured Query Language" },
  ],
]

interface QuickMiniGameProps {
  onComplete: (success: boolean, xpBonus: number) => void
  onSkip: () => void
}

type GameType = 'trivia' | 'matching'

export default function QuickMiniGame({ onComplete, onSkip }: QuickMiniGameProps) {
  const [gameType] = useState<GameType>(() => Math.random() > 0.5 ? 'trivia' : 'matching')
  const [xpBonus] = useState(() => Math.floor(Math.random() * 15) + 10)

  if (gameType === 'trivia') {
    return <TriviaGame onComplete={onComplete} onSkip={onSkip} xpBonus={xpBonus} />
  }
  return <MatchingGame onComplete={onComplete} onSkip={onSkip} xpBonus={xpBonus} />
}

function TriviaGame({ onComplete, onSkip, xpBonus }: { onComplete: (s: boolean, x: number) => void; onSkip: () => void; xpBonus: number }) {
  const [question] = useState(() => TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)])
  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip()
        return
      }
      if (e.key.toLowerCase() === 'n' && !showResult) {
        // Auto-select correct answer for testing
        setSelected(question.correctIndex)
        setShowResult(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSkip, showResult, question.correctIndex])

  const handleAnswer = (index: number) => {
    setSelected(index)
    setShowResult(true)
  }

  const handleContinue = () => {
    onComplete(selected === question.correctIndex, selected === question.correctIndex ? xpBonus : 0)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gradient-to-b from-purple-900/95 to-slate-900/95 border-2 border-purple-500 rounded-xl shadow-2xl overflow-hidden animate-bounce-in">
        <div className="bg-purple-900/50 px-6 py-4 border-b border-purple-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              🎯 Quick Trivia!
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-amber-400 font-bold">+{xpBonus} XP</span>
              <button
                onClick={onSkip}
                className="text-slate-400 hover:text-white text-xl leading-none"
                title="Close (Esc)"
              >
                ×
              </button>
            </div>
          </div>
          <p className="text-purple-300 text-sm mt-1">Answer correctly for bonus XP! (N=auto solve, Esc=skip)</p>
        </div>

        <div className="p-6">
          <h4 className="text-lg font-bold text-white mb-4">{question.question}</h4>

          <div className="space-y-3">
            {question.options.map((option, idx) => {
              let bgClass = 'bg-slate-700 hover:bg-slate-600 border-slate-600'
              if (showResult) {
                if (idx === question.correctIndex) {
                  bgClass = 'bg-green-900/50 border-green-500'
                } else if (idx === selected) {
                  bgClass = 'bg-red-900/50 border-red-500'
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => !showResult && handleAnswer(idx)}
                  disabled={showResult}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${bgClass}`}
                >
                  <span className="text-slate-200">{option}</span>
                </button>
              )
            })}
          </div>

          {showResult && (
            <div className="mt-4">
              <div className={`p-3 rounded-lg mb-4 ${selected === question.correctIndex ? 'bg-green-900/50 border border-green-600' : 'bg-amber-900/50 border border-amber-600'}`}>
                <p className={`font-bold ${selected === question.correctIndex ? 'text-green-300' : 'text-amber-300'}`}>
                  {selected === question.correctIndex ? '🎉 Correct!' : '❌ Not quite!'}
                </p>
                <p className="text-slate-300 text-sm mt-1">{question.devopsTip}</p>
              </div>
              <button
                onClick={handleContinue}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold rounded-lg"
              >
                Continue {selected === question.correctIndex ? `(+${xpBonus} XP)` : ''}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onSkip}
          className="w-full py-2 text-slate-500 hover:text-slate-300 text-sm border-t border-slate-700"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}

function MatchingGame({ onComplete, onSkip, xpBonus }: { onComplete: (s: boolean, x: number) => void; onSkip: () => void; xpBonus: number }) {
  const [pairs] = useState(() => MATCHING_GAMES[Math.floor(Math.random() * MATCHING_GAMES.length)])
  const [termOrder] = useState(() => [...pairs].sort(() => Math.random() - 0.5))
  const [defOrder] = useState(() => [...pairs].sort(() => Math.random() - 0.5))
  const [selectedTermIdx, setSelectedTermIdx] = useState<number | null>(null)
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set())
  const [wrongDefIdx, setWrongDefIdx] = useState<number | null>(null)

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip()
        return
      }
      if (e.key.toLowerCase() === 'n') {
        // Auto-complete all matches for testing
        const allMatched = new Set<number>()
        for (let i = 0; i < pairs.length; i++) {
          allMatched.add(i) // term indices 0 to n-1
          allMatched.add(pairs.length + i) // def indices n to 2n-1 (assuming same order)
        }
        setMatchedPairs(allMatched)
        setSelectedTermIdx(null)
        setTimeout(() => onComplete(true, xpBonus), 300)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSkip, onComplete, xpBonus, pairs.length])

  const handleTermClick = (termIdx: number) => {
    if (matchedPairs.has(termIdx)) return
    setSelectedTermIdx(termIdx)
  }

  const handleDefClick = (defIdx: number) => {
    if (selectedTermIdx === null) return
    if (matchedPairs.has(defIdx)) return

    const selectedPair = termOrder[selectedTermIdx]
    const clickedPair = defOrder[defIdx]

    if (selectedPair.term === clickedPair.term) {
      // Match!
      const newMatched = new Set(matchedPairs)
      newMatched.add(selectedTermIdx)
      newMatched.add(defIdx)
      setMatchedPairs(newMatched)
      setSelectedTermIdx(null)

      if (newMatched.size === pairs.length * 2) {
        setTimeout(() => onComplete(true, xpBonus), 500)
      }
    } else {
      // Wrong match
      setWrongDefIdx(defIdx)
      setTimeout(() => setWrongDefIdx(null), 800)
    }
  }

  const isTermMatched = (idx: number) => matchedPairs.has(idx)
  const isDefMatched = (idx: number) => matchedPairs.has(idx)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-gradient-to-b from-blue-900/95 to-slate-900/95 border-2 border-blue-500 rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-blue-900/50 px-6 py-4 border-b border-blue-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              🔗 Match the Terms!
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-amber-400 font-bold">+{xpBonus} XP</span>
              <button
                onClick={onSkip}
                className="text-slate-400 hover:text-white text-xl leading-none"
                title="Close (Esc)"
              >
                ×
              </button>
            </div>
          </div>
          <p className="text-blue-300 text-sm mt-1">Match all pairs to earn bonus XP! (N=auto solve, Esc=skip)</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Terms */}
            <div>
              <p className="text-slate-400 text-sm mb-2">Terms</p>
              <div className="space-y-2">
                {termOrder.map((pair, idx) => {
                  const isMatched = isTermMatched(idx)
                  const isSelected = selectedTermIdx === idx
                  return (
                    <button
                      key={idx}
                      onClick={() => handleTermClick(idx)}
                      disabled={isMatched}
                      className={`w-full p-3 rounded-lg border transition-all text-center font-medium ${
                        isMatched ? 'bg-green-900/50 border-green-600 text-green-300 opacity-50' :
                        isSelected ? 'bg-amber-900/50 border-amber-500 text-amber-300' :
                        'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-200'
                      }`}
                    >
                      {pair.term}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Definitions */}
            <div>
              <p className="text-slate-400 text-sm mb-2">Definitions</p>
              <div className="space-y-2">
                {defOrder.map((pair, idx) => {
                  const isMatched = isDefMatched(idx)
                  const isWrong = wrongDefIdx === idx
                  return (
                    <button
                      key={idx}
                      onClick={() => handleDefClick(idx)}
                      disabled={isMatched}
                      className={`w-full p-3 rounded-lg border transition-all text-center text-sm ${
                        isMatched ? 'bg-green-900/50 border-green-600 text-green-300 opacity-50' :
                        isWrong ? 'bg-red-900/50 border-red-500 animate-shake' :
                        'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-200'
                      }`}
                    >
                      {pair.definition}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-700 bg-slate-800/50">
          <p className="text-slate-400 text-sm">
            {matchedPairs.size / 2} / {pairs.length} matched
          </p>
          <button
            onClick={() => onComplete(false, 0)}
            className="text-slate-500 hover:text-slate-300 text-sm"
          >
            Give up
          </button>
        </div>
      </div>
    </div>
  )
}
