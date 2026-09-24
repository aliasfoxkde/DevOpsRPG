// Quiz content for Bash (bash) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const bashQuizzes: Record<string, QuizQuestion[]> = {
  bash_intro: [
    {
      id: 'bash_intro_q1',
      topicId: 'bash_intro',
      question: 'What is Bash?',
      options: [
        'A programming language',
        'A Unix shell and command language',
        'A text editor',
        'A web browser',
      ],
      correctIndex: 1,
      explanation: 'Bash (Bourne Again SHell) is a Unix shell and command language.',
    },
    {
      id: 'bash_intro_q2',
      topicId: 'bash_intro',
      question: 'What character starts a comment in Bash?',
      options: ['//', '#', '--', '/*'],
      correctIndex: 1,
      explanation: '# starts a comment in Bash. Everything after # on a line is ignored.',
    },
  ],

  bash_variables: [
    {
      id: 'bash_var_q1',
      topicId: 'bash_variables',
      question: 'How do you access a variable named "name" in Bash?',
      options: ['$name', '#name', '@name', 'name'],
      correctIndex: 0,
      explanation:
        "$name or ${name} accesses the variable. Without $, it's just the literal string.",
    },
    {
      id: 'bash_var_q2',
      topicId: 'bash_variables',
      question: 'What is special about variable assignment in Bash?',
      options: [
        'Must use let keyword',
        'No spaces around equals sign',
        'Must declare type',
        'Must use $ prefix',
      ],
      correctIndex: 1,
      explanation: 'Bash requires no spaces: name="John" works, but name = "John" does not.',
    },
  ],

  bash_script: [
    {
      id: 'bash_script_q1',
      topicId: 'bash_script',
      question: 'Which statement starts a conditional in Bash?',
      options: ['if (condition)', 'if [ condition ]', 'if condition then', 'when condition'],
      correctIndex: 1,
      explanation:
        'if [ condition ] then ... fi is the Bash if syntax. Spaces inside brackets are required.',
    },
    {
      id: 'bash_script_q2',
      topicId: 'bash_script',
      question: 'How do you loop over items in Bash?',
      options: ['foreach', 'for item in list', 'loop item', 'iterate item'],
      correctIndex: 1,
      explanation: 'for item in list; do ... done loops through items in Bash.',
    },
  ],
}
