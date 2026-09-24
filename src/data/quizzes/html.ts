// Quiz content for HTML (html) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const htmlQuizzes: Record<string, QuizQuestion[]> = {
  html_intro: [
    {
      id: 'html_intro_q1',
      topicId: 'html_intro',
      question: 'What does HTML stand for?',
      options: [
        'Hyper Text Markup Language',
        'High Tech Modern Language',
        'Hyper Transfer Markup Language',
        'Home Tool Markup Language',
      ],
      correctIndex: 0,
      explanation:
        'HTML stands for Hyper Text Markup Language - the standard language for creating web pages.',
    },
    {
      id: 'html_intro_q2',
      topicId: 'html_intro',
      question: 'What is the correct HTML element for the largest heading?',
      options: ['<heading>', '<h6>', '<h1>', '<head>'],
      correctIndex: 2,
      explanation:
        '<h1> defines the most important heading. Headings go from <h1> (largest) to <h6> (smallest).',
    },
  ],

  html_basic: [
    {
      id: 'html_basic_q1',
      topicId: 'html_basic',
      question: 'Which HTML element defines the visible content?',
      options: ['<body>', '<content>', '<visible>', '<html>'],
      correctIndex: 0,
      explanation: 'The <body> element contains all the visible contents of the page.',
    },
    {
      id: 'html_basic_q2',
      topicId: 'html_basic',
      question: 'Which tag creates a hyperlink?',
      options: ['<link>', '<a>', '<href>', '<url>'],
      correctIndex: 1,
      explanation:
        'The <a> (anchor) tag creates hyperlinks. The href attribute specifies the link destination.',
    },
  ],

  html_elements: [
    {
      id: 'html_elements_q1',
      topicId: 'html_elements',
      question: 'What are HTML elements made of?',
      options: [
        'Only start tags',
        'Start tag, content, and end tag',
        'Only end tags',
        'Only content',
      ],
      correctIndex: 1,
      explanation:
        'HTML elements consist of a start tag, content, and an end tag (for most elements).',
    },
    {
      id: 'html_elements_q2',
      topicId: 'html_elements',
      question: 'Which is an example of an empty (self-closing) element?',
      options: ['<div>', '<span>', '<br>', '<p>'],
      correctIndex: 2,
      explanation: '<br> is an empty element that defines a line break. It has no end tag.',
    },
  ],

  html_attributes: [
    {
      id: 'html_attr_q1',
      topicId: 'html_attributes',
      question: 'What do HTML attributes provide?',
      options: [
        'Additional information about elements',
        'Styles for elements',
        'JavaScript functionality',
        'Database connections',
      ],
      correctIndex: 0,
      explanation:
        'Attributes provide additional information about HTML elements and are specified in the start tag.',
    },
    {
      id: 'html_attr_q2',
      topicId: 'html_attributes',
      question: 'Which attribute specifies alternative text for an image?',
      options: ['title', 'src', 'alt', 'description'],
      correctIndex: 2,
      explanation:
        'The alt attribute provides alternative text that displays when an image cannot be loaded.',
    },
  ],

  html_headings: [
    {
      id: 'html_headings_q1',
      topicId: 'html_headings',
      question: 'How many heading levels does HTML support?',
      options: ['3', '4', '5', '6'],
      correctIndex: 3,
      explanation:
        'HTML supports 6 heading levels: <h1> (most important) through <h6> (least important).',
    },
    {
      id: 'html_headings_q2',
      topicId: 'html_headings',
      question: 'What does the <hr> tag represent?',
      options: [
        'A hyperlink reference',
        'A horizontal rule/thematic break',
        'A header section',
        'A highlighted region',
      ],
      correctIndex: 1,
      explanation:
        '<hr> defines a thematic break and is most often displayed as a horizontal rule.',
    },
  ],

  html_paragraphs: [
    {
      id: 'html_p_q1',
      topicId: 'html_paragraphs',
      question: 'Which tag defines a paragraph?',
      options: ['<text>', '<paragraph>', '<p>', '<para>'],
      correctIndex: 2,
      explanation:
        'The <p> tag defines a paragraph. Browsers automatically add margin before and after.',
    },
    {
      id: 'html_p_q2',
      topicId: 'html_paragraphs',
      question: 'What does <br> do that <p> does not?',
      options: [
        'Creates bold text',
        'Creates a line break without starting a new paragraph',
        'Creates a list',
        'Creates a heading',
      ],
      correctIndex: 1,
      explanation:
        '<br> inserts a single line break, while <p> creates a new paragraph with space around it.',
    },
  ],

  html_forms: [
    {
      id: 'html_form_q1',
      topicId: 'html_forms',
      question: 'What is the purpose of HTML forms?',
      options: [
        'To style content',
        'To collect user input',
        'To create animations',
        'To connect to databases',
      ],
      correctIndex: 1,
      explanation: 'HTML forms are used to collect user input like text, selections, and buttons.',
    },
    {
      id: 'html_form_q2',
      topicId: 'html_forms',
      question: 'Which input type creates a checkbox?',
      options: ['type="check"', 'type="box"', 'type="checkbox"', 'type="tick"'],
      correctIndex: 2,
      explanation: 'type="checkbox" creates a checkbox input that can be checked or unchecked.',
    },
  ],
}
