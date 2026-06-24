import { useState } from 'react'
import { useGame } from '../../contexts/GameContext'
import type { CharacterClass } from '../../contexts/GameContext'

const CLASSES: { id: CharacterClass; icon: string; description: string; strength: string }[] = [
  {
    id: 'Cloud Knight',
    icon: '☁️',
    description: 'Masters cloud infrastructure and deployment',
    strength: 'Cloud & DevOps'
  },
  {
    id: 'Script Warrior',
    icon: '⚔️',
    description: 'Automates everything with powerful scripts',
    strength: 'Bash & Python'
  },
  {
    id: 'Data Mage',
    icon: '🔮',
    description: 'Commands databases and data pipelines',
    strength: 'SQL & Data'
  },
  {
    id: 'DevOps Sage',
    icon: '🧙',
    description: 'Knows all, builds all, deploys all',
    strength: 'Full Stack'
  },
]

interface OnboardingWizardProps {
  onComplete: () => void
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { completeOnboarding } = useGame()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('Cloud Knight')

  const handleComplete = () => {
    if (!name.trim()) return
    completeOnboarding(name.trim(), selectedClass)
    onComplete()
  }

  const canProceed = step === 0 ? name.trim().length >= 2 : true

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i === step
                  ? 'bg-amber-500 scale-125'
                  : i < step
                  ? 'bg-green-500'
                  : 'bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Step 0: Welcome & Name */}
        {step === 0 && (
          <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-8 text-center">
            <div className="text-6xl mb-4">⚔️</div>
            <h1 className="text-3xl font-bold text-amber-400 mb-2">Welcome, Adventurer!</h1>
            <p className="text-slate-400 mb-6">
              The DevOps world needs your help. The Corruption stirs once more...
            </p>

            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2">What shall we call you?</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canProceed) {
                    if (name.trim().length < 2) return
                    setStep(1)
                  }
                }}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white text-center text-lg focus:outline-none focus:border-amber-500 transition-colors"
                autoFocus
              />
            </div>

            <button
              onClick={() => name.trim().length >= 2 && setStep(1)}
              disabled={!canProceed}
              className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
                canProceed
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 1: Class Selection */}
        {step === 1 && (
          <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-2">Choose Your Path</h2>
            <p className="text-slate-400 text-center mb-6">
              Select the class that best matches your skills
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {CLASSES.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedClass === cls.id
                      ? 'bg-amber-900/40 border-amber-500'
                      : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="text-3xl mb-2">{cls.icon}</div>
                  <div className={`font-bold ${selectedClass === cls.id ? 'text-amber-400' : 'text-white'}`}>
                    {cls.id}
                  </div>
                  <div className="text-xs text-slate-400 mb-1">{cls.description}</div>
                  <div className="text-xs text-green-400">{cls.strength}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="flex-1 py-3 rounded-lg font-bold bg-slate-700 hover:bg-slate-600 text-white transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-lg font-bold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white transition-all"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Summary */}
        {step === 2 && (
          <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-8 text-center">
            <div className="text-6xl mb-4">
              {selectedClass === 'Cloud Knight' ? '☁️' : selectedClass === 'Script Warrior' ? '⚔️' : selectedClass === 'Data Mage' ? '🔮' : '🧙'}
            </div>
            <h2 className="text-2xl font-bold text-amber-400 mb-2">All Ready!</h2>
            <p className="text-slate-300 mb-6">
              Your journey begins, <span className="text-amber-400 font-bold">{name}</span>!
            </p>

            <div className="bg-slate-900/50 rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Class:</span>
                <span className="text-white">{selectedClass}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Starting Level:</span>
                <span className="text-green-400">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quests Available:</span>
                <span className="text-amber-400">118+</span>
              </div>
            </div>

            <div className="text-sm text-slate-400 mb-6">
              💡 <em>Tip: Press <kbd className="px-2 py-1 bg-slate-700 rounded text-white">N</kbd> to quickly advance through quizzes!</em>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-lg font-bold bg-slate-700 hover:bg-slate-600 text-white transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 py-3 rounded-lg font-bold bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white transition-all"
              >
                🚀 Begin Adventure!
              </button>
            </div>
          </div>
        )}

        {/* Keyboard hints */}
        <div className="text-center text-slate-500 text-xs mt-6">
          Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Enter</kbd> to continue
        </div>
      </div>
    </div>
  )
}
