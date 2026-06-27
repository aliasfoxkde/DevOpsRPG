import { useState } from 'react'
import { useGame } from '../contexts/GameContext'

type FeedbackType = 'bug' | 'feature' | 'change' | 'praise'

interface FeedbackFormData {
  type: FeedbackType
  title: string
  description: string
  area: string
  email?: string
}

const FEEDBACK_AREAS = [
  'Quest System',
  'Battle Arena',
  'Mini-games',
  'World Map',
  'Social Features',
  'Store/Marketplace',
  'Settings',
  'UI/UX',
  'Performance',
  'Documentation',
  'Other',
]

export default function FeedbackPage() {
  const { game } = useGame()
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: 'feature',
    title: '',
    description: '',
    area: 'Quest System',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Create GitHub issue via GitHub API
      const labelMap: Record<FeedbackType, string[]> = {
        bug: ['bug', 'needs-triage'],
        feature: ['enhancement', 'needs-triage'],
        change: ['change-request', 'needs-triage'],
        praise: ['praise', 'community'],
      }

      const issueBody = `
## Feedback Submission

**Type**: ${formData.type}
**Area**: ${formData.area}
**Submitted by**: ${game.character.name} (Level ${game.character.level})

---

### Description

${formData.description}

---

*This issue was automatically created from the in-app feedback form.*
      `.trim()

      const response = await fetch('https://api.github.com/repos/aliasfoxkde/DevOpsRPG/issues', {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `[${formData.type.toUpperCase()}] ${formData.title}`,
          body: issueBody,
          labels: labelMap[formData.type],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create GitHub issue')
      }

      setSubmitted(true)
    } catch (err) {
      setError('Failed to submit feedback. Please try again or submit directly via GitHub.')
      console.error('Feedback submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-amber-400 mb-4">Thank You!</h1>
          <p className="text-slate-300 mb-6">
            Your feedback has been submitted as a GitHub issue. Our team will review it and respond accordingly.
          </p>
          <p className="text-slate-400 text-sm mb-6">
            You can track your feedback at:{' '}
            <a
              href="https://github.com/aliasfoxkde/DevOpsRPG/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              github.com/aliasfoxkde/DevOpsRPG/issues
            </a>
          </p>
          <button
            onClick={() => {
              setSubmitted(false)
              setFormData({ type: 'feature', title: '', description: '', area: 'Quest System' })
            }}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
          >
            Submit More Feedback
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">📝 Submit Feedback</h1>
        <p className="text-slate-400">
          Don't like something? Found a bug? Want a feature added? Let us know!
        </p>
        <p className="text-slate-500 text-sm mt-2">
          Your feedback becomes a GitHub issue and will be handled by our automated workflow.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6 text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-6">
        {/* Feedback Type */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Feedback Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(['bug', 'feature', 'change', 'praise'] as FeedbackType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, type })}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  formData.type === type
                    ? type === 'bug'
                      ? 'bg-red-600 text-white'
                      : type === 'feature'
                      ? 'bg-amber-600 text-white'
                      : type === 'change'
                      ? 'bg-blue-600 text-white'
                      : 'bg-green-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {type === 'bug' && '🐛 '}
                {type === 'feature' && '✨ '}
                {type === 'change' && '🔄 '}
                {type === 'praise' && '💜 '}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Brief summary of your feedback"
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Area */}
        <div>
          <label htmlFor="area" className="block text-sm font-medium text-slate-300 mb-2">
            Area <span className="text-red-400">*</span>
          </label>
          <select
            id="area"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
          >
            {FEEDBACK_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            id="description"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={
              formData.type === 'bug'
                ? 'Describe what happened, what you expected, and steps to reproduce...'
                : formData.type === 'feature'
                ? 'Describe the problem you want solved or the feature you want...'
                : formData.type === 'change'
                ? 'Describe the current behavior and what you would like changed...'
                : 'Tell us what you love about DevOpsQuest!'
            }
            rows={6}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex flex-col gap-4">
          <button
            type="submit"
            disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Feedback'
            )}
          </button>

          <p className="text-center text-slate-500 text-xs">
            Your feedback will be posted as a public GitHub issue.
            <br />
            You can also{' '}
            <a
              href="https://github.com/aliasfoxkde/DevOpsRPG/issues/new/choose"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              submit directly on GitHub
            </a>
            .
          </p>
        </div>
      </form>

      {/* Community Contribution Info */}
      <div className="mt-8 bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-bold text-amber-400 mb-3">🤖 Automated Improvement Pipeline</h2>
        <p className="text-slate-300 text-sm mb-4">
          Every piece of feedback goes through our automated workflow:
        </p>
        <ol className="text-slate-400 text-sm space-y-2 list-decimal list-inside">
          <li>Your feedback is submitted as a GitHub issue</li>
          <li>AI agents analyze and prioritize the request</li>
          <li>Implementation is automated where possible</li>
          <li>Changes are validated through CI/CD pipeline</li>
          <li>Qualified fixes are merged automatically</li>
        </ol>
        <p className="text-slate-500 text-xs mt-4">
          No need to code, no environment setup required — simply share your ideas and watch them come to life!
        </p>
      </div>
    </div>
  )
}