// Quiz questions for each topic - these are auto-generated from W3Schools content
// and serve as knowledge checks before completing quests

export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'code_challenge'

export interface QuizQuestion {
  id: string
  topicId: string
  question: string
  type?: QuestionType // defaults to 'multiple_choice' if not specified
  options?: string[]
  correctIndex?: number
  correctAnswer?: string
  explanation: string
  // For code challenges
  codeTemplate?: string
  expectedOutput?: string
  hint?: string
}

// Generate quiz questions from technologies data
export function generateQuizzes(): Record<string, QuizQuestion[]> {
  const quizzes: Record<string, QuizQuestion[]> = {
    // HTML Quizzes
    html_intro: [
      {
        id: 'html_intro_q1',
        topicId: 'html_intro',
        question: 'What does HTML stand for?',
        options: [
          'Hyper Text Markup Language',
          'High Tech Modern Language',
          'Hyper Transfer Markup Language',
          'Home Tool Markup Language'
        ],
        correctIndex: 0,
        explanation: 'HTML stands for Hyper Text Markup Language - the standard language for creating web pages.'
      },
      {
        id: 'html_intro_q2',
        topicId: 'html_intro',
        question: 'What is the correct HTML element for the largest heading?',
        options: ['<heading>', '<h6>', '<h1>', '<head>'],
        correctIndex: 2,
        explanation: '<h1> defines the most important heading. Headings go from <h1> (largest) to <h6> (smallest).'
      }
    ],
    html_basic: [
      {
        id: 'html_basic_q1',
        topicId: 'html_basic',
        question: 'Which HTML element defines the visible content?',
        options: ['<body>', '<content>', '<visible>', '<html>'],
        correctIndex: 0,
        explanation: 'The <body> element contains all the visible contents of the page.'
      },
      {
        id: 'html_basic_q2',
        topicId: 'html_basic',
        question: 'Which tag creates a hyperlink?',
        options: ['<link>', '<a>', '<href>', '<url>'],
        correctIndex: 1,
        explanation: 'The <a> (anchor) tag creates hyperlinks. The href attribute specifies the link destination.'
      }
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
          'Only content'
        ],
        correctIndex: 1,
        explanation: 'HTML elements consist of a start tag, content, and an end tag (for most elements).'
      },
      {
        id: 'html_elements_q2',
        topicId: 'html_elements',
        question: 'Which is an example of an empty (self-closing) element?',
        options: ['<div>', '<span>', '<br>', '<p>'],
        correctIndex: 2,
        explanation: '<br> is an empty element that defines a line break. It has no end tag.'
      }
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
          'Database connections'
        ],
        correctIndex: 0,
        explanation: 'Attributes provide additional information about HTML elements and are specified in the start tag.'
      },
      {
        id: 'html_attr_q2',
        topicId: 'html_attributes',
        question: 'Which attribute specifies alternative text for an image?',
        options: ['title', 'src', 'alt', 'description'],
        correctIndex: 2,
        explanation: 'The alt attribute provides alternative text that displays when an image cannot be loaded.'
      }
    ],
    html_headings: [
      {
        id: 'html_headings_q1',
        topicId: 'html_headings',
        question: 'How many heading levels does HTML support?',
        options: ['3', '4', '5', '6'],
        correctIndex: 3,
        explanation: 'HTML supports 6 heading levels: <h1> (most important) through <h6> (least important).'
      },
      {
        id: 'html_headings_q2',
        topicId: 'html_headings',
        question: 'What does the <hr> tag represent?',
        options: [
          'A hyperlink reference',
          'A horizontal rule/thematic break',
          'A header section',
          'A highlighted region'
        ],
        correctIndex: 1,
        explanation: '<hr> defines a thematic break and is most often displayed as a horizontal rule.'
      }
    ],
    html_paragraphs: [
      {
        id: 'html_p_q1',
        topicId: 'html_paragraphs',
        question: 'Which tag defines a paragraph?',
        options: ['<text>', '<paragraph>', '<p>', '<para>'],
        correctIndex: 2,
        explanation: 'The <p> tag defines a paragraph. Browsers automatically add margin before and after.'
      },
      {
        id: 'html_p_q2',
        topicId: 'html_paragraphs',
        question: 'What does <br> do that <p> does not?',
        options: [
          'Creates bold text',
          'Creates a line break without starting a new paragraph',
          'Creates a list',
          'Creates a heading'
        ],
        correctIndex: 1,
        explanation: '<br> inserts a single line break, while <p> creates a new paragraph with space around it.'
      }
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
          'To connect to databases'
        ],
        correctIndex: 1,
        explanation: 'HTML forms are used to collect user input like text, selections, and buttons.'
      },
      {
        id: 'html_form_q2',
        topicId: 'html_forms',
        question: 'Which input type creates a checkbox?',
        options: ['type="check"', 'type="box"', 'type="checkbox"', 'type="tick"'],
        correctIndex: 2,
        explanation: 'type="checkbox" creates a checkbox input that can be checked or unchecked.'
      }
    ],

    // CSS Quizzes
    css_intro: [
      {
        id: 'css_intro_q1',
        topicId: 'css_intro',
        question: 'What does CSS stand for?',
        options: [
          'Computer Style Sheets',
          'Cascading Style Sheets',
          'Creative Style System',
          'Colorful Style Sheets'
        ],
        correctIndex: 1,
        explanation: 'CSS stands for Cascading Style Sheets - used to style HTML elements.'
      },
      {
        id: 'css_intro_q2',
        topicId: 'css_intro',
        question: 'Where is the best place to define CSS styles for a single page?',
        options: [
          'In an external .css file',
          'In the <head> with <style>',
          'In each HTML tag',
          'In JavaScript'
        ],
        correctIndex: 1,
        explanation: 'Internal CSS using <style> in the <head> is good for single-page customization.'
      }
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
          'element {property = value;}'
        ],
        correctIndex: 0,
        explanation: 'CSS rules consist of a selector and declaration blocks with property: value pairs.'
      },
      {
        id: 'css_syntax_q2',
        topicId: 'css_syntax',
        question: 'How do you select an element by its ID in CSS?',
        options: ['.idname', '#idname', 'id="idname"', '*idname'],
        correctIndex: 1,
        explanation: 'Use #idname to select an element with a specific ID attribute.'
      }
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
          'Content and border only'
        ],
        correctIndex: 1,
        explanation: 'The CSS box model includes: content, padding, border, and margin (outside in).'
      },
      {
        id: 'css_box_q2',
        topicId: 'css_box_model',
        question: 'Which CSS property adds space between content and border?',
        options: ['margin', 'padding', 'spacing', 'gap'],
        correctIndex: 1,
        explanation: 'padding creates space between content and the element\'s border.'
      }
    ],
    css_flexbox: [
      {
        id: 'css_flex_q1',
        topicId: 'css_flexbox',
        question: 'What CSS property enables flexbox?',
        options: ['flex: true', 'display: flex', 'flexbox: enable', 'layout: flex'],
        correctIndex: 1,
        explanation: 'display: flex turns an element into a flex container.'
      },
      {
        id: 'css_flex_q2',
        topicId: 'css_flexbox',
        question: 'Which flexbox property centers items horizontally?',
        options: ['align-items', 'justify-content', 'flex-center', 'center-items'],
        correctIndex: 1,
        explanation: 'justify-content aligns items along the main axis (horizontally by default).'
      }
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
          'The grid container size'
        ],
        correctIndex: 1,
        explanation: 'grid-template-columns defines the column structure of the grid.'
      },
      {
        id: 'css_grid_q2',
        topicId: 'css_grid',
        question: 'Which value creates equal columns that auto-fit?',
        options: [
          '1fr 1fr 1fr',
          'auto auto auto',
          'repeat(3, 1fr)',
          'All of the above'
        ],
        correctIndex: 3,
        explanation: 'All these approaches can create equal columns. 1fr is generally preferred for flexibility.'
      }
    ],

    // JavaScript Quizzes
    js_intro: [
      {
        id: 'js_intro_q1',
        topicId: 'js_intro',
        question: 'What is JavaScript primarily used for?',
        options: [
          'Styling web pages',
          'Structuring web content',
          'Adding interactivity to web pages',
          'Database management'
        ],
        correctIndex: 2,
        explanation: 'JavaScript is the programming language of the web, used for adding interactivity.'
      },
      {
        id: 'js_intro_q2',
        topicId: 'js_intro',
        question: 'Which method changes HTML content?',
        options: [
          'document.getElementById()',
          'document.innerHTML()',
          'element.getContent()',
          'element.setHTML()'
        ],
        correctIndex: 1,
        explanation: 'document.getElementById(id).innerHTML = "new content" changes element content.'
      }
    ],
    js_variables: [
      {
        id: 'js_var_q1',
        topicId: 'js_variables',
        question: 'Which keyword declares a block-scoped variable?',
        options: ['var', 'let', 'const', 'Both let and const'],
        correctIndex: 3,
        explanation: 'Both let and const are block-scoped. var is function-scoped.'
      },
      {
        id: 'js_var_q2',
        topicId: 'js_variables',
        question: 'What is a valid variable name in JavaScript?',
        options: ['2name', 'my-var', 'my_var', 'my var'],
        correctIndex: 2,
        explanation: 'Variable names can contain letters, numbers, underscores, and dollar signs. Cannot start with a number.'
      },
      {
        id: 'js_var_code1',
        topicId: 'js_variables',
        question: 'Code Challenge: Declare a constant "PI" with value 3.14159, then log it to the console.',
        type: 'code_challenge',
        codeTemplate: '// Declare a constant PI with value 3.14159\n// Then log it to the console\n',
        expectedOutput: '3.14159',
        hint: 'Use: const PI = 3.14159; then console.log(PI);',
        explanation: 'Constants are declared with the "const" keyword and cannot be reassigned.'
      }
    ],
    js_functions: [
      {
        id: 'js_func_q1',
        topicId: 'js_functions',
        question: 'How do you call a function named "myFunction"?',
        options: [
          'call myFunction()',
          'myFunction',
          'myFunction()',
          'run myFunction'
        ],
        correctIndex: 2,
        explanation: 'Functions are called by writing their name followed by parentheses: myFunction().'
      },
      {
        id: 'js_func_q2',
        topicId: 'js_functions',
        question: 'What does a function return if no return statement is specified?',
        options: ['0', 'null', 'undefined', 'false'],
        correctIndex: 2,
        explanation: 'Functions return undefined by default if no explicit return value is given.'
      }
    ],
    js_objects: [
      {
        id: 'js_obj_q1',
        topicId: 'js_objects',
        question: 'How do you access the "name" property of an object called "person"?',
        options: [
          'person->name',
          'person.name',
          'person[name]',
          'Both B and C'
        ],
        correctIndex: 3,
        explanation: 'Object properties can be accessed with dot notation (person.name) or bracket notation (person["name"]).'
      },
      {
        id: 'js_obj_q2',
        topicId: 'js_objects',
        question: 'Which keyword is used to create an object?',
        options: ['object', 'new Object()', 'create', 'make'],
        correctIndex: 1,
        explanation: 'new Object() or object literal syntax { } creates objects.'
      }
    ],
    js_arrays: [
      {
        id: 'js_arr_q1',
        topicId: 'js_arrays',
        question: 'What is the index of the first element in a JavaScript array?',
        options: ['1', '0', 'first', 'A'],
        correctIndex: 1,
        explanation: 'JavaScript arrays are zero-indexed, meaning the first element is at index 0.'
      },
      {
        id: 'js_arr_q2',
        topicId: 'js_arrays',
        question: 'Which method adds an element to the end of an array?',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        correctIndex: 0,
        explanation: 'push() adds elements to the end. pop() removes from end, shift() removes from start.'
      }
    ],

    // Git Quizzes
    git_intro: [
      {
        id: 'git_intro_q1',
        topicId: 'git_intro',
        question: 'What is Git?',
        options: [
          'A programming language',
          'A distributed version control system',
          'A text editor',
          'A web browser'
        ],
        correctIndex: 1,
        explanation: 'Git is a distributed version control system for tracking changes in source code.'
      },
      {
        id: 'git_intro_q2',
        topicId: 'git_intro',
        question: 'Who created Git?',
        options: ['Bill Gates', 'Linus Torvalds', 'Steve Jobs', 'Mark Zuckerberg'],
        correctIndex: 1,
        explanation: 'Git was created by Linus Torvalds in 2005 for Linux kernel development.'
      }
    ],
    git_branch: [
      {
        id: 'git_branch_q1',
        topicId: 'git_branch',
        question: 'What command creates a new Git branch?',
        options: ['git new branch', 'git branch <name>', 'git create branch', 'git add branch'],
        correctIndex: 1,
        explanation: 'git branch <name> creates a new branch. Use git checkout -b to create and switch.'
      },
      {
        id: 'git_branch_q2',
        topicId: 'git_branch',
        question: 'How do you switch to an existing branch called "feature"?',
        options: ['git switch feature', 'git checkout feature', 'git change feature', 'Both A and B'],
        correctIndex: 3,
        explanation: 'Both git checkout feature and git switch feature work to switch branches.'
      }
    ],
    git_remote: [
      {
        id: 'git_remote_q1',
        topicId: 'git_remote',
        question: 'What command uploads your commits to a remote repository?',
        options: ['git upload', 'git send', 'git push', 'git sync'],
        correctIndex: 2,
        explanation: 'git push uploads your local commits to the remote repository.'
      },
      {
        id: 'git_remote_q2',
        topicId: 'git_remote',
        question: 'Which service is NOT a Git hosting platform?',
        options: ['GitHub', 'GitLab', 'Bitbucket', 'GitWare'],
        correctIndex: 3,
        explanation: 'GitHub, GitLab, and Bitbucket are popular Git hosting services. GitWare is not real.'
      }
    ],

    // SQL Quizzes
    sql_intro: [
      {
        id: 'sql_intro_q1',
        topicId: 'sql_intro',
        question: 'What does SQL stand for?',
        options: [
          'Simple Query Language',
          'Structured Query Language',
          'Standard Question Language',
          'Sequential Query Logic'
        ],
        correctIndex: 1,
        explanation: 'SQL stands for Structured Query Language - the standard language for databases.'
      },
      {
        id: 'sql_intro_q2',
        topicId: 'sql_intro',
        question: 'What can SQL do with databases?',
        options: [
          'Only read data',
          'Execute, query, and manage databases',
          'Only write data',
          'Create web pages'
        ],
        correctIndex: 1,
        explanation: 'SQL can execute queries, insert data, update data, delete records, and manage databases.'
      }
    ],
    sql_select: [
      {
        id: 'sql_select_q1',
        topicId: 'sql_select',
        question: 'Which SQL statement retrieves all data from a table?',
        options: [
          'GET * FROM table',
          'SELECT * FROM table',
          'FIND * FROM table',
          'ALL FROM table'
        ],
        correctIndex: 1,
        explanation: 'SELECT * FROM table_name retrieves all columns and rows.'
      },
      {
        id: 'sql_select_q2',
        topicId: 'sql_select',
        question: 'What does SELECT DISTINCT do?',
        options: [
          'Selects distinct rows only',
          'Selects unique values only',
          'Selects from multiple tables',
          'Selects in descending order'
        ],
        correctIndex: 1,
        explanation: 'SELECT DISTINCT returns only unique values, eliminating duplicates.'
      }
    ],
    sql_where: [
      {
        id: 'sql_where_q1',
        topicId: 'sql_where',
        question: 'What clause filters records in SQL?',
        options: ['FILTER', 'WHERE', 'CONDITION', 'HAVING'],
        correctIndex: 1,
        explanation: 'WHERE filters records based on specified conditions.'
      },
      {
        id: 'sql_where_q2',
        topicId: 'sql_where',
        question: 'Which operator means "not equal" in SQL?',
        options: ['!=', '~=', '!==', 'Both A and C typically work'],
        correctIndex: 3,
        explanation: 'Both != and <> are commonly used for not equal. SQL standard is <>.'
      }
    ],
    sql_insert: [
      {
        id: 'sql_insert_q1',
        topicId: 'sql_insert',
        question: 'What SQL statement adds new records to a table?',
        options: ['ADD RECORD', 'INSERT INTO', 'NEW RECORD', 'CREATE ROW'],
        correctIndex: 1,
        explanation: 'INSERT INTO adds new rows to a table.'
      },
      {
        id: 'sql_insert_q2',
        topicId: 'sql_insert',
        question: 'What is the VALUES clause used for in INSERT?',
        options: [
          'To specify the values to insert',
          'To list table names',
          'To define conditions',
          'To order results'
        ],
        correctIndex: 0,
        explanation: 'VALUES specifies the actual data values being inserted.'
      }
    ],
    sql_update: [
      {
        id: 'sql_update_q1',
        topicId: 'sql_update',
        question: 'What SQL statement modifies existing records?',
        options: ['MODIFY', 'UPDATE', 'CHANGE', 'EDIT'],
        correctIndex: 1,
        explanation: 'UPDATE modifies existing records in a table.'
      },
      {
        id: 'sql_update_q2',
        topicId: 'sql_update',
        question: 'Why is the WHERE clause critical in UPDATE?',
        options: [
          'It speeds up the query',
          'Without it, ALL records get updated',
          'It creates new records',
          'It deletes records'
        ],
        correctIndex: 1,
        explanation: 'UPDATE without WHERE updates ALL rows. Always include WHERE to target specific rows.'
      }
    ],
    sql_delete: [
      {
        id: 'sql_delete_q1',
        topicId: 'sql_delete',
        question: 'What SQL statement removes records from a table?',
        options: ['REMOVE', 'DELETE', 'DROP', 'ERASE'],
        correctIndex: 1,
        explanation: 'DELETE removes rows from a table. Use with WHERE to avoid deleting everything.'
      },
      {
        id: 'sql_delete_q2',
        topicId: 'sql_delete',
        question: 'What happens if you DELETE without a WHERE clause?',
        options: [
          'Nothing happens',
          'All records are deleted',
          'Only the first record is deleted',
          'An error occurs'
        ],
        correctIndex: 1,
        explanation: 'DELETE without WHERE deletes ALL rows from the table. Use with caution!'
      }
    ],

    // Python Quizzes
    python_intro: [
      {
        id: 'py_intro_q1',
        topicId: 'python_intro',
        question: 'Who created Python?',
        options: ['James Gosling', 'Guido van Rossum', 'Bjarne Stroustrup', 'Dennis Ritchie'],
        correctIndex: 1,
        explanation: 'Python was created by Guido van Rossum and released in 1991.'
      },
      {
        id: 'py_intro_q2',
        topicId: 'python_intro',
        question: 'Which of these is NOT a typical use of Python?',
        options: ['Web development', 'Data analysis', 'Hardware programming', 'Automation'],
        correctIndex: 2,
        explanation: 'Python is used for web dev, data analysis, automation, AI/ML - not typically hardware-level programming.'
      }
    ],
    python_syntax: [
      {
        id: 'py_syntax_q1',
        topicId: 'python_syntax',
        question: 'What does Python use for code blocks instead of curly braces?',
        options: ['Curly braces', 'Indentation', 'Keywords', 'Parentheses'],
        correctIndex: 1,
        explanation: 'Python uses indentation to define code blocks, making it readability-focused.'
      },
      {
        id: 'py_syntax_q2',
        topicId: 'python_syntax',
        question: 'Which statement correctly assigns a variable in Python?',
        options: ['int x = 5', 'var x = 5', 'x = 5', 'let x = 5'],
        correctIndex: 2,
        explanation: 'Python uses dynamic typing: x = 5 creates a variable without type declaration.'
      }
    ],
    python_variables: [
      {
        id: 'py_var_q1',
        topicId: 'python_variables',
        question: 'What is a valid Python variable name?',
        options: ['2variable', 'my-var', 'my_variable', 'class'],
        correctIndex: 2,
        explanation: 'my_variable is valid. Variable names cannot start with numbers or use hyphens. class is a keyword.'
      },
      {
        id: 'py_var_q2',
        topicId: 'python_variables',
        question: 'Can Python variables change their type after assignment?',
        options: ['No, never', 'Yes, Python is dynamically typed', 'Only numbers', 'Only strings'],
        correctIndex: 1,
        explanation: 'Python is dynamically typed - variables can change type by reassignment.'
      }
    ],
    python_lists: [
      {
        id: 'py_list_q1',
        topicId: 'python_lists',
        question: 'How do you create a list in Python?',
        options: ['list = (1, 2, 3)', 'list = [1, 2, 3]', 'list = {1, 2, 3}', 'list = <1, 2, 3>'],
        correctIndex: 1,
        explanation: 'Lists use square brackets: my_list = [1, 2, 3]'
      },
      {
        id: 'py_list_q2',
        topicId: 'python_lists',
        question: 'What index accesses the first element of a list?',
        options: ['1', '0', 'first', '-1'],
        correctIndex: 1,
        explanation: 'Like most languages, Python lists are zero-indexed. First element is at index 0.'
      }
    ],
    python_functions: [
      {
        id: 'py_func_q1',
        topicId: 'python_functions',
        question: 'What keyword defines a function in Python?',
        options: ['function', 'func', 'def', 'define'],
        correctIndex: 2,
        explanation: 'def function_name(): defines a function in Python.'
      },
      {
        id: 'py_func_q2',
        topicId: 'python_functions',
        question: 'How do you call a function named "greet"?',
        options: ['call greet()', 'greet()', 'run greet', 'execute greet'],
        correctIndex: 1,
        explanation: 'Functions are called by name with parentheses: greet()'
      }
    ],

    // Bash Quizzes
    bash_intro: [
      {
        id: 'bash_intro_q1',
        topicId: 'bash_intro',
        question: 'What is Bash?',
        options: [
          'A programming language',
          'A Unix shell and command language',
          'A text editor',
          'A web browser'
        ],
        correctIndex: 1,
        explanation: 'Bash (Bourne Again SHell) is a Unix shell and command language.'
      },
      {
        id: 'bash_intro_q2',
        topicId: 'bash_intro',
        question: 'What character starts a comment in Bash?',
        options: ['//', '#', '--', '/*'],
        correctIndex: 1,
        explanation: '# starts a comment in Bash. Everything after # on a line is ignored.'
      }
    ],
    bash_variables: [
      {
        id: 'bash_var_q1',
        topicId: 'bash_variables',
        question: 'How do you access a variable named "name" in Bash?',
        options: ['$name', '#name', '@name', 'name'],
        correctIndex: 0,
        explanation: '$name or ${name} accesses the variable. Without $, it\'s just the literal string.'
      },
      {
        id: 'bash_var_q2',
        topicId: 'bash_variables',
        question: 'What is special about variable assignment in Bash?',
        options: [
          'Must use let keyword',
          'No spaces around equals sign',
          'Must declare type',
          'Must use $ prefix'
        ],
        correctIndex: 1,
        explanation: 'Bash requires no spaces: name="John" works, but name = "John" does not.'
      }
    ],
    bash_script: [
      {
        id: 'bash_script_q1',
        topicId: 'bash_script',
        question: 'Which statement starts a conditional in Bash?',
        options: ['if (condition)', 'if [ condition ]', 'if condition then', 'when condition'],
        correctIndex: 1,
        explanation: 'if [ condition ] then ... fi is the Bash if syntax. Spaces inside brackets are required.'
      },
      {
        id: 'bash_script_q2',
        topicId: 'bash_script',
        question: 'How do you loop over items in Bash?',
        options: ['foreach', 'for item in list', 'loop item', 'iterate item'],
        correctIndex: 1,
        explanation: 'for item in list; do ... done loops through items in Bash.'
      }
    ],

    // Docker Quizzes
    docker_intro: [
      {
        id: 'docker_intro_q1',
        topicId: 'docker_intro',
        question: 'What is a Docker container?',
        options: [
          'A type of database',
          'A runnable instance of an image',
          'A programming language',
          'A web browser'
        ],
        correctIndex: 1,
        explanation: 'A container is a runnable instance of an image - it\'s isolated from other containers.'
      },
      {
        id: 'docker_intro_q2',
        topicId: 'docker_intro',
        question: 'What is a Docker image?',
        options: [
          'A screenshot of an application',
          'A read-only template with instructions for creating containers',
          'A video recording',
          'A type of database backup'
        ],
        correctIndex: 1,
        explanation: 'An image is a read-only template with instructions for creating Docker containers.'
      }
    ],
    docker_images: [
      {
        id: 'docker_img_q1',
        topicId: 'docker_images',
        question: 'What command lists Docker images?',
        options: ['docker list', 'docker images', 'docker show', 'docker ps'],
        correctIndex: 1,
        explanation: 'docker images lists all local images.'
      },
      {
        id: 'docker_img_q2',
        topicId: 'docker_images',
        question: 'What does docker pull do?',
        options: [
          'Removes an image',
          'Downloads an image from a registry',
          'Uploads an image',
          'Lists images'
        ],
        correctIndex: 1,
        explanation: 'docker pull downloads an image from Docker Hub or another registry.'
      }
    ],
    docker_containers: [
      {
        id: 'docker_cont_q1',
        topicId: 'docker_containers',
        question: 'What command runs a new container?',
        options: ['docker create', 'docker run', 'docker start', 'docker new'],
        correctIndex: 1,
        explanation: 'docker run creates and starts a new container. docker create just creates it.'
      },
      {
        id: 'docker_cont_q2',
        topicId: 'docker_containers',
        question: 'What does docker ps show?',
        options: [
          'All containers (running and stopped)',
          'Only running containers',
          'Only stopped containers',
          'Docker images'
        ],
        correctIndex: 1,
        explanation: 'docker ps shows only running containers. docker ps -a shows all containers.'
      }
    ],
    docker_dockerfile: [
      {
        id: 'docker_df_q1',
        topicId: 'docker_dockerfile',
        question: 'What does the FROM instruction in a Dockerfile specify?',
        options: [
          'The output image name',
          'The base image',
          'The working directory',
          'The port to expose'
        ],
        correctIndex: 1,
        explanation: 'FROM specifies the base image to use for building this image.'
      },
      {
        id: 'docker_df_q2',
        topicId: 'docker_dockerfile',
        question: 'What does CMD in a Dockerfile specify?',
        options: [
          'The image author',
          'The default command to run when container starts',
          'Comments',
          'Environment variables'
        ],
        correctIndex: 1,
        explanation: 'CMD specifies the default command that runs when a container starts.'
      }
    ],

    // React Quizzes
    react_intro: [
      {
        id: 'react_intro_q1',
        topicId: 'react_intro',
        question: 'What is React primarily used for?',
        options: [
          'Backend development',
          'Database management',
          'Building user interfaces',
          'Operating system development'
        ],
        correctIndex: 2,
        explanation: 'React is a JavaScript library for building user interfaces (UIs).'
      },
      {
        id: 'react_intro_q2',
        topicId: 'react_intro',
        question: 'What is the Virtual DOM in React?',
        options: [
          'A separate browser window',
          'A lightweight copy of the actual DOM',
          'A type of database',
          'A CSS framework'
        ],
        correctIndex: 1,
        explanation: 'React\'s Virtual DOM is a lightweight representation of the actual DOM for efficient updates.'
      }
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
          'Database queries'
        ],
        correctIndex: 1,
        explanation: 'Components are independent, reusable pieces of UI that return JSX.'
      },
      {
        id: 'react_comp_q2',
        topicId: 'react_components',
        question: 'What are props in React?',
        options: [
          'CSS properties',
          'Inputs passed from parent to child components',
          'State variables',
          'Event handlers'
        ],
        correctIndex: 1,
        explanation: 'Props (properties) are inputs passed from parent components to child components.'
      }
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
          'Defines CSS styles'
        ],
        correctIndex: 1,
        explanation: 'useState is a hook that adds state management to functional components.'
      },
      {
        id: 'react_hooks_q2',
        topicId: 'react_hooks',
        question: 'What does useEffect do in React?',
        options: [
          'Creates animations',
          'Handles side effects in components',
          'Manages routing',
          'Styles components'
        ],
        correctIndex: 1,
        explanation: 'useEffect handles side effects like data fetching, subscriptions, and DOM updates.'
      }
    ],

    // Node.js Quizzes
    nodejs_intro: [
      {
        id: 'nodejs_intro_q1',
        topicId: 'nodejs_intro',
        question: 'What is Node.js?',
        options: [
          'A frontend framework',
          'A database',
          'A JavaScript runtime that runs outside the browser',
          'A CSS preprocessor'
        ],
        correctIndex: 2,
        explanation: 'Node.js is a JavaScript runtime environment that executes JavaScript code outside a browser.'
      },
      {
        id: 'nodejs_intro_q2',
        topicId: 'nodejs_intro',
        question: 'What makes Node.js good for server-side development?',
        options: [
          'It blocks I/O operations',
          'Event-driven, non-blocking I/O',
          'It only works with databases',
          'It requires a browser'
        ],
        correctIndex: 1,
        explanation: 'Node.js uses an event-driven, non-blocking I/O model, making it efficient for I/O-heavy tasks.'
      }
    ],
    nodejs_modules: [
      {
        id: 'nodejs_mod_q1',
        topicId: 'nodejs_modules',
        question: 'How do you import a module named "fs" in Node.js?',
        options: [
          'import fs from "fs"',
          'require("fs") or import { fs } from "fs"',
          'include("fs")',
          'load("fs")'
        ],
        correctIndex: 1,
        explanation: 'CommonJS uses require(), ES6 modules use import. Both work depending on module type.'
      },
      {
        id: 'nodejs_mod_q2',
        topicId: 'nodejs_modules',
        question: 'What does module.exports do?',
        options: [
          'Imports a module',
          'Exports a module for use in other files',
          'Creates a new module',
          'Deletes a module'
        ],
        correctIndex: 1,
        explanation: 'module.exports or export default specifies what a module exposes to other modules.'
      }
    ],
    nodejs_http: [
      {
        id: 'nodejs_http_q1',
        topicId: 'nodejs_http',
        question: 'What does http.createServer() do?',
        options: [
          'Creates a database connection',
          'Creates an HTTP server that listens for requests',
          'Creates a file server',
          'Creates a web page'
        ],
        correctIndex: 1,
        explanation: 'http.createServer() creates an HTTP server that can listen for and respond to requests.'
      },
      {
        id: 'nodejs_http_q2',
        topicId: 'nodejs_http',
        question: 'What does res.writeHead() do?',
        options: [
          'Reads request headers',
          'Writes response headers',
          'Creates a router',
          'Logs HTTP requests'
        ],
        correctIndex: 1,
        explanation: 'res.writeHead() writes HTTP response headers (status code, content type, etc.).'
      }
    ],

    // PostgreSQL Quizzes
    postgresql_intro: [
      {
        id: 'postgresql_intro_q1',
        topicId: 'postgresql_intro',
        question: 'What type of database is PostgreSQL?',
        options: [
          'NoSQL document database',
          'Object-relational database',
          'Key-value store',
          'Graph database'
        ],
        correctIndex: 1,
        explanation: 'PostgreSQL is an object-relational database system (ORDBMS) known for reliability.'
      },
      {
        id: 'postgresql_intro_q2',
        topicId: 'postgresql_intro',
        question: 'What does SERIAL PRIMARY KEY typically create?',
        options: [
          'A text field',
          'An auto-incrementing integer used as unique ID',
          'A boolean field',
          'A date field'
        ],
        correctIndex: 1,
        explanation: 'SERIAL PRIMARY KEY creates an auto-incrementing integer that uniquely identifies rows.'
      }
    ],
    postgresql_create_table: [
      {
        id: 'postgresql_ct_q1',
        topicId: 'postgresql_create_table',
        question: 'What does CREATE TABLE do?',
        options: [
          'Deletes a table',
          'Creates a new table in the database',
          'Updates a table',
          'Selects from a table'
        ],
        correctIndex: 1,
        explanation: 'CREATE TABLE creates a new table with specified columns and their data types.'
      },
      {
        id: 'postgresql_ct_q2',
        topicId: 'postgresql_create_table',
        question: 'What does VARCHAR(100) specify?',
        options: [
          'A 100-character fixed-length string',
          'A variable-length string up to 100 characters',
          'A number with 100 decimals',
          'A boolean with 100 values'
        ],
        correctIndex: 1,
        explanation: 'VARCHAR(n) is variable-length character data with a maximum of n characters.'
      }
    ],

    // MongoDB Quizzes
    mongodb_intro: [
      {
        id: 'mongodb_intro_q1',
        topicId: 'mongodb_intro',
        question: 'What type of database is MongoDB?',
        options: [
          'Relational database',
          'Document-oriented NoSQL database',
          'Graph database',
          'Key-value store'
        ],
        correctIndex: 1,
        explanation: 'MongoDB is a document-oriented NoSQL database that stores data in JSON-like documents.'
      },
      {
        id: 'mongodb_intro_q2',
        topicId: 'mongodb_intro',
        question: 'What format does MongoDB use for documents?',
        options: [
          'XML',
          'JSON/BSON',
          'CSV',
          'SQL'
        ],
        correctIndex: 1,
        explanation: 'MongoDB stores data in JSON-like documents (actually BSON - binary JSON).'
      }
    ],
    mongodb_insert: [
      {
        id: 'mongodb_ins_q1',
        topicId: 'mongodb_insert',
        question: 'What method inserts a single document in MongoDB?',
        options: ['insert()', 'insertOne()', 'addOne()', 'createOne()'],
        correctIndex: 1,
        explanation: 'insertOne() inserts a single document into a MongoDB collection.'
      },
      {
        id: 'mongodb_ins_q2',
        topicId: 'mongodb_insert',
        question: 'What is a MongoDB collection?',
        options: [
          'A single data value',
          'A group of MongoDB documents',
          'A database connection',
          'A query result'
        ],
        correctIndex: 1,
        explanation: 'A collection is a group of documents in MongoDB, similar to a table in relational databases.'
      }
    ],

    // AWS Quizzes
    aws_intro: [
      {
        id: 'aws_intro_q1',
        topicId: 'aws_intro',
        question: 'What does AWS stand for?',
        options: [
          'Advanced Web Services',
          'Amazon Web Services',
          'Automated Web Solutions',
          'Application Workload Services'
        ],
        correctIndex: 1,
        explanation: 'AWS stands for Amazon Web Services - a comprehensive cloud computing platform.'
      },
      {
        id: 'aws_intro_q2',
        topicId: 'aws_intro',
        question: 'Which AWS service provides virtual servers in the cloud?',
        options: ['S3', 'EC2', 'RDS', 'Lambda'],
        correctIndex: 1,
        explanation: 'EC2 (Elastic Compute Cloud) provides resizable compute capacity - virtual servers.'
      }
    ],
    'aws-ec2': [
      {
        id: 'aws-ec2_q1',
        topicId: 'aws-ec2',
        question: 'What does EC2 stand for?',
        options: [
          'Elastic Compute Cloud',
          'Essential Computing Center',
          'Enterprise Cloud Core',
          'E-Commerce 2.0'
        ],
        correctIndex: 0,
        explanation: 'EC2 stands for Elastic Compute Cloud - AWS\'s resizable compute service.'
      },
      {
        id: 'aws-ec2_q2',
        topicId: 'aws-ec2',
        question: 'What does "t2.micro" represent in AWS?',
        options: [
          'A storage type',
          'An instance type (size and family)',
          'A region',
          'A security group'
        ],
        correctIndex: 1,
        explanation: 'Instance types like t2.micro specify the size (vCPUs, memory) and family of the instance.'
      }
    ],
    'aws-s3': [
      {
        id: 'aws-s3_q1',
        topicId: 'aws-s3',
        question: 'What does S3 stand for?',
        options: [
          'Simple Storage Service',
          'Server Storage System',
          'Secure Software Service',
          'Standard Storage Solution'
        ],
        correctIndex: 0,
        explanation: 'S3 stands for Simple Storage Service - object storage in AWS.'
      },
      {
        id: 'aws-s3_q2',
        topicId: 'aws-s3',
        question: 'What is an S3 bucket?',
        options: [
          'A compute resource',
          'A container for storing objects',
          'A database table',
          'A networking feature'
        ],
        correctIndex: 1,
        explanation: 'An S3 bucket is a container for storing objects (files) in Amazon S3.'
      }
    ],

    // Kubernetes Quizzes
    k8s_intro: [
      {
        id: 'k8s_intro_q1',
        topicId: 'k8s_intro',
        question: 'What is Kubernetes?',
        options: [
          'A programming language',
          'An open-source container orchestration platform',
          'A database',
          'A web server'
        ],
        correctIndex: 1,
        explanation: 'Kubernetes is an open-source platform for automating deployment, scaling, and management of containerized applications.'
      },
      {
        id: 'k8s_intro_q2',
        topicId: 'k8s_intro',
        question: 'What company originally developed Kubernetes?',
        options: ['AWS', 'Google', 'Microsoft', 'Docker'],
        correctIndex: 1,
        explanation: 'Google originally developed Kubernetes, which was then donated to the Cloud Native Computing Foundation.'
      }
    ],
    k8s_pods: [
      {
        id: 'k8s_pods_q1',
        topicId: 'k8s_pods',
        question: 'What is a Kubernetes Pod?',
        options: [
          'A type of container',
          'The smallest deployable unit in Kubernetes',
          'A networking tool',
          'A storage volume'
        ],
        correctIndex: 1,
        explanation: 'Pods are the smallest deployable units in Kubernetes. A Pod represents a single instance of a running process.'
      },
      {
        id: 'k8s_pods_q2',
        topicId: 'k8s_pods',
        question: 'How many containers can a Pod typically contain?',
        options: ['Exactly one', 'One or more', 'Always two', 'At most three'],
        correctIndex: 1,
        explanation: 'A Pod can contain one or more containers (usually one), that share storage and network.'
      }
    ],
    k8s_services: [
      {
        id: 'k8s_svc_q1',
        topicId: 'k8s_services',
        question: 'What does a Kubernetes Service provide?',
        options: [
          'Persistent storage',
          'An abstract way to expose an application running on Pods',
          'Container orchestration',
          'Load balancing for databases only'
        ],
        correctIndex: 1,
        explanation: 'A Service is an abstract way to expose an application running on a set of Pods as a network service.'
      },
      {
        id: 'k8s_svc_q2',
        topicId: 'k8s_services',
        question: 'What type of Service exposes an application on each Node IP at a specific port?',
        options: ['ClusterIP', 'NodePort', 'LoadBalancer', 'Ingress'],
        correctIndex: 1,
        explanation: 'NodePort exposes the Service on each Node\'s IP at a static port (the NodePort).'
      }
    ],

    // Terraform Quizzes
    tf_intro: [
      {
        id: 'tf_intro_q1',
        topicId: 'tf_intro',
        question: 'What is Terraform?',
        options: [
          'A programming language',
          'An infrastructure as code tool',
          'A container platform',
          'A monitoring tool'
        ],
        correctIndex: 1,
        explanation: 'Terraform is an infrastructure as code tool for building, changing, and versioning infrastructure safely.'
      },
      {
        id: 'tf_intro_q2',
        topicId: 'tf_intro',
        question: 'What language does Terraform use for configuration?',
        options: ['Python', 'YAML', 'HashiCorp Configuration Language (HCL)', 'JSON'],
        correctIndex: 2,
        explanation: 'Terraform uses HashiCorp Configuration Language (HCL) for its configuration files.'
      }
    ],
    tf_resources: [
      {
        id: 'tf_res_q1',
        topicId: 'tf_resources',
        question: 'In Terraform, what does a "resource" block define?',
        options: [
          'A variable',
          'An infrastructure object',
          'An output value',
          'A provider'
        ],
        correctIndex: 1,
        explanation: 'Resource blocks define infrastructure objects like servers, databases, networks, etc.'
      },
      {
        id: 'tf_res_q2',
        topicId: 'tf_resources',
        question: 'What does the resource type "aws_instance" specify?',
        options: [
          'An S3 bucket',
          'A VPC',
          'An EC2 instance',
          'An RDS database'
        ],
        correctIndex: 2,
        explanation: '"aws_instance" is the Terraform resource type for creating AWS EC2 instances.'
      }
    ],

    // CI/CD Quizzes
    cicd_intro: [
      {
        id: 'cicd_intro_q1',
        topicId: 'cicd_intro',
        question: 'What does CI/CD stand for?',
        options: [
          'Code Integration/Code Delivery',
          'Continuous Integration/Continuous Deployment (or Delivery)',
          'Centralized Integration/Centralized Deployment',
          'Continuous Improvement/Continuous Development'
        ],
        correctIndex: 1,
        explanation: 'CI/CD stands for Continuous Integration and Continuous Deployment/Delivery.'
      },
      {
        id: 'cicd_intro_q2',
        topicId: 'cicd_intro',
        question: 'What is the main benefit of CI/CD?',
        options: [
          'Writing more code',
          'Automating integration and deployment of code changes',
          'Manual testing',
          'Reducing developers'
        ],
        correctIndex: 1,
        explanation: 'CI/CD automates integrating code changes and deploying them, reducing errors and speeding up delivery.'
      }
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
          'Commit, Push, Pull'
        ],
        correctIndex: 1,
        explanation: 'Typical pipeline stages are: Build, Test, Deploy (sometimes with additional stages like Security Scan).'
      },
      {
        id: 'cicd_pipe_q2',
        topicId: 'cicd_pipeline',
        question: 'What does the "build" stage typically do?',
        options: [
          'Runs unit tests',
          'Compiles code and creates artifacts',
          'Deploys to production',
          'Creates database schemas'
        ],
        correctIndex: 1,
        explanation: 'The build stage compiles code, resolves dependencies, and creates deployable artifacts.'
      }
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
          'A deployment tool only'
        ],
        correctIndex: 1,
        explanation: 'GitHub Actions is a CI/CD platform that automates build, test, and deployment workflows directly from GitHub.'
      },
      {
        id: 'cicd_gh_q2',
        topicId: 'cicd_github_actions',
        question: 'What file defines a GitHub Actions workflow?',
        options: [
          '.github/workflows/main.yml',
          'dockerfile',
          'package.json',
          '.gitignore'
        ],
        correctIndex: 0,
        explanation: 'GitHub Actions workflows are defined in YAML files in .github/workflows/.'
      }
    ],

    // Prometheus Quizzes
    prom_intro: [
      {
        id: 'prom_intro_q1',
        topicId: 'prom_intro',
        question: 'What is Prometheus primarily used for?',
        options: [
          'Code compilation',
          'Systems monitoring and alerting',
          'Container orchestration',
          'Database management'
        ],
        correctIndex: 1,
        explanation: 'Prometheus is an open-source systems monitoring and alerting toolkit.'
      },
      {
        id: 'prom_intro_q2',
        topicId: 'prom_intro',
        question: 'What type of data does Prometheus collect?',
        options: [
          'Text documents',
          'Time series metrics',
          'Video files',
          'Source code'
        ],
        correctIndex: 1,
        explanation: 'Prometheus collects and stores metrics as time series data (with timestamps).'
      }
    ],
    prom_metrics: [
      {
        id: 'prom_met_q1',
        topicId: 'prom_metrics',
        question: 'Which metric type represents a value that can go up and down?',
        options: ['Counter', 'Gauge', 'Histogram', 'Summary'],
        correctIndex: 1,
        explanation: 'Gauge metrics represent values that can arbitrarily go up and down (like temperature or memory usage).'
      },
      {
        id: 'prom_met_q2',
        topicId: 'prom_metrics',
        question: 'Which metric type always increases (never decreases)?',
        options: ['Gauge', 'Counter', 'Histogram', 'Summary'],
        correctIndex: 1,
        explanation: 'Counter metrics only increase (or reset to zero), useful for counting requests or errors.'
      }
    ],

    // Security Quizzes
    sec_intro: [
      {
        id: 'sec_intro_q1',
        topicId: 'sec_intro',
        question: 'What does DevSecOps mean?',
        options: [
          'Development, Security, Operations integrated',
          'Secure Development Operations',
          'Development Security Only',
          'Standard Security Operations'
        ],
        correctIndex: 0,
        explanation: 'DevSecOps integrates security practices into the DevOps workflow, making security a shared responsibility.'
      },
      {
        id: 'sec_intro_q2',
        topicId: 'sec_intro',
        question: 'What is the principle of least privilege?',
        options: [
          'Give users maximum permissions',
          'Give users only the minimum permissions needed',
          'Remove all privileges',
          'Share privileges among all users'
        ],
        correctIndex: 1,
        explanation: 'Least privilege means giving users only the minimum permissions needed to perform their tasks.'
      }
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
          'In comments'
        ],
        correctIndex: 1,
        explanation: 'Secrets should never be in code. Use environment variables or tools like HashiCorp Vault.'
      },
      {
        id: 'sec_best_q2',
        topicId: 'sec_best_practices',
        question: 'What is defense in depth?',
        options: [
          'A single security layer',
          'Multiple layers of security controls',
          'Aggressive security testing',
          'Removing all defenses'
        ],
        correctIndex: 1,
        explanation: 'Defense in depth uses multiple layers of security so that if one fails, others provide protection.'
      }
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
          'Creating user accounts'
        ],
        correctIndex: 1,
        explanation: 'Kubernetes Secrets store sensitive data like passwords, OAuth tokens, and SSH keys.'
      },
      {
        id: 'sec_sec_q2',
        topicId: 'sec_secrets',
        question: 'Why should you avoid hardcoding secrets?',
        options: [
          'It makes code run slower',
          'Secrets can be exposed in code repositories and version control',
          'It increases performance',
          'It is required by law'
        ],
        correctIndex: 1,
        explanation: 'Hardcoded secrets end up in git history and can be exposed if the repo is public or compromised.'
      }
    ],

    // Machine Learning Quizzes
    ml_intro: [
      {
        id: 'ml_intro_q1',
        topicId: 'ml_intro',
        question: 'What is Machine Learning?',
        options: [
          'A programming language',
          'A type of hardware',
          'A subset of AI that enables systems to learn from data',
          'A database management system'
        ],
        correctIndex: 2,
        explanation: 'Machine Learning is a subset of AI that enables computers to learn from data without being explicitly programmed.'
      },
      {
        id: 'ml_intro_q2',
        topicId: 'ml_intro',
        question: 'Which company developed TensorFlow?',
        options: ['Facebook', 'Microsoft', 'Google', 'Amazon'],
        correctIndex: 2,
        explanation: 'TensorFlow was developed by Google Brain team and released as open source in 2015.'
      }
    ],
    ml_types: [
      {
        id: 'ml_types_q1',
        topicId: 'ml_types',
        question: 'What are the main types of Machine Learning?',
        options: [
          'Supervised, Unsupervised, and Reinforcement',
          'Classification, Regression, and Clustering',
          'Linear, Non-linear, and Decision Tree',
          'Neural, Deep, and Shallow'
        ],
        correctIndex: 0,
        explanation: 'The three main types of ML are Supervised, Unsupervised, and Reinforcement learning.'
      },
      {
        id: 'ml_types_q2',
        topicId: 'ml_types',
        question: 'Which type of ML uses labeled data?',
        options: ['Unsupervised Learning', 'Reinforcement Learning', 'Supervised Learning', 'All types'],
        correctIndex: 2,
        explanation: 'Supervised Learning uses labeled datasets to train algorithms to classify data or predict outcomes.'
      }
    ],
    ml_supervised: [
      {
        id: 'ml_sup_q1',
        topicId: 'ml_supervised',
        question: 'What is a common algorithm for classification problems?',
        options: ['Linear Regression', 'K-Means', 'Decision Tree', 'PCA'],
        correctIndex: 2,
        explanation: 'Decision Trees are commonly used for classification problems. Linear Regression is for regression (continuous values).'
      },
      {
        id: 'ml_sup_q2',
        topicId: 'ml_supervised',
        question: 'What is overfitting in ML?',
        options: [
          'When the model is too simple',
          'When the model performs poorly on training data',
          'When the model performs well on training data but poorly on new data',
          'When the model uses too little data'
        ],
        correctIndex: 2,
        explanation: 'Overfitting occurs when a model learns the training data too well but cannot generalize to new data.'
      }
    ],
    ml_unsupervised: [
      {
        id: 'ml_unsup_q1',
        topicId: 'ml_unsupervised',
        question: 'What is clustering used for in Unsupervised Learning?',
        options: [
          'Predicting continuous values',
          'Grouping similar data points together',
          'Classifying data with labels',
          'Training with labeled data'
        ],
        correctIndex: 1,
        explanation: 'Clustering groups similar data points together based on their features, without pre-existing labels.'
      },
      {
        id: 'ml_unsup_q2',
        topicId: 'ml_unsupervised',
        question: 'Which algorithm is commonly used for clustering?',
        options: ['Linear Regression', 'Decision Tree', 'K-Means', 'Naive Bayes'],
        correctIndex: 2,
        explanation: 'K-Means is a popular clustering algorithm that partitions data into K clusters.'
      }
    ],
    ml_neural_nets: [
      {
        id: 'ml_nn_q1',
        topicId: 'ml_neural_nets',
        question: 'What is a neuron in a neural network?',
        options: [
          'A biological cell in the brain',
          'A function that receives inputs and produces an output',
          'A type of hardware',
          'A programming language'
        ],
        correctIndex: 1,
        explanation: 'In neural networks, a neuron (or node) receives inputs, applies weights, sums them, and passes through an activation function.'
      },
      {
        id: 'ml_nn_q2',
        topicId: 'ml_neural_nets',
        question: 'What is deep learning?',
        options: [
          'Learning with deep thoughts',
          'Neural networks with many layers',
          'Learning at a slow pace',
          'A type of hardware acceleration'
        ],
        correctIndex: 1,
        explanation: 'Deep learning uses neural networks with multiple hidden layers to learn hierarchical representations of data.'
      }
    ],

    // Networking Quizzes
    net_intro: [
      {
        id: 'net_intro_q1',
        topicId: 'net_intro',
        question: 'What does HTTP stand for?',
        options: [
          'Hyper Text Transfer Protocol',
          'High Tech Transfer Protocol',
          'Hyperlink Text Transfer Protocol',
          'Home Tool Transfer Protocol'
        ],
        correctIndex: 0,
        explanation: 'HTTP stands for Hyper Text Transfer Protocol - the foundation of data communication on the web.'
      },
      {
        id: 'net_intro_q2',
        topicId: 'net_intro',
        question: 'What is the default port for HTTPS?',
        options: ['80', '443', '8080', '22'],
        correctIndex: 1,
        explanation: 'HTTPS defaults to port 443, while HTTP defaults to port 80.'
      }
    ],
    net_tcpip: [
      {
        id: 'net_tcp_q1',
        topicId: 'net_tcpip',
        question: 'What does TCP stand for?',
        options: [
          'Transfer Control Protocol',
          'Transmission Control Protocol',
          'Technical Control Protocol',
          'Text Control Protocol'
        ],
        correctIndex: 1,
        explanation: 'TCP stands for Transmission Control Protocol - it ensures reliable, ordered delivery of data.'
      },
      {
        id: 'net_tcp_q2',
        topicId: 'net_tcpip',
        question: 'What is the difference between TCP and UDP?',
        options: [
          'TCP is faster than UDP',
          'UDP is more reliable than TCP',
          'TCP provides reliable, ordered delivery; UDP is faster but unreliable',
          'There is no difference'
        ],
        correctIndex: 2,
        explanation: "TCP ensures reliability and order with handshake and acknowledgments. UDP is simpler and faster but doesn't guarantee delivery."
      }
    ],
    net_dns: [
      {
        id: 'net_dns_q1',
        topicId: 'net_dns',
        question: 'What does DNS stand for?',
        options: [
          'Domain Name System',
          'Dynamic Network Service',
          'Domain Network Setup',
          'Data Name Service'
        ],
        correctIndex: 0,
        explanation: 'DNS (Domain Name System) translates human-readable domain names into IP addresses.'
      },
      {
        id: 'net_dns_q2',
        topicId: 'net_dns',
        question: 'What type of DNS record points to an IP address?',
        options: ['A record', 'CNAME record', 'MX record', 'TXT record'],
        correctIndex: 0,
        explanation: 'A (Address) records point a domain name directly to an IPv4 IP address.'
      }
    ],
    net_http: [
      {
        id: 'net_http_q1',
        topicId: 'net_http',
        question: 'Which HTTP method is used to create a resource?',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        correctIndex: 1,
        explanation: 'POST is typically used to create new resources. PUT is used to update or create at a specific URI.'
      },
      {
        id: 'net_http_q2',
        topicId: 'net_http',
        question: 'What status code indicates "Not Found"?',
        options: ['200', '201', '404', '500'],
        correctIndex: 2,
        explanation: '404 is the standard status code for "Not Found" - the resource does not exist.'
      }
    ],

    // API Design Quizzes
    api_intro: [
      {
        id: 'api_intro_q1',
        topicId: 'api_intro',
        question: 'What does API stand for?',
        options: [
          'Application Programming Interface',
          'Advanced Programming Integration',
          'Application Process Interface',
          'Automated Programming Interface'
        ],
        correctIndex: 0,
        explanation: 'API stands for Application Programming Interface - a set of rules that allows software to communicate.'
      },
      {
        id: 'api_intro_q2',
        topicId: 'api_intro',
        question: 'What is the purpose of an API?',
        options: [
          'To store data in a database',
          'To allow different software applications to communicate',
          'To render HTML pages',
          'To manage operating system resources'
        ],
        correctIndex: 1,
        explanation: 'APIs enable different software systems to communicate and share data without exposing implementation details.'
      }
    ],
    api_rest: [
      {
        id: 'api_rest_q1',
        topicId: 'api_rest',
        question: 'What does REST stand for?',
        options: [
          'Representational State Transfer',
          'Remote Execution State Transfer',
          'Replicated State Transaction',
          'Reliable State Transport'
        ],
        correctIndex: 0,
        explanation: 'REST (Representational State Transfer) is an architectural style for web services.'
      },
      {
        id: 'api_rest_q2',
        topicId: 'api_rest',
        question: 'Which HTTP method is idempotent?',
        options: ['POST', 'PATCH', 'PUT', 'DELETE'],
        correctIndex: 2,
        explanation: 'PUT is idempotent - calling it multiple times produces the same result. POST and PATCH are not necessarily idempotent.'
      }
    ],
    api_auth: [
      {
        id: 'api_auth_q1',
        topicId: 'api_auth',
        question: 'What does JWT stand for?',
        options: [
          'Java Web Token',
          'JSON Web Token',
          'JavaScript Web Token',
          'JavaScript Web Transfer'
        ],
        correctIndex: 1,
        explanation: 'JWT (JSON Web Token) is a compact, self-contained way to securely transmit information as JSON.'
      },
      {
        id: 'api_auth_q2',
        topicId: 'api_auth',
        question: 'What is OAuth used for?',
        options: [
          'Database authentication',
          'Authorization - granting access without sharing passwords',
          'Email transmission',
          'File encryption'
        ],
        correctIndex: 1,
        explanation: 'OAuth allows users to grant third-party applications access to their resources without sharing passwords.'
      }
    ],

    // Observability Quizzes
    obs_intro: [
      {
        id: 'obs_intro_q1',
        topicId: 'obs_intro',
        question: 'What are the three pillars of observability?',
        options: [
          'Metrics, Logs, Traces',
          'CPU, Memory, Network',
          'Applications, Databases, Servers',
          'Monitoring, Logging, Alerting'
        ],
        correctIndex: 0,
        explanation: 'The three pillars are Metrics (numerical data), Logs (event records), and Traces (request paths).'
      },
      {
        id: 'obs_intro_q2',
        topicId: 'obs_intro',
        question: 'What is observability in DevOps?',
        options: [
          'The ability to see infrastructure',
          'The ability to understand internal system state from external outputs',
          'Monitoring only',
          'Logging only'
        ],
        correctIndex: 1,
        explanation: 'Observability is the ability to understand internal system state from external outputs like metrics, logs, and traces.'
      }
    ],
    obs_grafana: [
      {
        id: 'obs_graf_q1',
        topicId: 'obs_grafana',
        question: 'What is Grafana primarily used for?',
        options: [
          'Log aggregation',
          'Distributed tracing',
          'Data visualization and monitoring dashboards',
          'Container orchestration'
        ],
        correctIndex: 2,
        explanation: 'Grafana is an open-source platform for data visualization, monitoring, and alerting with customizable dashboards.'
      },
      {
        id: 'obs_graf_q2',
        topicId: 'obs_grafana',
        question: 'Which database is commonly used with Grafana for metrics storage?',
        options: ['MySQL', 'MongoDB', 'Prometheus', 'Redis'],
        correctIndex: 2,
        explanation: 'Prometheus is commonly used as a data source for Grafana, often deployed together in the Prometheus/Grafana stack.'
      }
    ],
    obs_loki: [
      {
        id: 'obs_loki_q1',
        topicId: 'obs_loki',
        question: 'What is Loki primarily designed for?',
        options: [
          'Metrics collection',
          'Distributed tracing',
          'Log aggregation',
          'Alert management'
        ],
        correctIndex: 2,
        explanation: 'Loki is a horizontally-scalable, highly-available log aggregation system, designed to work with Grafana.'
      },
      {
        id: 'obs_loki_q2',
        topicId: 'obs_loki',
        question: 'How does Loki differ from Elasticsearch for logs?',
        options: [
          'Loki indexes only labels, not log content',
          'Loki is faster than Elasticsearch',
          'Loki is a database while Elasticsearch is not',
          'There is no difference'
        ],
        correctIndex: 0,
        explanation: 'Loki only indexes metadata (labels) rather than full log content, making it more cost-effective than Elasticsearch.'
      }
    ],
    obs_tracing: [
      {
        id: 'obs_trace_q1',
        topicId: 'obs_tracing',
        question: 'What is distributed tracing?',
        options: [
          'Tracing network cables',
          'Tracking a request across multiple services',
          'Debugging a single application',
          'Monitoring server hardware'
        ],
        correctIndex: 1,
        explanation: 'Distributed tracing tracks a request as it flows through multiple services in a microservices architecture.'
      },
      {
        id: 'obs_trace_q2',
        topicId: 'obs_tracing',
        question: 'What is a span in distributed tracing?',
        options: [
          'A unit of work in a single service',
          'A type of database',
          'A monitoring tool',
          'A network protocol'
        ],
        correctIndex: 0,
        explanation: 'A span represents a single unit of work (operation) in a trace, with timing and metadata about that operation.'
      }
    ],

    // Ansible Quizzes
    ans_intro: [
      {
        id: 'ans_intro_q1',
        topicId: 'ans_intro',
        question: 'What is Ansible primarily used for?',
        options: [
          'Container orchestration',
          'Configuration management and automation',
          'Database management',
          'Network routing'
        ],
        correctIndex: 1,
        explanation: 'Ansible is an open-source automation tool for configuration management, application deployment, and task automation.'
      },
      {
        id: 'ans_intro_q2',
        topicId: 'ans_intro',
        question: 'What communication method does Ansible use to connect to servers??',
        options: [
          'SSH only',
          'WinRM only',
          'SSH and WinRM',
          'Docker API'
        ],
        correctIndex: 2,
        explanation: 'Ansible uses SSH for Linux/Unix servers and WinRM (Windows Remote Management) for Windows servers.'
      }
    ],
    ans_inventory: [
      {
        id: 'ans_inv_q1',
        topicId: 'ans_inventory',
        question: 'What is an Ansible inventory file?',
        options: [
          'A list of Ansible modules',
          'A file that defines managed hosts and groups',
          'A backup of playbooks',
          'A log file for Ansible runs'
        ],
        correctIndex: 1,
        explanation: 'The inventory file defines hosts and groups of hosts that Ansible manages and automation tasks target.'
      },
      {
        id: 'ans_inv_q2',
        topicId: 'ans_inventory',
        question: 'What is the default location for the Ansible inventory file?',
        options: [
          '/etc/ansible/hosts',
          '~/.ansible/hosts',
          '/opt/inventory.ini',
          '~/inventory.yml'
        ],
        correctIndex: 0,
        explanation: 'By default, Ansible looks for the inventory file at /etc/ansible/hosts, but this can be customized.'
      }
    ],
    ans_playbooks: [
      {
        id: 'ans_play_q1',
        topicId: 'ans_playbooks',
        question: 'What language are Ansible playbooks written in?',
        options: [
          'Python',
          'YAML',
          'JSON',
          'XML'
        ],
        correctIndex: 1,
        explanation: 'Ansible playbooks are written in YAML (YAML Ain\'t Markup Language), making them human-readable.'
      },
      {
        id: 'ans_play_q2',
        topicId: 'ans_playbooks',
        question: 'What is a "play" in an Ansible playbook?',
        options: [
          'A single task to execute',
          'A mapping between hosts and tasks',
          'A configuration file',
          'An inventory group'
        ],
        correctIndex: 1,
        explanation: 'A play defines which hosts to target and what tasks to run on those hosts.'
      }
    ],
    ans_roles: [
      {
        id: 'ans_role_q1',
        topicId: 'ans_roles',
        question: 'What is the purpose of Ansible roles?',
        options: [
          'To define user permissions',
          'To organize and reuse playbook components',
          'To manage server hardware',
          'To monitor server performance'
        ],
        correctIndex: 1,
        explanation: 'Roles allow you to package tasks, handlers, variables, and other files into a reusable structure.'
      },
      {
        id: 'ans_role_q2',
        topicId: 'ans_roles',
        question: 'Which directory structure is used by Ansible roles?',
        options: [
          'bin/, lib/, doc/',
          'tasks/, handlers/, vars/, templates/, files/',
          'src/, include/, module/',
          'play/, run/, config/'
        ],
        correctIndex: 1,
        explanation: 'Standard Ansible role directories include tasks/, handlers/, vars/, defaults/, templates/, files/, and more.'
      }
    ],
    ans_modules: [
      {
        id: 'ans_mod_q1',
        topicId: 'ans_modules',
        question: 'What are Ansible modules?',
        options: [
          'Physical server components',
          'Units of code that Ansible executes on targets',
          'Network protocols',
          'Database schemas'
        ],
        correctIndex: 1,
        explanation: 'Modules are standalone scripts that Ansible executes on target hosts to perform specific tasks.'
      },
      {
        id: 'ans_mod_q2',
        topicId: 'ans_modules',
        question: 'Which module would you use to manage packages on Debian/Ubuntu?',
        options: [
          'yum_package',
          'apt_package',
          'brew_package',
          'chocolatey'
        ],
        correctIndex: 1,
        explanation: 'The apt_package module is used for managing packages on Debian-based systems like Ubuntu.'
      }
    ],

    // Kafka Quizzes
    kafka_intro: [
      {
        id: 'kafka_intro_q1',
        topicId: 'kafka_intro',
        question: 'What type of system is Apache Kafka?',
        options: [
          'Relational database',
          'Distributed event streaming platform',
          'Message queue only',
          'File storage system'
        ],
        correctIndex: 1,
        explanation: 'Apache Kafka is a distributed event streaming platform used for building real-time data pipelines and streaming apps.'
      },
      {
        id: 'kafka_intro_q2',
        topicId: 'kafka_intro',
        question: 'What is the primary programming language Kafka is written in?',
        options: [
          'Python',
          'Java and Scala',
          'Go',
          'Ruby'
        ],
        correctIndex: 1,
        explanation: 'Kafka is primarily written in Java and Scala, which gives it high performance and scalability.'
      }
    ],
    kafka_topics: [
      {
        id: 'kafka_topic_q1',
        topicId: 'kafka_topics',
        question: 'What is a Kafka topic?',
        options: [
          'A database table',
          'A category/feed name for messages',
          'A network protocol',
          'A user account'
        ],
        correctIndex: 1,
        explanation: 'A topic is a logical channel or category to which producers send messages and consumers read from.'
      },
      {
        id: 'kafka_topic_q2',
        topicId: 'kafka_topics',
        question: 'What is topic partitioning in Kafka?',
        options: [
          'Compressing topic messages',
          'Dividing a topic into multiple segments',
          'Encrypting topic data',
          'Backing up topic data'
        ],
        correctIndex: 1,
        explanation: 'Partitioning divides a topic into multiple segments called partitions, enabling parallel processing and scalability.'
      }
    ],
    kafka_producers: [
      {
        id: 'kafka_prod_q1',
        topicId: 'kafka_producers',
        question: 'What is the role of a Kafka producer?',
        options: [
          'To consume messages from topics',
          'To publish/send messages to Kafka topics',
          'To manage Kafka broker storage',
          'To authenticate Kafka users'
        ],
        correctIndex: 1,
        explanation: 'Producers are applications that publish/send records (messages) to Kafka topics.'
      },
      {
        id: 'kafka_prod_q2',
        topicId: 'kafka_producers',
        question: 'What determines which partition a message is sent to?',
        options: [
          'Random selection only',
          'Message key or round-robin',
          'Consumer preference only',
          'Broker availability'
        ],
        correctIndex: 1,
        explanation: 'If a message has a key, Kafka hashes it to determine the partition. Otherwise, it uses round-robin.'
      }
    ],
    kafka_consumers: [
      {
        id: 'kafka_cons_q1',
        topicId: 'kafka_consumers',
        question: 'What is a Kafka consumer group?',
        options: [
          'A group of Kafka administrators',
          'A set of consumers that jointly consume topics',
          'A collection of related topics',
          'A security group for Kafka access'
        ],
        correctIndex: 1,
        explanation: 'A consumer group is a set of consumers cooperating to consume messages from topics, with each partition assigned to one consumer.'
      },
      {
        id: 'kafka_cons_q2',
        topicId: 'kafka_consumers',
        question: 'What is offset in Kafka consumer context?',
        options: [
          'The timestamp of a message',
          'The sequential position of a message in a partition',
          'The size of the message queue',
          'The network latency measurement'
        ],
        correctIndex: 1,
        explanation: 'An offset is a sequential index number that uniquely identifies each message within a partition.'
      }
    ],
    kafka_streams: [
      {
        id: 'kafka_str_q1',
        topicId: 'kafka_streams',
        question: 'What is Kafka Streams used for?',
        options: [
          'Storing persistent data',
          'Processing streaming data in real-time',
          'Managing Kafka clusters',
          'Creating Kafka topics'
        ],
        correctIndex: 1,
        explanation: 'Kafka Streams is a client library for building real-time streaming applications that process data from Kafka.'
      },
      {
        id: 'kafka_str_q2',
        topicId: 'kafka_streams',
        question: 'What is a "stream" in Kafka Streams?',
        options: [
          'A network connection',
          'An immutable sequence of data records',
          'A Kafka broker',
          'A consumer group'
        ],
        correctIndex: 1,
        explanation: 'In Kafka Streams, a stream is an immutable, ordered sequence of data records that can be processed.'
      }
    ],
    kafka_connect: [
      {
        id: 'kafka_conn_q1',
        topicId: 'kafka_connect',
        question: 'What is Kafka Connect?',
        options: [
          'A Kafka client library',
          'A framework for connecting Kafka with external systems',
          'A network configuration tool',
          'A monitoring dashboard'
        ],
        correctIndex: 1,
        explanation: 'Kafka Connect is a framework for scalably and reliably streaming data between Kafka and other systems.'
      },
      {
        id: 'kafka_conn_q2',
        topicId: 'kafka_connect',
        question: 'What are connectors in Kafka Connect?',
        options: [
          'Network cables for Kafka brokers',
          'Plugins that define how to integrate with external systems',
          'Consumer group configurations',
          'Topic replication settings'
        ],
        correctIndex: 1,
        explanation: 'Connectors are plugins that implement the integration logic for connecting Kafka to specific external systems.'
      }
    ],

    // RabbitMQ Quizzes
    rmq_intro: [
      {
        id: 'rmq_intro_q1',
        topicId: 'rmq_intro',
        question: 'What is RabbitMQ?',
        options: [
          'A database management system',
          'An open-source message broker',
          'A web server',
          'A container runtime'
        ],
        correctIndex: 1,
        explanation: 'RabbitMQ is an open-source message broker that implements the AMQP protocol for asynchronous messaging.'
      },
      {
        id: 'rmq_intro_q2',
        topicId: 'rmq_intro',
        question: 'What protocol does RabbitMQ primarily implement?',
        options: [
          'HTTP',
          'AMQP (Advanced Message Queuing Protocol)',
          'FTP',
          'SSH'
        ],
        correctIndex: 1,
        explanation: 'RabbitMQ primarily implements the AMQP protocol, though it also supports other protocols like MQTT and STOMP.'
      }
    ],
    rmq_exchanges: [
      {
        id: 'rmq_exch_q1',
        topicId: 'rmq_exchanges',
        question: 'What is a RabbitMQ exchange?',
        options: [
          'A message storage location',
          'A routing entity that receives and routes messages',
          'A user authentication service',
          'A network gateway'
        ],
        correctIndex: 1,
        explanation: 'An exchange receives messages from producers and routes them to queues based on routing rules and bindings.'
      },
      {
        id: 'rmq_exch_q2',
        topicId: 'rmq_exchanges',
        question: 'Which exchange type routes messages to all bound queues?',
        options: [
          'direct',
          'fanout',
          'topic',
          'headers'
        ],
        correctIndex: 1,
        explanation: 'Fanout exchange routes messages to ALL queues bound to it, regardless of routing key.'
      }
    ],
    rmq_queues: [
      {
        id: 'rmq_queue_q1',
        topicId: 'rmq_queues',
        question: 'What is a queue in RabbitMQ?',
        options: [
          'A type of exchange',
          'A FIFO buffer that stores messages',
          'A network connection',
          'A user permission set'
        ],
        correctIndex: 1,
        explanation: 'A queue is a FIFO (first-in-first-out) buffer that stores messages until they are consumed.'
      },
      {
        id: 'rmq_queue_q2',
        topicId: 'rmq_queues',
        question: 'What happens when a queue is durable?',
        options: [
          'It can only be accessed by durable connections',
          'It survives broker restarts',
          'It encrypts all messages',
          'It has unlimited storage'
        ],
        correctIndex: 1,
        explanation: 'A durable queue is persisted to disk and survives broker restarts, unlike transient queues.'
      }
    ],
    rmq_bindings: [
      {
        id: 'rmq_bind_q1',
        topicId: 'rmq_bindings',
        question: 'What is a binding in RabbitMQ?',
        options: [
          'A network connection between brokers',
          'A link between an exchange and a queue',
          'A user authentication mechanism',
          'A message encryption key'
        ],
        correctIndex: 1,
        explanation: 'A binding defines the relationship between an exchange and a queue, often with a routing key pattern.'
      },
      {
        id: 'rmq_bind_q2',
        topicId: 'rmq_bindings',
        question: 'What is a binding key?',
        options: [
          'A password for accessing queues',
          'A pattern used to match routing keys',
          'A certificate for TLS connections',
          'A message priority level'
        ],
        correctIndex: 1,
        explanation: 'A binding key is a pattern (like "*.stock.*") that the exchange uses to determine which queues should receive messages.'
      }
    ],
    rmq_publish: [
      {
        id: 'rmq_pub_q1',
        topicId: 'rmq_publish',
        question: 'What is the difference between direct and persistent message delivery?',
        options: [
          'Direct uses TCP, persistent uses UDP',
          'Direct is fire-and-forget, persistent is saved to disk',
          'Direct is encrypted, persistent is not',
          'There is no difference'
        ],
        correctIndex: 1,
        explanation: 'Persistent messages are saved to disk before acknowledgment, surviving broker restarts. Direct messages are not.'
      },
      {
        id: 'rmq_pub_q2',
        topicId: 'rmq_publish',
        question: 'What does it mean when publishing with mandatory=true?',
        options: [
          'The message is encrypted',
          'The message is guaranteed to be routed to a queue',
          'The message has highest priority',
          'The message is compressed'
        ],
        correctIndex: 1,
        explanation: 'With mandatory=true, if a message cannot be routed to any queue, it is returned to the producer.'
      }
    ],

    // Istio Quizzes
    istio_intro: [
      {
        id: 'istio_intro_q1',
        topicId: 'istio_intro',
        question: 'What is Istio?',
        options: [
          'A container orchestration platform',
          'A service mesh solution for microservices',
          'A programming language',
          'A database system'
        ],
        correctIndex: 1,
        explanation: 'Istio is a service mesh that provides traffic management, security, and observability for microservices.'
      },
      {
        id: 'istio_intro_q2',
        topicId: 'istio_intro',
        question: 'What programming language is Istio primarily written in?',
        options: [
          'Python',
          'Go',
          'Java',
          'Rust'
        ],
        correctIndex: 1,
        explanation: 'Istio is primarily written in Go, which is common for cloud-native infrastructure projects.'
      }
    ],
    istio_traffic: [
      {
        id: 'istio_traffic_q1',
        topicId: 'istio_traffic',
        question: 'What is traffic splitting in Istio used for?',
        options: [
          'Dividing network bandwidth',
          'Routing a percentage of traffic to different versions',
          'Load balancing only',
          'Firewall configuration'
        ],
        correctIndex: 1,
        explanation: 'Traffic splitting allows you to route percentages of traffic to different service versions for canary deployments.'
      },
      {
        id: 'istio_traffic_q2',
        topicId: 'istio_traffic',
        question: 'What is a VirtualService in Istio?',
        options: [
          'A Kubernetes virtual machine',
          'A resource that defines routing rules for traffic',
          'A network cable',
          'A database connection'
        ],
        correctIndex: 1,
        explanation: 'VirtualService configures how requests are routed to a service within the mesh.'
      }
    ],
    istio_security: [
      {
        id: 'istio_sec_q1',
        topicId: 'istio_security',
        question: 'What does Istio\'s mTLS (mutual TLS) provide?',
        options: [
          'Single-direction authentication',
          'Bidirectional authentication between services',
          'Message encryption only',
          'User authentication only'
        ],
        correctIndex: 1,
        explanation: 'mTLS ensures both the client and server authenticate each other and encrypt traffic between them.'
      },
      {
        id: 'istio_sec_q2',
        topicId: 'istio_security',
        question: 'What is a PeerAuthentication policy in Istio?',
        options: [
          'A policy for user login',
          'A policy that defines how services authenticate with each other',
          'A policy for database connections',
          'A policy for API access'
        ],
        correctIndex: 1,
        explanation: 'PeerAuthentication defines how mutual TLS is enforced between services in the mesh.'
      }
    ],
    istio_observability: [
      {
        id: 'istio_obs_q1',
        topicId: 'istio_observability',
        question: 'What is telemetry collection in Istio?',
        options: [
          'Manual logging by developers',
          'Automatic collection of metrics, logs, and traces',
          'Database backup',
          'Network configuration'
        ],
        correctIndex: 1,
        explanation: 'Istio automatically collects telemetry data (metrics, traces, logs) without requiring changes to application code.'
      },
      {
        id: 'istio_obs_q2',
        topicId: 'istio_observability',
        question: 'Which tool does Istio use for distributed tracing?',
        options: [
          'CloudWatch',
          'Jaeger or Zipkin',
          'Datadog',
          'New Relic'
        ],
        correctIndex: 1,
        explanation: 'Istio integrates with Jaeger and Zipkin for distributed tracing across microservices.'
      }
    ],
  }

  return quizzes
}

export const quizzes = generateQuizzes()

// Get quiz for a specific topic
export function getQuizForTopic(topicId: string): QuizQuestion[] {
  return quizzes[topicId] || []
}

// Check if a quiz exists for a topic
export function hasQuiz(topicId: string): boolean {
  return !!quizzes[topicId] && quizzes[topicId].length > 0
}
