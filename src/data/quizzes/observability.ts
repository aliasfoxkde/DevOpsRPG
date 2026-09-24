// Quiz content for Observability (observability) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const observabilityQuizzes: Record<string, QuizQuestion[]> = {
  obs_intro: [
    {
      id: 'obs_intro_q1',
      topicId: 'obs_intro',
      question: 'What are the three pillars of observability?',
      options: [
        'Metrics, Logs, Traces',
        'CPU, Memory, Network',
        'Applications, Databases, Servers',
        'Monitoring, Logging, Alerting',
      ],
      correctIndex: 0,
      explanation:
        'The three pillars are Metrics (numerical data), Logs (event records), and Traces (request paths).',
    },
    {
      id: 'obs_intro_q2',
      topicId: 'obs_intro',
      question: 'What is observability in DevOps?',
      options: [
        'The ability to see infrastructure',
        'The ability to understand internal system state from external outputs',
        'Monitoring only',
        'Logging only',
      ],
      correctIndex: 1,
      explanation:
        'Observability is the ability to understand internal system state from external outputs like metrics, logs, and traces.',
    },
  ],

  obs_grafana: [
    {
      id: 'obs_graf_q1',
      topicId: 'obs_grafana',
      question: 'What is Grafana primarily used for?',
      options: [
        'Log aggregation',
        'Distributed tracing',
        'Data visualization and monitoring dashboards',
        'Container orchestration',
      ],
      correctIndex: 2,
      explanation:
        'Grafana is an open-source platform for data visualization, monitoring, and alerting with customizable dashboards.',
    },
    {
      id: 'obs_graf_q2',
      topicId: 'obs_grafana',
      question: 'Which database is commonly used with Grafana for metrics storage?',
      options: ['MySQL', 'MongoDB', 'Prometheus', 'Redis'],
      correctIndex: 2,
      explanation:
        'Prometheus is commonly used as a data source for Grafana, often deployed together in the Prometheus/Grafana stack.',
    },
  ],

  obs_loki: [
    {
      id: 'obs_loki_q1',
      topicId: 'obs_loki',
      question: 'What is Loki primarily designed for?',
      options: ['Metrics collection', 'Distributed tracing', 'Log aggregation', 'Alert management'],
      correctIndex: 2,
      explanation:
        'Loki is a horizontally-scalable, highly-available log aggregation system, designed to work with Grafana.',
    },
    {
      id: 'obs_loki_q2',
      topicId: 'obs_loki',
      question: 'How does Loki differ from Elasticsearch for logs?',
      options: [
        'Loki indexes only labels, not log content',
        'Loki is faster than Elasticsearch',
        'Loki is a database while Elasticsearch is not',
        'There is no difference',
      ],
      correctIndex: 0,
      explanation:
        'Loki only indexes metadata (labels) rather than full log content, making it more cost-effective than Elasticsearch.',
    },
  ],

  obs_tracing: [
    {
      id: 'obs_trace_q1',
      topicId: 'obs_tracing',
      question: 'What is distributed tracing?',
      options: [
        'Tracing network cables',
        'Tracking a request across multiple services',
        'Debugging a single application',
        'Monitoring server hardware',
      ],
      correctIndex: 1,
      explanation:
        'Distributed tracing tracks a request as it flows through multiple services in a microservices architecture.',
    },
    {
      id: 'obs_trace_q2',
      topicId: 'obs_tracing',
      question: 'What is a span in distributed tracing?',
      options: [
        'A unit of work in a single service',
        'A type of database',
        'A monitoring tool',
        'A network protocol',
      ],
      correctIndex: 0,
      explanation:
        'A span represents a single unit of work (operation) in a trace, with timing and metadata about that operation.',
    },
  ],
}
