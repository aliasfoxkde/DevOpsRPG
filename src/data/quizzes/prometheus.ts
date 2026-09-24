// Quiz content for Prometheus (prometheus) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const prometheusQuizzes: Record<string, QuizQuestion[]> = {
  prom_intro: [
    {
      id: 'prom_intro_q1',
      topicId: 'prom_intro',
      question: 'What is Prometheus primarily used for?',
      options: [
        'Code compilation',
        'Systems monitoring and alerting',
        'Container orchestration',
        'Database management',
      ],
      correctIndex: 1,
      explanation: 'Prometheus is an open-source systems monitoring and alerting toolkit.',
    },
    {
      id: 'prom_intro_q2',
      topicId: 'prom_intro',
      question: 'What type of data does Prometheus collect?',
      options: ['Text documents', 'Time series metrics', 'Video files', 'Source code'],
      correctIndex: 1,
      explanation: 'Prometheus collects and stores metrics as time series data (with timestamps).',
    },
  ],

  prom_metrics: [
    {
      id: 'prom_met_q1',
      topicId: 'prom_metrics',
      question: 'Which metric type represents a value that can go up and down?',
      options: ['Counter', 'Gauge', 'Histogram', 'Summary'],
      correctIndex: 1,
      explanation:
        'Gauge metrics represent values that can arbitrarily go up and down (like temperature or memory usage).',
    },
    {
      id: 'prom_met_q2',
      topicId: 'prom_metrics',
      question: 'Which metric type always increases (never decreases)?',
      options: ['Gauge', 'Counter', 'Histogram', 'Summary'],
      correctIndex: 1,
      explanation:
        'Counter metrics only increase (or reset to zero), useful for counting requests or errors.',
    },
  ],
}
