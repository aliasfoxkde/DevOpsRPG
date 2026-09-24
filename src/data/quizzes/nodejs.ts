// Quiz content for Node.js (nodejs) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const nodejsQuizzes: Record<string, QuizQuestion[]> = {
  nodejs_intro: [
    {
      id: 'nodejs_intro_q1',
      topicId: 'nodejs_intro',
      question: 'What is Node.js?',
      options: [
        'A frontend framework',
        'A database',
        'A JavaScript runtime that runs outside the browser',
        'A CSS preprocessor',
      ],
      correctIndex: 2,
      explanation:
        'Node.js is a JavaScript runtime environment that executes JavaScript code outside a browser.',
    },
    {
      id: 'nodejs_intro_q2',
      topicId: 'nodejs_intro',
      question: 'What makes Node.js good for server-side development?',
      options: [
        'It blocks I/O operations',
        'Event-driven, non-blocking I/O',
        'It only works with databases',
        'It requires a browser',
      ],
      correctIndex: 1,
      explanation:
        'Node.js uses an event-driven, non-blocking I/O model, making it efficient for I/O-heavy tasks.',
    },
  ],

  nodejs_modules: [
    {
      id: 'nodejs_mod_q1',
      topicId: 'nodejs_modules',
      question: 'How do you import a module named "fs" in Node.js?',
      options: [
        'import fs from "fs"',
        'require("fs") or import { fs } from "fs"',
        'include("fs")',
        'load("fs")',
      ],
      correctIndex: 1,
      explanation:
        'CommonJS uses require(), ES6 modules use import. Both work depending on module type.',
    },
    {
      id: 'nodejs_mod_q2',
      topicId: 'nodejs_modules',
      question: 'What does module.exports do?',
      options: [
        'Imports a module',
        'Exports a module for use in other files',
        'Creates a new module',
        'Deletes a module',
      ],
      correctIndex: 1,
      explanation:
        'module.exports or export default specifies what a module exposes to other modules.',
    },
  ],

  nodejs_http: [
    {
      id: 'nodejs_http_q1',
      topicId: 'nodejs_http',
      question: 'What does http.createServer() do?',
      options: [
        'Creates a database connection',
        'Creates an HTTP server that listens for requests',
        'Creates a file server',
        'Creates a web page',
      ],
      correctIndex: 1,
      explanation:
        'http.createServer() creates an HTTP server that can listen for and respond to requests.',
    },
    {
      id: 'nodejs_http_q2',
      topicId: 'nodejs_http',
      question: 'What does res.writeHead() do?',
      options: [
        'Reads request headers',
        'Writes response headers',
        'Creates a router',
        'Logs HTTP requests',
      ],
      correctIndex: 1,
      explanation:
        'res.writeHead() writes HTTP response headers (status code, content type, etc.).',
    },
  ],
}
