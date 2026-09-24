// Quiz content for API Design (api_design) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const apiDesignQuizzes: Record<string, QuizQuestion[]> = {
  api_intro: [
    {
      id: 'api_intro_q1',
      topicId: 'api_intro',
      question: 'What does API stand for?',
      options: [
        'Application Programming Interface',
        'Advanced Programming Integration',
        'Application Process Interface',
        'Automated Programming Interface',
      ],
      correctIndex: 0,
      explanation:
        'API stands for Application Programming Interface - a set of rules that allows software to communicate.',
    },
    {
      id: 'api_intro_q2',
      topicId: 'api_intro',
      question: 'What is the purpose of an API?',
      options: [
        'To store data in a database',
        'To allow different software applications to communicate',
        'To render HTML pages',
        'To manage operating system resources',
      ],
      correctIndex: 1,
      explanation:
        'APIs enable different software systems to communicate and share data without exposing implementation details.',
    },
  ],

  api_rest: [
    {
      id: 'api_rest_q1',
      topicId: 'api_rest',
      question: 'What does REST stand for?',
      options: [
        'Representational State Transfer',
        'Remote Execution State Transfer',
        'Replicated State Transaction',
        'Reliable State Transport',
      ],
      correctIndex: 0,
      explanation:
        'REST (Representational State Transfer) is an architectural style for web services.',
    },
    {
      id: 'api_rest_q2',
      topicId: 'api_rest',
      question: 'Which HTTP method is idempotent?',
      options: ['POST', 'PATCH', 'PUT', 'DELETE'],
      correctIndex: 2,
      explanation:
        'PUT is idempotent - calling it multiple times produces the same result. POST and PATCH are not necessarily idempotent.',
    },
  ],

  api_auth: [
    {
      id: 'api_auth_q1',
      topicId: 'api_auth',
      question: 'What does JWT stand for?',
      options: [
        'Java Web Token',
        'JSON Web Token',
        'JavaScript Web Token',
        'JavaScript Web Transfer',
      ],
      correctIndex: 1,
      explanation:
        'JWT (JSON Web Token) is a compact, self-contained way to securely transmit information as JSON.',
    },
    {
      id: 'api_auth_q2',
      topicId: 'api_auth',
      question: 'What is OAuth used for?',
      options: [
        'Database authentication',
        'Authorization - granting access without sharing passwords',
        'Email transmission',
        'File encryption',
      ],
      correctIndex: 1,
      explanation:
        'OAuth allows users to grant third-party applications access to their resources without sharing passwords.',
    },
  ],

  api_graphql: [
    {
      id: 'api_graphql_q1',
      topicId: 'api_graphql',
      question: 'What type of API does GraphQL use?',
      options: ['REST', 'Query-based', 'SOAP', 'RPC'],
      correctIndex: 1,
      explanation:
        'GraphQL uses a query-based approach where clients specify exactly what data they need.',
    },
    {
      id: 'api_graphql_q2',
      topicId: 'api_graphql',
      question: 'What is a GraphQL schema?',
      options: ['Database structure', 'Type definitions for API', 'API endpoint', 'Request format'],
      correctIndex: 1,
      explanation:
        'A GraphQL schema defines types and relationships for your API using SDL (Schema Definition Language).',
    },
  ],
}
