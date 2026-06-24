import { useState, useEffect } from 'react'

interface Encounter {
  id: string
  type: 'boss' | 'treasure' | 'mystery' | 'challenge' | 'lore'
  title: string
  description: string
  icon: string
  xpBonus: number
  goldBonus?: number
  action?: string
  onAction?: () => void
}

const ENCOUNTERS: Omit<Encounter, 'id'>[] = [
  {
    type: 'boss',
    title: '🐉 Mini-Boss Appeared!',
    description: 'A practice boss challenges you! Answer correctly to earn bonus XP!',
    icon: '⚔️',
    xpBonus: 50,
    goldBonus: 25,
    action: 'Fight!'
  },
  {
    type: 'treasure',
    title: '💎 Hidden Treasure!',
    description: 'You found a hidden stash! Claim your reward!',
    icon: '📦',
    xpBonus: 30,
    goldBonus: 15,
    action: 'Open!'
  },
  {
    type: 'mystery',
    title: '🎁 Mystery Box!',
    description: 'A mysterious portal opened! Take a chance at incredible rewards!',
    icon: '🌀',
    xpBonus: 75,
    action: 'Reach in!'
  },
  {
    type: 'challenge',
    title: '⚡ Speed Challenge!',
    description: 'Quick! Answer 3 rapid-fire questions for a massive XP bonus!',
    icon: '🔥',
    xpBonus: 100,
    action: 'Accept!'
  },
  {
    type: 'lore',
    title: '📜 Ancient Knowledge',
    description: 'You discovered a lore fragment! +XP for reading!',
    icon: '📖',
    xpBonus: 20,
    action: 'Read!'
  },
]

interface EncounterEventProps {
  onComplete: (xpEarned: number, goldEarned: number) => void
}

export default function EncounterEvent({ onComplete }: EncounterEventProps) {
  const [encounter, setEncounter] = useState<Encounter | null>(null)
  const [showEncounter, setShowEncounter] = useState(false)

  useEffect(() => {
    // 20% chance of encounter every time component mounts (quest change)
    if (!showEncounter && !encounter) {
      const roll = Math.random()
      if (roll < 0.20) {
        const encounterData = ENCOUNTERS[Math.floor(Math.random() * ENCOUNTERS.length)]
        setEncounter({ ...encounterData, id: Date.now().toString() })
        setTimeout(() => setShowEncounter(true), 500)
      }
    }
  }, [])

  const handleAction = () => {
    if (encounter) {
      onComplete(encounter.xpBonus, encounter.goldBonus || 0)
    }
    setShowEncounter(false)
  }

  if (!showEncounter || !encounter) return null

  const bgColors = {
    boss: 'from-red-900/95 to-slate-900/95 border-red-500',
    treasure: 'from-amber-900/95 to-slate-900/95 border-amber-500',
    mystery: 'from-purple-900/95 to-slate-900/95 border-purple-500',
    challenge: 'from-orange-900/95 to-slate-900/95 border-orange-500',
    lore: 'from-blue-900/95 to-slate-900/95 border-blue-500',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={`w-full max-w-md bg-gradient-to-b ${bgColors[encounter.type]} border-2 rounded-xl shadow-2xl overflow-hidden animate-bounce-in`}>
        <div className="px-6 py-4 border-b border-slate-700">
          <div className="text-center">
            <span className="text-6xl">{encounter.icon}</span>
            <h3 className="text-2xl font-bold text-white mt-2">{encounter.title}</h3>
            <p className="text-slate-300 mt-2">{encounter.description}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">+{encounter.xpBonus} XP</p>
            </div>
            {encounter.goldBonus && (
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">+{encounter.goldBonus} Gold</p>
              </div>
            )}
          </div>

          <button
            onClick={handleAction}
            className={`w-full py-3 font-bold rounded-lg transition-all hover:scale-105 ${
              encounter.type === 'boss' ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400' :
              encounter.type === 'challenge' ? 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400' :
              'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400'
            } text-white`}
          >
            {encounter.action} 🎉
          </button>
        </div>

        <button
          onClick={() => setShowEncounter(false)}
          className="w-full py-2 text-slate-500 hover:text-slate-300 text-sm border-t border-slate-700"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}

// Quick Challenge Component - 3 rapid-fire questions
interface RapidFireQuestion {
  question: string
  answer: string
  devopsTip: string
}

const RAPID_FIRE_QUESTIONS: RapidFireQuestion[] = [
  { question: "What port does HTTP use?", answer: "80", devopsTip: "Port 80 is the default for HTTP traffic!" },
  { question: "What port does HTTPS use?", answer: "443", devopsTip: "SSL/TLS加密的HTTPS uses port 443!" },
  { question: "What does 'git status' show?", answer: "working directory state", devopsTip: "git status显示工作区的状态!" },
  { question: "What is Docker's default registry?", answer: "Docker Hub", devopsTip: "Docker Hub is the default public registry!" },
  { question: "What symbol starts a comment in CSS?", answer: "/*", devopsTip: "CSS comments use /* */ syntax!" },
  { question: "What does API stand for?", answer: "Application Programming Interface", devopsTip: "APIs allow software to communicate!" },
  { question: "What is the root user in Linux?", answer: "superuser", devopsTip: "root is the Linux superuser with full permissions!" },
  { question: "What does CD stand for in CD pipeline?", answer: "Continuous Deployment", devopsTip: "CD = Continuous Deployment/Delivery!" },
]

interface RapidFireChallengeProps {
  onComplete: (correct: number, xpBonus: number) => void
}

export function RapidFireChallenge({ onComplete }: RapidFireChallengeProps) {
  const [questions] = useState(() => {
    const shuffled = [...RAPID_FIRE_QUESTIONS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3)
  })
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answer, setAnswer] = useState('')
  const [correct, setCorrect] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const current = questions[currentIdx]

  const handleSubmit = () => {
    const isCorrect = answer.toLowerCase().trim() === current.answer.toLowerCase().trim() ||
      current.answer.toLowerCase().includes(answer.toLowerCase().trim())

    if (isCorrect) setCorrect(c => c + 1)
    setShowResult(true)
  }

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1)
      setAnswer('')
      setShowResult(false)
    } else {
      const xpBonus = correct * 25
      onComplete(correct, xpBonus)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gradient-to-b from-orange-900/95 to-slate-900/95 border-2 border-orange-500 rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-orange-900/50 px-6 py-4 border-b border-orange-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              ⚡ Rapid Fire!
            </h3>
            <span className="text-orange-400">
              {currentIdx + 1}/3
            </span>
          </div>
          <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all"
              style={{ width: `${((currentIdx + 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-6">
          <h4 className="text-lg font-bold text-white mb-4">{current.question}</h4>

          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !showResult && handleSubmit()}
            disabled={showResult}
            placeholder="Type your answer..."
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            autoFocus
          />

          {showResult && (
            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
              <p className={`font-bold ${correct > 0 ? 'text-green-400' : 'text-amber-400'}`}>
                💡 {current.devopsTip}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-700">
          {!showResult ? (
            <button
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className={`w-full py-3 font-bold rounded-lg transition-all ${
                answer.trim()
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold rounded-lg"
            >
              {currentIdx < questions.length - 1 ? 'Next Question →' : 'See Results'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
