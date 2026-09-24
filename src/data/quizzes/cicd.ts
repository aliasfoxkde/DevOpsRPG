// Quiz content for CI/CD (cicd) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const cicdQuizzes: Record<string, QuizQuestion[]> = {
  cicd_intro: [
    {
      id: 'cicd_intro_q1',
      topicId: 'cicd_intro',
      question: 'What does CI/CD stand for?',
      options: [
        'Code Integration/Code Delivery',
        'Continuous Integration/Continuous Deployment (or Delivery)',
        'Centralized Integration/Centralized Deployment',
        'Continuous Improvement/Continuous Development',
      ],
      correctIndex: 1,
      explanation: 'CI/CD stands for Continuous Integration and Continuous Deployment/Delivery.',
    },
    {
      id: 'cicd_intro_q2',
      topicId: 'cicd_intro',
      question: 'What is the main benefit of CI/CD?',
      options: [
        'Writing more code',
        'Automating integration and deployment of code changes',
        'Manual testing',
        'Reducing developers',
      ],
      correctIndex: 1,
      explanation:
        'CI/CD automates integrating code changes and deploying them, reducing errors and speeding up delivery.',
    },
  ],

  cicd_pipeline: [
    {
      id: 'cicd_pipe_q1',
      topicId: 'cicd_pipeline',
      question: 'What are typical CI/CD pipeline stages?',
      options: [
        'Code, Test, Deploy',
        'Build, Test, Deploy',
        'Plan, Code, Review',
        'Commit, Push, Pull',
      ],
      correctIndex: 1,
      explanation:
        'Typical pipeline stages are: Build, Test, Deploy (sometimes with additional stages like Security Scan).',
    },
    {
      id: 'cicd_pipe_q2',
      topicId: 'cicd_pipeline',
      question: 'What does the "build" stage typically do?',
      options: [
        'Runs unit tests',
        'Compiles code and creates artifacts',
        'Deploys to production',
        'Creates database schemas',
      ],
      correctIndex: 1,
      explanation:
        'The build stage compiles code, resolves dependencies, and creates deployable artifacts.',
    },
  ],

  cicd_github_actions: [
    {
      id: 'cicd_gh_q1',
      topicId: 'cicd_github_actions',
      question: 'What is GitHub Actions?',
      options: [
        'A code editor',
        'A CI/CD platform that automates workflows from GitHub',
        'A testing framework',
        'A deployment tool only',
      ],
      correctIndex: 1,
      explanation:
        'GitHub Actions is a CI/CD platform that automates build, test, and deployment workflows directly from GitHub.',
    },
    {
      id: 'cicd_gh_q2',
      topicId: 'cicd_github_actions',
      question: 'What file defines a GitHub Actions workflow?',
      options: ['.github/workflows/main.yml', 'dockerfile', 'package.json', '.gitignore'],
      correctIndex: 0,
      explanation: 'GitHub Actions workflows are defined in YAML files in .github/workflows/.',
    },
  ],
}
