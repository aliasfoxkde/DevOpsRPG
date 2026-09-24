// Quiz content for CSS (css) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const cssQuizzes: Record<string, QuizQuestion[]> = {
  css_intro: [
    {
      id: 'css_intro_q1',
      topicId: 'css_intro',
      question: 'What does CSS stand for?',
      options: [
        'Computer Style Sheets',
        'Cascading Style Sheets',
        'Creative Style System',
        'Colorful Style Sheets',
      ],
      correctIndex: 1,
      explanation: 'CSS stands for Cascading Style Sheets - used to style HTML elements.',
    },
    {
      id: 'css_intro_q2',
      topicId: 'css_intro',
      question: 'Where is the best place to define CSS styles for a single page?',
      options: [
        'In an external .css file',
        'In the <head> with <style>',
        'In each HTML tag',
        'In JavaScript',
      ],
      correctIndex: 1,
      explanation:
        'Internal CSS using <style> in the <head> is good for single-page customization.',
    },
  ],

  css_syntax: [
    {
      id: 'css_syntax_q1',
      topicId: 'css_syntax',
      question: 'What is the correct syntax for a CSS rule?',
      options: [
        'element {property: value;}',
        'element = {property: value}',
        'element: property = value;',
        'element {property = value;}',
      ],
      correctIndex: 0,
      explanation:
        'CSS rules consist of a selector and declaration blocks with property: value pairs.',
    },
    {
      id: 'css_syntax_q2',
      topicId: 'css_syntax',
      question: 'How do you select an element by its ID in CSS?',
      options: ['.idname', '#idname', 'id="idname"', '*idname'],
      correctIndex: 1,
      explanation: 'Use #idname to select an element with a specific ID attribute.',
    },
  ],

  css_box_model: [
    {
      id: 'css_box_q1',
      topicId: 'css_box_model',
      question: 'What does the CSS box model include?',
      options: [
        'Only content',
        'Content, padding, border, and margin',
        'Only padding and margin',
        'Content and border only',
      ],
      correctIndex: 1,
      explanation: 'The CSS box model includes: content, padding, border, and margin (outside in).',
    },
    {
      id: 'css_box_q2',
      topicId: 'css_box_model',
      question: 'Which CSS property adds space between content and border?',
      options: ['margin', 'padding', 'spacing', 'gap'],
      correctIndex: 1,
      explanation: "padding creates space between content and the element's border.",
    },
  ],

  css_flexbox: [
    {
      id: 'css_flex_q1',
      topicId: 'css_flexbox',
      question: 'What CSS property enables flexbox?',
      options: ['flex: true', 'display: flex', 'flexbox: enable', 'layout: flex'],
      correctIndex: 1,
      explanation: 'display: flex turns an element into a flex container.',
    },
    {
      id: 'css_flex_q2',
      topicId: 'css_flexbox',
      question: 'Which flexbox property centers items horizontally?',
      options: ['align-items', 'justify-content', 'flex-center', 'center-items'],
      correctIndex: 1,
      explanation: 'justify-content aligns items along the main axis (horizontally by default).',
    },
  ],

  css_grid: [
    {
      id: 'css_grid_q1',
      topicId: 'css_grid',
      question: 'What does grid-template-columns define?',
      options: [
        'The height of grid rows',
        'The number and width of grid columns',
        'The gap between cells',
        'The grid container size',
      ],
      correctIndex: 1,
      explanation: 'grid-template-columns defines the column structure of the grid.',
    },
    {
      id: 'css_grid_q2',
      topicId: 'css_grid',
      question: 'Which value creates equal columns that auto-fit?',
      options: ['1fr 1fr 1fr', 'auto auto auto', 'repeat(3, 1fr)', 'All of the above'],
      correctIndex: 3,
      explanation:
        'All these approaches can create equal columns. 1fr is generally preferred for flexibility.',
    },
  ],
}
