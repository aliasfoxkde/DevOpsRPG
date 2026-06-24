import { useState } from 'react'
import { BACKGROUNDS, GOALS, INTERESTS, LEARNING_STYLES, type PlayerProfile } from '../../data/personality'

interface OnboardingWizardProps {
  onComplete: (profile: PlayerProfile) => void
}

type Step = 'welcome' | 'name' | 'background' | 'goals' | 'interests' | 'style' | 'complete'

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState<Step>('welcome')
  const [name, setName] = useState('')
  const [selectedBackground, setSelectedBackground] = useState<string>('')
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedStyle, setSelectedStyle] = useState<string>('')

  const handleComplete = () => {
    const finalProfile: PlayerProfile = {
      name: name || 'Hero',
      title: 'DevOps Apprentice',
      class: 'DevOps Sage',
      background: selectedBackground,
      goals: selectedGoals,
      interests: selectedInterests,
      experienceLevel: 'beginner',
      learningStyle: selectedStyle as PlayerProfile['learningStyle'] || 'hands-on',
      preferredPace: 'steady',
      discoveredTraits: [],
      storyProgress: 0,
      milestones: [],
    }
    onComplete(finalProfile)
  }

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="text-center py-8">
            <div className="text-7xl mb-6">⚔️</div>
            <h1 className="text-4xl font-bold text-white mb-4">Welcome, Adventurer!</h1>
            <p className="text-slate-300 mb-8 max-w-md mx-auto">
              You are about to embark on a journey through the world of DevOps.
              Before you begin, let me learn a bit about you...
            </p>
            <button
              onClick={() => setStep('name')}
              className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105 text-lg"
            >
              Begin Your Journey →
            </button>
          </div>
        )

      case 'name':
        return (
          <div className="text-center py-8">
            <div className="text-6xl mb-6">🧙</div>
            <h2 className="text-3xl font-bold text-white mb-4">What is your name, hero?</h2>
            <p className="text-slate-400 mb-8">Every legend begins with a name...</p>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full max-w-sm mx-auto block px-6 py-4 bg-slate-800 border-2 border-slate-600 rounded-xl text-xl text-white text-center focus:outline-none focus:border-amber-500 transition-colors"
              autoFocus
            />
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() => setStep('welcome')}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep('background')}
                disabled={!name.trim()}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105"
              >
                Continue →
              </button>
            </div>
          </div>
        )

      case 'background':
        return (
          <div className="py-6">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">What brings you here?</h2>
            <p className="text-slate-400 mb-6 text-center">Select the option that best describes you</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
              {BACKGROUNDS.map(bg => (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBackground(bg.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedBackground === bg.id
                      ? 'bg-amber-900/30 border-amber-500'
                      : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="text-3xl mb-2">{bg.icon}</div>
                  <div className="font-bold text-white">{bg.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{bg.description}</div>
                </button>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() => setStep('name')}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep('goals')}
                disabled={!selectedBackground}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105"
              >
                Continue →
              </button>
            </div>
          </div>
        )

      case 'goals':
        return (
          <div className="py-6">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">What are your goals?</h2>
            <p className="text-slate-400 mb-6 text-center">Select all that apply (optional)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
              {GOALS.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedGoals.includes(goal.id)
                      ? 'bg-purple-900/30 border-purple-500'
                      : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="text-2xl mb-1">{goal.icon}</div>
                  <div className="font-medium text-white text-sm">{goal.name}</div>
                </button>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() => setStep('background')}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep('interests')}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105"
              >
                Continue →
              </button>
            </div>
          </div>
        )

      case 'interests':
        return (
          <div className="py-6">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">What interests you?</h2>
            <p className="text-slate-400 mb-6 text-center">Select all that apply (optional)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {INTERESTS.map(interest => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedInterests.includes(interest.id)
                      ? 'bg-green-900/30 border-green-500'
                      : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="text-2xl mb-1">{interest.icon}</div>
                  <div className="font-medium text-white text-sm">{interest.name}</div>
                </button>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() => setStep('goals')}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep('style')}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105"
              >
                Continue →
              </button>
            </div>
          </div>
        )

      case 'style':
        return (
          <div className="py-6">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">How do you learn best?</h2>
            <p className="text-slate-400 mb-6 text-center">Choose your learning style</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {LEARNING_STYLES.map(style => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    selectedStyle === style.id
                      ? 'bg-blue-900/30 border-blue-500'
                      : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="text-4xl mb-3">{style.icon}</div>
                  <div className="font-bold text-white text-lg">{style.name}</div>
                  <div className="text-slate-400 text-sm mt-1">{style.description}</div>
                </button>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() => setStep('interests')}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep('complete')}
                disabled={!selectedStyle}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105"
              >
                Continue →
              </button>
            </div>
          </div>
        )

      case 'complete':
        return (
          <div className="text-center py-8">
            <div className="text-7xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-4">Welcome, {name || 'Hero'}!</h2>
            <p className="text-slate-300 mb-8 max-w-md mx-auto">
              Your journey begins now. Complete quests, earn XP, and become the DevOps master you were meant to be!
            </p>
            <div className="bg-slate-800/50 rounded-xl p-6 max-w-md mx-auto mb-8">
              <h3 className="text-lg font-bold text-amber-400 mb-4">Your Profile</h3>
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{BACKGROUNDS.find(b => b.id === selectedBackground)?.icon || '👤'}</span>
                  <span className="text-slate-300">{BACKGROUNDS.find(b => b.id === selectedBackground)?.name || 'Adventurer'}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {[...selectedGoals, ...selectedInterests].slice(0, 5).map(id => {
                    const goal = GOALS.find(g => g.id === id)
                    const interest = INTERESTS.find(i => i.id === id)
                    const item = goal || interest
                    return item ? (
                      <span key={id} className="text-sm bg-slate-700 px-2 py-1 rounded text-slate-300">
                        {item.icon} {item.name}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            </div>
            <button
              onClick={handleComplete}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105 text-lg"
            >
              ⚔️ Begin Adventure!
            </button>
          </div>
        )

      default:
        return null
    }
  }

  const stepIndicators: { key: Step; label: string }[] = [
    { key: 'welcome', label: 'Start' },
    { key: 'name', label: 'Name' },
    { key: 'background', label: 'Background' },
    { key: 'goals', label: 'Goals' },
    { key: 'interests', label: 'Interests' },
    { key: 'style', label: 'Style' },
    { key: 'complete', label: 'Done' },
  ]

  const currentStepIndex = stepIndicators.findIndex(s => s.key === step)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {stepIndicators.map((s, idx) => (
              <div
                key={s.key}
                className={`text-xs ${
                  idx <= currentStepIndex ? 'text-amber-400' : 'text-slate-600'
                }`}
              >
                {s.label}
              </div>
            ))}
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
              style={{ width: `${((currentStepIndex + 1) / stepIndicators.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 sm:p-8">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}
