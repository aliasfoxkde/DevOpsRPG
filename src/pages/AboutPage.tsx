import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">⚔️</div>
          <h1 className="text-4xl font-bold text-amber-400 mb-4">DevOpsQuest</h1>
          <p className="text-xl text-slate-300">
            An Open Source Gamified DevOps Learning Experience
          </p>
        </div>

        {/* What is DevOpsQuest */}
        <section className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 mb-8">
          <h2 className="text-2xl font-bold text-amber-400 mb-4">🎮 What is DevOpsQuest?</h2>
          <div className="prose prose-invert prose-amber max-w-none">
            <p className="text-slate-300 leading-relaxed mb-4">
              DevOpsQuest is an <span className="text-amber-400 font-semibold">open-source project</span> designed to make learning DevOps concepts engaging and fun. Instead of passive watching or reading, you actively level up your character by completing real-world challenges across the DevOps pipeline.
            </p>
            <p className="text-slate-300 leading-relaxed">
              The game covers topics including: <span className="text-amber-400">Linux fundamentals</span>, <span className="text-amber-400">Bash scripting</span>, <span className="text-amber-400">Git & version control</span>, <span className="text-amber-400">CI/CD pipelines</span>, <span className="text-amber-400">Docker & containers</span>, <span className="text-amber-400">Kubernetes orchestration</span>, <span className="text-amber-400">AWS cloud services</span>, <span className="text-amber-400">Ansible automation</span>, and <span className="text-amber-400">DevOps culture & practices</span>.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gradient-to-br from-amber-900/20 to-slate-800/50 rounded-2xl border border-amber-600/30 p-8 mb-8">
          <h2 className="text-2xl font-bold text-amber-400 mb-6">⚔️ How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">1️⃣</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Choose Your Quest</h3>
              <p className="text-slate-400 text-sm">Browse available quests across different realms and topics. Each quest has a difficulty level and XP reward.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">2️⃣</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Battle & Learn</h3>
              <p className="text-slate-400 text-sm">Answer questions based on real documentation. Complete quests to earn XP, level up, and unlock new areas.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">3️⃣</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Level Up</h3>
              <p className="text-slate-400 text-sm">Track your progress, earn achievements, maintain streaks, and become a DevOps master!</p>
            </div>
          </div>
        </section>

        {/* AI Pipeline Experiment */}
        <section className="bg-gradient-to-br from-purple-900/30 to-slate-800/50 rounded-2xl border border-purple-600/30 p-8 mb-8">
          <h2 className="text-2xl font-bold text-purple-400 mb-4">🧪 AI Pipeline Experiment</h2>
          <div className="prose prose-invert prose-purple max-w-none">
            <p className="text-slate-300 leading-relaxed mb-4">
              DevOpsQuest is more than just a game — it's an <span className="text-purple-400 font-semibold">AI pipeline experiment</span>. The project explores how large language models (LLMs) can be used to generate dynamic learning content, adaptive quizzes, and personalized feedback at scale.
            </p>
            <ul className="text-slate-300 space-y-2">
              <li>🤖 AI-generated quiz questions that adapt to your skill level</li>
              <li>📝 Dynamic content scraping and question generation from documentation</li>
              <li>🎯 Personalized learning paths based on your progress</li>
              <li>⚡ Automated testing and validation of AI-generated content</li>
            </ul>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">🛠️ Built With</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'React', color: 'bg-cyan-600' },
              { name: 'TypeScript', color: 'bg-blue-600' },
              { name: 'Tailwind', color: 'bg-cyan-500' },
              { name: 'Vite', color: 'bg-purple-600' },
              { name: 'React Router', color: 'bg-red-500' },
              { name: 'Cloudflare', color: 'bg-orange-500' },
              { name: 'Vitest', color: 'bg-green-600' },
              { name: 'Playwright', color: 'bg-purple-500' },
            ].map((tech) => (
              <div
                key={tech.name}
                className={`${tech.color} text-white px-4 py-2 rounded-lg text-center font-medium text-sm`}
              >
                {tech.name}
              </div>
            ))}
          </div>
        </section>

        {/* Open Source */}
        <section className="bg-gradient-to-br from-green-900/30 to-slate-800/50 rounded-2xl border border-green-600/30 p-8 mb-8">
          <h2 className="text-2xl font-bold text-green-400 mb-4">🌱 Open Source</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            DevOpsQuest is completely open source and freely available. We believe everyone should have access to quality DevOps education regardless of their background or resources.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com/aliasfoxkde/DevOpsRPG"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors"
            >
              <span>🐙</span>
              <span>View on GitHub</span>
            </a>
            <a
              href="https://f7b4e42f.devopsquest.pages.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors"
            >
              <span>🎮</span>
              <span>Play the Game</span>
            </a>
          </div>
        </section>

        {/* Contribute */}
        <section className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">🤝 Contributing</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            Want to improve DevOpsQuest? Contributions are welcome! Whether it's fixing bugs, adding new topics, improving the UI, or enhancing the AI content generation — every bit helps make this a better learning resource.
          </p>
          <ul className="text-slate-300 space-y-2">
            <li>🐛 Report bugs via GitHub Issues</li>
            <li>📖 Improve documentation</li>
            <li>➕ Add new quiz topics or questions</li>
            <li>🎨 Enhance UI/UX</li>
            <li>🤖 Improve AI content generation</li>
          </ul>
        </section>

        {/* Back Home */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-slate-700 text-center text-slate-500 text-sm">
          <p>DevOpsQuest — Open Source DevOps Education</p>
          <p className="mt-2">
            Built with ⚡ by developers, for developers.
          </p>
        </footer>
      </div>
    </div>
  )
}
