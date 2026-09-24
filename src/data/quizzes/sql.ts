// Quiz content for SQL (sql) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const sqlQuizzes: Record<string, QuizQuestion[]> = {
  sql_intro: [
    {
      id: 'sql_intro_q1',
      topicId: 'sql_intro',
      question: 'What does SQL stand for?',
      options: [
        'Simple Query Language',
        'Structured Query Language',
        'Standard Question Language',
        'Sequential Query Logic',
      ],
      correctIndex: 1,
      explanation:
        'SQL stands for Structured Query Language - the standard language for databases.',
    },
    {
      id: 'sql_intro_q2',
      topicId: 'sql_intro',
      question: 'What can SQL do with databases?',
      options: [
        'Only read data',
        'Execute, query, and manage databases',
        'Only write data',
        'Create web pages',
      ],
      correctIndex: 1,
      explanation:
        'SQL can execute queries, insert data, update data, delete records, and manage databases.',
    },
  ],

  sql_select: [
    {
      id: 'sql_select_q1',
      topicId: 'sql_select',
      question: 'Which SQL statement retrieves all data from a table?',
      options: ['GET * FROM table', 'SELECT * FROM table', 'FIND * FROM table', 'ALL FROM table'],
      correctIndex: 1,
      explanation: 'SELECT * FROM table_name retrieves all columns and rows.',
    },
    {
      id: 'sql_select_q2',
      topicId: 'sql_select',
      question: 'What does SELECT DISTINCT do?',
      options: [
        'Selects distinct rows only',
        'Selects unique values only',
        'Selects from multiple tables',
        'Selects in descending order',
      ],
      correctIndex: 1,
      explanation: 'SELECT DISTINCT returns only unique values, eliminating duplicates.',
    },
  ],

  sql_where: [
    {
      id: 'sql_where_q1',
      topicId: 'sql_where',
      question: 'What clause filters records in SQL?',
      options: ['FILTER', 'WHERE', 'CONDITION', 'HAVING'],
      correctIndex: 1,
      explanation: 'WHERE filters records based on specified conditions.',
    },
    {
      id: 'sql_where_q2',
      topicId: 'sql_where',
      question: 'Which operator means "not equal" in SQL?',
      options: ['!=', '~=', '!==', 'Both A and C typically work'],
      correctIndex: 3,
      explanation: 'Both != and <> are commonly used for not equal. SQL standard is <>.',
    },
  ],

  sql_insert: [
    {
      id: 'sql_insert_q1',
      topicId: 'sql_insert',
      question: 'What SQL statement adds new records to a table?',
      options: ['ADD RECORD', 'INSERT INTO', 'NEW RECORD', 'CREATE ROW'],
      correctIndex: 1,
      explanation: 'INSERT INTO adds new rows to a table.',
    },
    {
      id: 'sql_insert_q2',
      topicId: 'sql_insert',
      question: 'What is the VALUES clause used for in INSERT?',
      options: [
        'To specify the values to insert',
        'To list table names',
        'To define conditions',
        'To order results',
      ],
      correctIndex: 0,
      explanation: 'VALUES specifies the actual data values being inserted.',
    },
  ],

  sql_update: [
    {
      id: 'sql_update_q1',
      topicId: 'sql_update',
      question: 'What SQL statement modifies existing records?',
      options: ['MODIFY', 'UPDATE', 'CHANGE', 'EDIT'],
      correctIndex: 1,
      explanation: 'UPDATE modifies existing records in a table.',
    },
    {
      id: 'sql_update_q2',
      topicId: 'sql_update',
      question: 'Why is the WHERE clause critical in UPDATE?',
      options: [
        'It speeds up the query',
        'Without it, ALL records get updated',
        'It creates new records',
        'It deletes records',
      ],
      correctIndex: 1,
      explanation:
        'UPDATE without WHERE updates ALL rows. Always include WHERE to target specific rows.',
    },
  ],

  sql_delete: [
    {
      id: 'sql_delete_q1',
      topicId: 'sql_delete',
      question: 'What SQL statement removes records from a table?',
      options: ['REMOVE', 'DELETE', 'DROP', 'ERASE'],
      correctIndex: 1,
      explanation: 'DELETE removes rows from a table. Use with WHERE to avoid deleting everything.',
    },
    {
      id: 'sql_delete_q2',
      topicId: 'sql_delete',
      question: 'What happens if you DELETE without a WHERE clause?',
      options: [
        'Nothing happens',
        'All records are deleted',
        'Only the first record is deleted',
        'An error occurs',
      ],
      correctIndex: 1,
      explanation: 'DELETE without WHERE deletes ALL rows from the table. Use with caution!',
    },
  ],
}
