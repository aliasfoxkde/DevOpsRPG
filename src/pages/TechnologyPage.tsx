import { useParams, Link } from 'react-router-dom'
import { technologies } from '../data/technologies'
import { w3schoolsContent } from '../data/w3schools-content'

export default function TechnologyPage() {
  const { technology } = useParams()
  const tech = technologies[technology as keyof typeof technologies]

  if (!tech) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Technology not found</h1>
        <Link to="/learn" className="text-primary hover:underline mt-4 inline-block">
          ← Back to Learn
        </Link>
      </div>
    )
  }

  const content = w3schoolsContent.technologies[technology as keyof typeof w3schoolsContent.technologies]

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/learn" className="text-primary hover:underline mb-4 inline-block">
        ← Back to Learn
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <span className="text-4xl">{tech.icon}</span>
        <div>
          <h1 className="text-3xl font-bold">{tech.name}</h1>
          <p className="text-muted-foreground">{tech.description}</p>
        </div>
      </div>

      <div className="grid gap-6">
        {content?.topics.map((topic) => (
          <div
            key={topic.id}
            className="bg-card rounded-lg border border-border p-6"
          >
            <h2 className="text-xl font-semibold mb-4">{topic.name}</h2>

            <div className="space-y-4">
              {topic.sections.map((section, idx) => (
                <div key={idx}>
                  <h3 className="font-medium mb-2">{section.heading}</h3>
                  <p className="text-muted-foreground">{section.content}</p>
                </div>
              ))}
            </div>

            {topic.codeExamples.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">Code Examples:</h4>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{topic.codeExamples[0]}</code>
                </pre>
              </div>
            )}

            <button className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90">
              Mark as Complete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
