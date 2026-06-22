import { Link } from 'react-router-dom'
import { technologies } from '../data/technologies'

const phaseOrder = [
  { phase: 1, name: 'Foundations', icon: '🏗️' },
  { phase: 2, name: 'Backend Basics', icon: '⚙️' },
  { phase: 3, name: 'Frameworks & Databases', icon: '🗄️' },
  { phase: 4, name: 'Advanced & Cloud', icon: '☁️' },
  { phase: 5, name: 'Modern DevOps', icon: '🚀' },
]

export default function LearnPage() {
  const techArray = Object.entries(technologies).map(([key, tech]) => ({
    key,
    ...tech,
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Learn DevOps</h1>

      {phaseOrder.map(({ phase, name, icon }) => {
        const phaseTechs = techArray.filter((t) => t.phase === phase)
        if (phaseTechs.length === 0) return null

        return (
          <section key={phase} className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              {icon} {name}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {phaseTechs.map((tech) => (
                <Link
                  key={tech.key}
                  to={`/learn/${tech.key}`}
                  className="bg-card p-4 rounded-lg border border-border hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{tech.icon}</span>
                    <h3 className="font-semibold">{tech.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{tech.description}</p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {tech.topics.length} topics
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
