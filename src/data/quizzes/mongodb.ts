// Quiz content for MongoDB (mongodb) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const mongodbQuizzes: Record<string, QuizQuestion[]> = {
  mongodb_intro: [
    {
      id: 'mongodb_intro_q1',
      topicId: 'mongodb_intro',
      question: 'What type of database is MongoDB?',
      options: [
        'Relational database',
        'Document-oriented NoSQL database',
        'Graph database',
        'Key-value store',
      ],
      correctIndex: 1,
      explanation:
        'MongoDB is a document-oriented NoSQL database that stores data in JSON-like documents.',
    },
    {
      id: 'mongodb_intro_q2',
      topicId: 'mongodb_intro',
      question: 'What format does MongoDB use for documents?',
      options: ['XML', 'JSON/BSON', 'CSV', 'SQL'],
      correctIndex: 1,
      explanation: 'MongoDB stores data in JSON-like documents (actually BSON - binary JSON).',
    },
  ],

  mongodb_insert: [
    {
      id: 'mongodb_ins_q1',
      topicId: 'mongodb_insert',
      question: 'What method inserts a single document in MongoDB?',
      options: ['insert()', 'insertOne()', 'addOne()', 'createOne()'],
      correctIndex: 1,
      explanation: 'insertOne() inserts a single document into a MongoDB collection.',
    },
    {
      id: 'mongodb_ins_q2',
      topicId: 'mongodb_insert',
      question: 'What is a MongoDB collection?',
      options: [
        'A single data value',
        'A group of MongoDB documents',
        'A database connection',
        'A query result',
      ],
      correctIndex: 1,
      explanation:
        'A collection is a group of documents in MongoDB, similar to a table in relational databases.',
    },
  ],
}
