// Quiz content for Git (git) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const gitQuizzes: Record<string, QuizQuestion[]> = {
  git_intro: [
    {
      id: 'git_intro_q1',
      topicId: 'git_intro',
      question: 'What is Git?',
      options: [
        'A programming language',
        'A distributed version control system',
        'A text editor',
        'A web browser',
      ],
      correctIndex: 1,
      explanation:
        'Git is a distributed version control system for tracking changes in source code.',
    },
    {
      id: 'git_intro_q2',
      topicId: 'git_intro',
      question: 'Who created Git?',
      options: ['Bill Gates', 'Linus Torvalds', 'Steve Jobs', 'Mark Zuckerberg'],
      correctIndex: 1,
      explanation: 'Git was created by Linus Torvalds in 2005 for Linux kernel development.',
    },
  ],

  git_branch: [
    {
      id: 'git_branch_q1',
      topicId: 'git_branch',
      question: 'What command creates a new Git branch?',
      options: ['git new branch', 'git branch <name>', 'git create branch', 'git add branch'],
      correctIndex: 1,
      explanation:
        'git branch <name> creates a new branch. Use git checkout -b to create and switch.',
    },
    {
      id: 'git_branch_q2',
      topicId: 'git_branch',
      question: 'How do you switch to an existing branch called "feature"?',
      options: ['git switch feature', 'git checkout feature', 'git change feature', 'Both A and B'],
      correctIndex: 3,
      explanation: 'Both git checkout feature and git switch feature work to switch branches.',
    },
  ],

  git_remote: [
    {
      id: 'git_remote_q1',
      topicId: 'git_remote',
      question: 'What command uploads your commits to a remote repository?',
      options: ['git upload', 'git send', 'git push', 'git sync'],
      correctIndex: 2,
      explanation: 'git push uploads your local commits to the remote repository.',
    },
    {
      id: 'git_remote_q2',
      topicId: 'git_remote',
      question: 'Which service is NOT a Git hosting platform?',
      options: ['GitHub', 'GitLab', 'Bitbucket', 'GitWare'],
      correctIndex: 3,
      explanation:
        'GitHub, GitLab, and Bitbucket are popular Git hosting services. GitWare is not real.',
    },
  ],
}
