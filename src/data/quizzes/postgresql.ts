// Quiz content for PostgreSQL (postgresql) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const postgresqlQuizzes: Record<string, QuizQuestion[]> = {
  postgresql_intro: [
    {
      id: 'postgresql_intro_q1',
      topicId: 'postgresql_intro',
      question: 'What type of database is PostgreSQL?',
      options: [
        'NoSQL document database',
        'Object-relational database',
        'Key-value store',
        'Graph database',
      ],
      correctIndex: 1,
      explanation:
        'PostgreSQL is an object-relational database system (ORDBMS) known for reliability.',
    },
    {
      id: 'postgresql_intro_q2',
      topicId: 'postgresql_intro',
      question: 'What does SERIAL PRIMARY KEY typically create?',
      options: [
        'A text field',
        'An auto-incrementing integer used as unique ID',
        'A boolean field',
        'A date field',
      ],
      correctIndex: 1,
      explanation:
        'SERIAL PRIMARY KEY creates an auto-incrementing integer that uniquely identifies rows.',
    },
  ],

  postgresql_create_table: [
    {
      id: 'postgresql_ct_q1',
      topicId: 'postgresql_create_table',
      question: 'What does CREATE TABLE do?',
      options: [
        'Deletes a table',
        'Creates a new table in the database',
        'Updates a table',
        'Selects from a table',
      ],
      correctIndex: 1,
      explanation: 'CREATE TABLE creates a new table with specified columns and their data types.',
    },
    {
      id: 'postgresql_ct_q2',
      topicId: 'postgresql_create_table',
      question: 'What does VARCHAR(100) specify?',
      options: [
        'A 100-character fixed-length string',
        'A variable-length string up to 100 characters',
        'A number with 100 decimals',
        'A boolean with 100 values',
      ],
      correctIndex: 1,
      explanation: 'VARCHAR(n) is variable-length character data with a maximum of n characters.',
    },
  ],
}
