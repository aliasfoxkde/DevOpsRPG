// Quiz content for JavaScript (javascript) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const javascriptQuizzes: Record<string, QuizQuestion[]> = {
  js_intro: [
    {
      id: 'js_intro_q1',
      topicId: 'js_intro',
      question: 'What is JavaScript primarily used for?',
      options: [
        'Styling web pages',
        'Structuring web content',
        'Adding interactivity to web pages',
        'Database management',
      ],
      correctIndex: 2,
      explanation:
        'JavaScript is the programming language of the web, used for adding interactivity.',
    },
    {
      id: 'js_intro_q2',
      topicId: 'js_intro',
      question: 'Which method changes HTML content?',
      options: [
        'document.getElementById()',
        'document.innerHTML()',
        'element.getContent()',
        'element.setHTML()',
      ],
      correctIndex: 1,
      explanation: 'document.getElementById(id).innerHTML = "new content" changes element content.',
    },
  ],

  js_variables: [
    {
      id: 'js_var_q1',
      topicId: 'js_variables',
      question: 'Which keyword declares a block-scoped variable?',
      options: ['var', 'let', 'const', 'Both let and const'],
      correctIndex: 3,
      explanation: 'Both let and const are block-scoped. var is function-scoped.',
    },
    {
      id: 'js_var_q2',
      topicId: 'js_variables',
      question: 'What is a valid variable name in JavaScript?',
      options: ['2name', 'my-var', 'my_var', 'my var'],
      correctIndex: 2,
      explanation:
        'Variable names can contain letters, numbers, underscores, and dollar signs. Cannot start with a number.',
    },
    {
      id: 'js_var_code1',
      topicId: 'js_variables',
      question:
        'Code Challenge: Declare a constant "PI" with value 3.14159, then log it to the console.',
      type: 'code_challenge',
      codeTemplate: '// Declare a constant PI with value 3.14159\n// Then log it to the console\n',
      expectedOutput: '3.14159',
      hint: 'Use: const PI = 3.14159; then console.log(PI);',
      explanation: 'Constants are declared with the "const" keyword and cannot be reassigned.',
    },
  ],

  js_functions: [
    {
      id: 'js_func_q1',
      topicId: 'js_functions',
      question: 'How do you call a function named "myFunction"?',
      options: ['call myFunction()', 'myFunction', 'myFunction()', 'run myFunction'],
      correctIndex: 2,
      explanation:
        'Functions are called by writing their name followed by parentheses: myFunction().',
    },
    {
      id: 'js_func_q2',
      topicId: 'js_functions',
      question: 'What does a function return if no return statement is specified?',
      options: ['0', 'null', 'undefined', 'false'],
      correctIndex: 2,
      explanation: 'Functions return undefined by default if no explicit return value is given.',
    },
  ],

  js_objects: [
    {
      id: 'js_obj_q1',
      topicId: 'js_objects',
      question: 'How do you access the "name" property of an object called "person"?',
      options: ['person->name', 'person.name', 'person[name]', 'Both B and C'],
      correctIndex: 3,
      explanation:
        'Object properties can be accessed with dot notation (person.name) or bracket notation (person["name"]).',
    },
    {
      id: 'js_obj_q2',
      topicId: 'js_objects',
      question: 'Which keyword is used to create an object?',
      options: ['object', 'new Object()', 'create', 'make'],
      correctIndex: 1,
      explanation: 'new Object() or object literal syntax { } creates objects.',
    },
  ],

  js_arrays: [
    {
      id: 'js_arr_q1',
      topicId: 'js_arrays',
      question: 'What is the index of the first element in a JavaScript array?',
      options: ['1', '0', 'first', 'A'],
      correctIndex: 1,
      explanation: 'JavaScript arrays are zero-indexed, meaning the first element is at index 0.',
    },
    {
      id: 'js_arr_q2',
      topicId: 'js_arrays',
      question: 'Which method adds an element to the end of an array?',
      options: ['push()', 'pop()', 'shift()', 'unshift()'],
      correctIndex: 0,
      explanation:
        'push() adds elements to the end. pop() removes from end, shift() removes from start.',
    },
  ],
}
