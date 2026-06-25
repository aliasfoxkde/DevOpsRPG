import { useParams, Link } from 'react-router-dom'
import { useGame } from '@/contexts'
import { technologies } from '../data/technologies'
import { w3schoolsContent } from '../data/w3schools-content'
import { Button } from '@/components/ui'
import { Check } from 'lucide-react'

export default function TechnologyPage() {
  const { technology } = useParams()
  const tech = technologies[technology as keyof typeof technologies]
  const { completeLearningTopic, isLearningTopicCompleted, game } = useGame()

  if (!tech) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Technology not found</h1>
        <Link to="/learn" className="text-primary hover:underline mt-4 inline-block">
          Back to Learn
        </Link>
      </div>
    )
  }

  const content = w3schoolsContent.technologies[technology as keyof typeof w3schoolsContent.technologies]

  const handleMarkComplete = (topicId: string) => {
    /* istanbul ignore next - technology is always defined when this is called */
    completeLearningTopic(topicId, technology ?? '', tech.xpPerTopic)
  }

  const completedTopics = game.completedTopics.map(t => t.topicId)

  /* istanbul ignore next - content always exists for valid technologies */
  const completedCount = content?.topics.filter(t => completedTopics.includes(t.id)).length ?? 0
  /* istanbul ignore next - content always exists for valid technologies */
  const totalCount = content?.topics.length ?? 0

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/learn"
        className="text-primary hover:underline mb-4 inline-block focus:outline-none focus:ring-2 focus:ring-primary rounded"
        aria-label="Back to Learn page"
      >
        Back to Learn
      </Link>

      <header className="flex items-center gap-4 mb-8">
        <span className="text-4xl" aria-hidden="true">{tech.icon}</span>
        <div>
          <h1 className="text-3xl font-bold">{tech.name}</h1>
          <p className="text-muted-foreground">{tech.description}</p>
        </div>
      </header>

      <section
        className="mb-8 bg-card rounded-lg border border-border p-4"
        aria-labelledby="progress-heading"
      >
        <h2 id="progress-heading" className="sr-only">Technology Progress</h2>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Technology Progress</span>
          <span className="text-sm text-muted-foreground" aria-live="polite">
            {completedCount} / {totalCount} completed
          </span>
        </div>
        <div
          className="w-full bg-muted rounded-full h-2"
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-label={`${tech.name} progress: ${completedCount} of ${totalCount} topics completed`}
        >
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            /* istanbul ignore next */
            style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </section>

      <section aria-label={`${tech.name} Topics`}>
        <h2 className="sr-only">{tech.name} Topics</h2>
        <div className="grid gap-6">
          {content?.topics.map((topic) => {
            const isCompleted = isLearningTopicCompleted(topic.id)

            return (
              <article
                key={topic.id}
                className={`bg-card rounded-lg border border-border p-6 ${isCompleted ? 'opacity-75' : ''}`}
                aria-labelledby={`topic-${topic.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 id={`topic-${topic.id}`} className="text-xl font-semibold mb-4">
                      {topic.name}
                      {isCompleted && (
                        <span className="ml-2 text-green-500 text-sm font-normal" aria-label="Completed">
                          Completed
                        </span>
                      )}
                    </h3>

                    <div className="space-y-4">
                      {topic.sections.map((section, idx) => (
                        <section key={idx} aria-labelledby={`section-${topic.id}-${idx}`}>
                          <h4 id={`section-${topic.id}-${idx}`} className="font-medium mb-2">
                            {section.heading}
                          </h4>
                          <p className="text-muted-foreground">{section.content}</p>
                        </section>
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
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <Button
                    onClick={() => handleMarkComplete(topic.id)}
                    disabled={isCompleted}
                    variant={isCompleted ? 'secondary' : 'primary'}
                    aria-describedby={isCompleted ? undefined : `topic-${topic.id}-desc`}
                  >
                    {isCompleted ? (
                      <>
                        <Check className="w-4 h-4 mr-2" aria-hidden="true" />
                        Completed (+{tech.xpPerTopic} XP)
                      </>
                    ) : (
                      `Mark as Complete (+${tech.xpPerTopic} XP)`
                    )}
                  </Button>
                  <span id={`topic-${topic.id}-desc`} className="sr-only">
                    Mark this topic as complete to earn {tech.xpPerTopic} XP
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
