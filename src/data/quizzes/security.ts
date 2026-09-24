// Quiz content for DevOps Security (security) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const securityQuizzes: Record<string, QuizQuestion[]> = {
  sec_intro: [
    {
      id: 'sec_intro_q1',
      topicId: 'sec_intro',
      question: 'What does DevSecOps mean?',
      options: [
        'Development, Security, Operations integrated',
        'Secure Development Operations',
        'Development Security Only',
        'Standard Security Operations',
      ],
      correctIndex: 0,
      explanation:
        'DevSecOps integrates security practices into the DevOps workflow, making security a shared responsibility.',
    },
    {
      id: 'sec_intro_q2',
      topicId: 'sec_intro',
      question: 'What is the principle of least privilege?',
      options: [
        'Give users maximum permissions',
        'Give users only the minimum permissions needed',
        'Remove all privileges',
        'Share privileges among all users',
      ],
      correctIndex: 1,
      explanation:
        'Least privilege means giving users only the minimum permissions needed to perform their tasks.',
    },
  ],

  sec_best_practices: [
    {
      id: 'sec_best_q1',
      topicId: 'sec_best_practices',
      question: 'Where should secrets (passwords, API keys) be stored?',
      options: [
        'In source code',
        'In environment variables or secret management tools',
        'In plain text files',
        'In comments',
      ],
      correctIndex: 1,
      explanation:
        'Secrets should never be in code. Use environment variables or tools like HashiCorp Vault.',
    },
    {
      id: 'sec_best_q2',
      topicId: 'sec_best_practices',
      question: 'What is defense in depth?',
      options: [
        'A single security layer',
        'Multiple layers of security controls',
        'Aggressive security testing',
        'Removing all defenses',
      ],
      correctIndex: 1,
      explanation:
        'Defense in depth uses multiple layers of security so that if one fails, others provide protection.',
    },
  ],

  sec_secrets: [
    {
      id: 'sec_sec_q1',
      topicId: 'sec_secrets',
      question: 'What is a Kubernetes Secret used for?',
      options: [
        'Storing user passwords only',
        'Storing sensitive data like passwords, tokens, and keys',
        'Encrypting entire disks',
        'Creating user accounts',
      ],
      correctIndex: 1,
      explanation:
        'Kubernetes Secrets store sensitive data like passwords, OAuth tokens, and SSH keys.',
    },
    {
      id: 'sec_sec_q2',
      topicId: 'sec_secrets',
      question: 'Why should you avoid hardcoding secrets?',
      options: [
        'It makes code run slower',
        'Secrets can be exposed in code repositories and version control',
        'It increases performance',
        'It is required by law',
      ],
      correctIndex: 1,
      explanation:
        'Hardcoded secrets end up in git history and can be exposed if the repo is public or compromised.',
    },
  ],
}
