// Quiz content for React (react) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const reactQuizzes: Record<string, QuizQuestion[]> = {
  react_intro: [
    {
      id: 'react_intro_q1',
      topicId: 'react_intro',
      question: 'What is React primarily used for?',
      options: [
        'Backend development',
        'Database management',
        'Building user interfaces',
        'Operating system development',
      ],
      correctIndex: 2,
      explanation: 'React is a JavaScript library for building user interfaces (UIs).',
    },
    {
      id: 'react_intro_q2',
      topicId: 'react_intro',
      question: 'What is the Virtual DOM in React?',
      options: [
        'A separate browser window',
        'A lightweight copy of the actual DOM',
        'A type of database',
        'A CSS framework',
      ],
      correctIndex: 1,
      explanation:
        "React's Virtual DOM is a lightweight representation of the actual DOM for efficient updates.",
    },
  ],

  react_components: [
    {
      id: 'react_comp_q1',
      topicId: 'react_components',
      question: 'What are React components?',
      options: [
        'HTML tags',
        'Independent, reusable pieces of UI',
        'CSS styles',
        'Database queries',
      ],
      correctIndex: 1,
      explanation: 'Components are independent, reusable pieces of UI that return JSX.',
    },
    {
      id: 'react_comp_q2',
      topicId: 'react_components',
      question: 'What are props in React?',
      options: [
        'CSS properties',
        'Inputs passed from parent to child components',
        'State variables',
        'Event handlers',
      ],
      correctIndex: 1,
      explanation:
        'Props (properties) are inputs passed from parent components to child components.',
    },
  ],

  react_hooks: [
    {
      id: 'react_hooks_q1',
      topicId: 'react_hooks',
      question: 'What does useState do in React?',
      options: [
        'Creates a global variable',
        'Adds state to functional components',
        'Connects to a database',
        'Defines CSS styles',
      ],
      correctIndex: 1,
      explanation: 'useState is a hook that adds state management to functional components.',
    },
    {
      id: 'react_hooks_q2',
      topicId: 'react_hooks',
      question: 'What does useEffect do in React?',
      options: [
        'Creates animations',
        'Handles side effects in components',
        'Manages routing',
        'Styles components',
      ],
      correctIndex: 1,
      explanation:
        'useEffect handles side effects like data fetching, subscriptions, and DOM updates.',
    },
  ],
}
