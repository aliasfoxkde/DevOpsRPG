// Quiz content for Python (python) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const pythonQuizzes: Record<string, QuizQuestion[]> = {
  py_intro: [
    {
      id: 'py_intro_q1',
      topicId: 'py_intro',
      question: 'Who created Python?',
      options: ['James Gosling', 'Guido van Rossum', 'Bjarne Stroustrup', 'Dennis Ritchie'],
      correctIndex: 1,
      explanation: 'Python was created by Guido van Rossum and released in 1991.',
    },
    {
      id: 'py_intro_q2',
      topicId: 'py_intro',
      question: 'Which of these is NOT a typical use of Python?',
      options: ['Web development', 'Data analysis', 'Hardware programming', 'Automation'],
      correctIndex: 2,
      explanation:
        'Python is used for web dev, data analysis, automation, AI/ML - not typically hardware-level programming.',
    },
  ],

  py_syntax: [
    {
      id: 'py_syntax_q1',
      topicId: 'py_syntax',
      question: 'What does Python use for code blocks instead of curly braces?',
      options: ['Curly braces', 'Indentation', 'Keywords', 'Parentheses'],
      correctIndex: 1,
      explanation: 'Python uses indentation to define code blocks, making it readability-focused.',
    },
    {
      id: 'py_syntax_q2',
      topicId: 'py_syntax',
      question: 'Which statement correctly assigns a variable in Python?',
      options: ['int x = 5', 'var x = 5', 'x = 5', 'let x = 5'],
      correctIndex: 2,
      explanation: 'Python uses dynamic typing: x = 5 creates a variable without type declaration.',
    },
  ],

  py_variables: [
    {
      id: 'py_var_q1',
      topicId: 'py_variables',
      question: 'What is a valid Python variable name?',
      options: ['2variable', 'my-var', 'my_variable', 'class'],
      correctIndex: 2,
      explanation:
        'my_variable is valid. Variable names cannot start with numbers or use hyphens. class is a keyword.',
    },
    {
      id: 'py_var_q2',
      topicId: 'py_variables',
      question: 'Can Python variables change their type after assignment?',
      options: ['No, never', 'Yes, Python is dynamically typed', 'Only numbers', 'Only strings'],
      correctIndex: 1,
      explanation: 'Python is dynamically typed - variables can change type by reassignment.',
    },
  ],

  py_lists: [
    {
      id: 'py_list_q1',
      topicId: 'py_lists',
      question: 'How do you create a list in Python?',
      options: ['list = (1, 2, 3)', 'list = [1, 2, 3]', 'list = {1, 2, 3}', 'list = <1, 2, 3>'],
      correctIndex: 1,
      explanation: 'Lists use square brackets: my_list = [1, 2, 3]',
    },
    {
      id: 'py_list_q2',
      topicId: 'py_lists',
      question: 'What index accesses the first element of a list?',
      options: ['1', '0', 'first', '-1'],
      correctIndex: 1,
      explanation:
        'Like most languages, Python lists are zero-indexed. First element is at index 0.',
    },
  ],

  py_functions: [
    {
      id: 'py_func_q1',
      topicId: 'py_functions',
      question: 'What keyword defines a function in Python?',
      options: ['function', 'func', 'def', 'define'],
      correctIndex: 2,
      explanation: 'def function_name(): defines a function in Python.',
    },
    {
      id: 'py_func_q2',
      topicId: 'py_functions',
      question: 'How do you call a function named "greet"?',
      options: ['call greet()', 'greet()', 'run greet', 'execute greet'],
      correctIndex: 1,
      explanation: 'Functions are called by name with parentheses: greet()',
    },
  ],
}
