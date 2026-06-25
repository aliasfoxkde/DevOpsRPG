import { Link } from 'react-router-dom'
import { technologies } from '../data/technologies'

const phaseOrder = [
  { phase: 1, name: 'Foundations', icon: '🏗️' },
  { phase: 2, name: 'Backend Basics', icon: '⚙️' },
  { phase: 3, name: 'Frameworks & Databases', icon: '🗄️' },
  { phase: 4, name: 'Advanced & Cloud', icon: '☁️' },
  { phase: 5, name: 'Modern DevOps', icon: '🚀' },
  { phase: 6, name: 'AI & Intelligence', icon: '🤖' },
  { phase: 7, name: 'Service Mesh', icon: '🔗' },
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
        /* istanbul ignore if */
        if (phaseTechs.length === 0) return null

        return (
          <section key={phase} className="mb-12" aria-labelledby={`phase-${phase}-heading`}>
            <h2 id={`phase-${phase}-heading`} className="text-2xl font-semibold mb-4">
              <span /* istanbul ignore next */ aria-hidden="true">{icon}</span> {name}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" role="list" aria-label={`${name} technologies`}>
              {phaseTechs.map((tech) => (
                <Link
                  key={tech.key}
                  to={`/learn/${tech.key}`}
                  /* istanbul ignore next */
                  className="bg-card p-4 rounded-lg border border-border hover:border-primary hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                  role="listitem"
                  aria-label={`Learn ${tech.name}: ${tech.description}. ${tech.topics.length} topics`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl" aria-hidden="true">{tech.icon}</span>
                    <h3 className="font-semibold">{tech.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{tech.description}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {tech.topics.length} topics
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
