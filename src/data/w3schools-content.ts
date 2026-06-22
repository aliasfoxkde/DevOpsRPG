// Pre-scraped W3Schools content - stored as static data
// This content is scraped via scripts/scrape-w3schools.js and stored here

export interface Section {
  heading: string
  content: string
}

export interface TopicContent {
  id: string
  name: string
  sections: Section[]
  codeExamples: string[]
}

export interface TechnologyContent {
  name: string
  icon: string
  description: string
  topics: TopicContent[]
}

export interface W3SchoolsData {
  version: string
  lastUpdated: string
  technologies: Record<string, TechnologyContent>
}

export const w3schoolsContent: W3SchoolsData = {
  version: '1.0.0',
  lastUpdated: '2026-06-22',
  technologies: {
    html: {
      name: 'HTML',
      icon: '📄',
      description: 'The standard markup language for Web pages',
      topics: [
        {
          id: 'html_intro',
          name: 'HTML Introduction',
          sections: [
            {
              heading: 'What is HTML?',
              content: 'HTML stands for Hyper Text Markup Language. HTML is the standard markup language for creating Web pages. HTML describes the structure of a Web page. HTML consists of a series of elements. HTML elements tell the browser how to display the content.',
            },
            {
              heading: 'A Simple HTML Document',
              content: 'The <!DOCTYPE html> declaration defines that this document is an HTML5 document. The <html> element is the root element of an HTML page. The <head> element contains meta information. The <title> element specifies a title for the page. The <body> element defines the document\'s body, containing visible contents.',
            },
          ],
          codeExamples: [
            '<!DOCTYPE html>\n<html>\n<head>\n<title>Page Title</title>\n</head>\n<body>\n<h1>My First Heading</h1>\n<p>My first paragraph.</p>\n</body>\n</html>',
          ],
        },
        {
          id: 'html_basic',
          name: 'HTML Basic',
          sections: [
            {
              heading: 'HTML Documents',
              content: 'All HTML documents must start with a document type declaration: <!DOCTYPE html>. The HTML document itself begins with <html> and ends with </html>. The visible part of the HTML document is between <body> and </body>.',
            },
            {
              heading: 'HTML Headings',
              content: 'HTML headings are defined with the <h1> to <h6> tags. <h1> defines the most important heading. <h6> defines the least important heading.',
            },
            {
              heading: 'HTML Paragraphs',
              content: 'HTML paragraphs are defined with the <p> tag.',
            },
            {
              heading: 'HTML Links',
              content: 'HTML links are defined with the <a> tag.',
            },
            {
              heading: 'HTML Images',
              content: 'HTML images are defined with the <img> tag. The source file (src), alternative text (alt), width, and height are provided as attributes.',
            },
          ],
          codeExamples: [
            '<!DOCTYPE html>\n<html>\n<body>\n<h1>My First Heading</h1>\n<p>My first paragraph.</p>\n<a href="https://www.w3schools.com">This is a link</a>\n<img src="w3schools.jpg" alt="W3Schools.com" width="104" height="142">\n</body>\n</html>',
          ],
        },
        {
          id: 'html_elements',
          name: 'HTML Elements',
          sections: [
            {
              heading: 'HTML Elements',
              content: 'An HTML element is defined by a start tag, some content, and an end tag. The HTML element is everything from the start tag to the end tag.',
            },
            {
              heading: 'Nested HTML Elements',
              content: 'HTML elements can be nested. All HTML documents consist of nested HTML elements.',
            },
            {
              heading: 'Empty HTML Elements',
              content: 'HTML elements with no content are called empty elements. The <br> tag defines a line break.',
            },
          ],
          codeExamples: ['<html>\n<body>\n<h1>My First Heading</h1>\n<p>My first paragraph.</p>\n</body>\n</html>'],
        },
        {
          id: 'html_attributes',
          name: 'HTML Attributes',
          sections: [
            {
              heading: 'HTML Attributes',
              content: 'HTML attributes provide additional information about HTML elements. Attributes are specified in the start tag. Attributes come in name/value pairs like: name="value".',
            },
            {
              heading: 'The href Attribute',
              content: 'HTML links are defined with the <a> tag. The link address is specified in the href attribute.',
            },
            {
              heading: 'The src Attribute',
              content: 'HTML images are embedded with the <img> tag. The filename of the image source is specified in the src attribute.',
            },
            {
              heading: 'The alt Attribute',
              content: 'The alt attribute specifies an alternative text to be used when an image cannot be displayed.',
            },
          ],
          codeExamples: [
            '<a href="https://www.w3schools.com">This is a link</a>',
            '<img src="img_girl.jpg" alt="Girl with a jacket">',
          ],
        },
        {
          id: 'html_headings',
          name: 'HTML Headings',
          sections: [
            {
              heading: 'HTML Headings',
              content: 'HTML headings are defined with the <h1> to <h6> tags. <h1> defines the most important heading. <h6> defines the least important heading.',
            },
            {
              heading: 'HTML Horizontal Rules',
              content: 'The <hr> tag defines a thematic break in an HTML page, and is most often displayed as a horizontal rule.',
            },
          ],
          codeExamples: [
            '<h1>Heading 1</h1>\n<h2>Heading 2</h2>\n<h3>Heading 3</h3>',
            '<h1>This is heading 1</h1>\n<p>This is some text.</p>\n<hr>\n<h2>This is heading 2</h2>',
          ],
        },
        {
          id: 'html_paragraphs',
          name: 'HTML Paragraphs',
          sections: [
            {
              heading: 'HTML Paragraphs',
              content: 'The HTML <p> element defines a paragraph. A paragraph always starts on a new line, and browsers automatically add some white space before and after a paragraph.',
            },
            {
              heading: 'HTML Line Breaks',
              content: 'The HTML <br> element defines a line break. Use <br> if you want a line break without starting a new paragraph.',
            },
          ],
          codeExamples: [
            '<p>This is a paragraph.</p>\n<p>This is another paragraph.</p>',
            '<p>This is<br>a paragraph<br>with line breaks.</p>',
          ],
        },
      ],
    },
    css: {
      name: 'CSS',
      icon: '🎨',
      description: 'Style sheet language for Web pages',
      topics: [
        {
          id: 'css_intro',
          name: 'CSS Introduction',
          sections: [
            {
              heading: 'What is CSS?',
              content: 'CSS stands for Cascading Style Sheets. CSS describes how HTML elements are to be displayed on screen, paper, or in other media. CSS saves a lot of work.',
            },
            {
              heading: 'Why Use CSS?',
              content: 'CSS is used to define styles for your web pages, including the design, layout and variations in display for different devices and screen sizes.',
            },
          ],
          codeExamples: [
            'body {\n  background-color: lightblue;\n}\n\nh1 {\n  color: white;\n  text-align: center;\n}\n\np {\n  font-family: verdana;\n  font-size: 20px;\n}',
          ],
        },
        {
          id: 'css_syntax',
          name: 'CSS Syntax',
          sections: [
            {
              heading: 'CSS Syntax',
              content: 'A CSS rule consists of a selector and a declaration block. The selector points to the HTML element you want to style. The declaration block contains declarations separated by semicolons.',
            },
            {
              heading: 'CSS Selectors',
              content: 'CSS selectors are used to find HTML elements. Simple selectors select elements by name, id, class.',
            },
          ],
          codeExamples: [
            'p {\n  text-align: center;\n  color: red;\n}',
            '#para1 {\n  text-align: center;\n  color: red;\n}',
            '.center {\n  text-align: center;\n  color: red;\n}',
          ],
        },
        {
          id: 'css_boxmodel',
          name: 'CSS Box Model',
          sections: [
            {
              heading: 'The CSS Box Model',
              content: 'In CSS, the term box model is used when talking about design and layout. The CSS box model is essentially a box that wraps around every HTML element. It consists of: margins, borders, padding, and the actual content.',
            },
          ],
          codeExamples: [
            'div {\n  width: 300px;\n  border: 15px solid green;\n  padding: 50px;\n  margin: 20px;\n}',
          ],
        },
        {
          id: 'css_flexbox',
          name: 'CSS Flexbox',
          sections: [
            {
              heading: 'CSS Flexbox',
              content: 'The Flexible Box Layout Module makes it easier to design flexible responsive layout structure without using float or positioning.',
            },
            {
              heading: 'Flex Container',
              content: 'To start using the Flexbox model, you need to first define a flex container.',
            },
          ],
          codeExamples: [
            '.flex-container {\n  display: flex;\n}',
            '.flex-container {\n  display: flex;\n  justify-content: center;\n}',
          ],
        },
      ],
    },
    javascript: {
      name: 'JavaScript',
      icon: '⚡',
      description: 'The programming language of the Web',
      topics: [
        {
          id: 'js_intro',
          name: 'JavaScript Introduction',
          sections: [
            {
              heading: 'What is JavaScript?',
              content: 'JavaScript is the world\'s most popular programming language. JavaScript is the language of the Web. JavaScript was originally created to make web pages alive.',
            },
            {
              heading: 'JavaScript Can Change HTML Content',
              content: 'One of many JavaScript HTML methods is getElementById(). This example finds an HTML element and changes its content.',
            },
          ],
          codeExamples: [
            'document.getElementById("demo").innerHTML = "Hello JavaScript!";',
          ],
        },
        {
          id: 'js_variables',
          name: 'JavaScript Variables',
          sections: [
            {
              heading: 'JavaScript Variables',
              content: 'Variables are containers for storing data values. You declare a JavaScript variable with the var keyword.',
            },
            {
              heading: 'Naming Variables',
              content: 'JavaScript variable names are case sensitive. A variable name must start with a letter, underscore, or dollar sign.',
            },
          ],
          codeExamples: [
            'var x = 5;\nvar y = 6;\nvar z = x + y;',
            'let x = 5;\nlet y = 6;',
            'const PI = 3.14159;',
          ],
        },
        {
          id: 'js_functions',
          name: 'JavaScript Functions',
          sections: [
            {
              heading: 'JavaScript Functions',
              content: 'A JavaScript function is a block of code designed to perform a particular task. A JavaScript function is executed when something invokes it.',
            },
            {
              heading: 'Function Return',
              content: 'When JavaScript reaches a return statement, the function will stop executing and return the specified value.',
            },
          ],
          codeExamples: [
            'function myFunction(p1, p2) {\n  return p1 * p2;\n}',
            'const myFunction = (p1, p2) => p1 * p2;',
          ],
        },
        {
          id: 'js_objects',
          name: 'JavaScript Objects',
          sections: [
            {
              heading: 'JavaScript Objects',
              content: 'Objects are variables too, but objects can contain many values.',
            },
            {
              heading: 'Object Definition',
              content: 'You define a JavaScript object with an object literal. The name:values pairs are called properties.',
            },
          ],
          codeExamples: [
            'var car = {type:"Fiat", model:"500", color:"white"};',
            'var person = {\n  firstName: "John",\n  lastName: "Doe",\n  age: 50\n};',
          ],
        },
        {
          id: 'js_arrays',
          name: 'JavaScript Arrays',
          sections: [
            {
              heading: 'JavaScript Arrays',
              content: 'An array is a special variable, which can hold more than one value at a time.',
            },
            {
              heading: 'Array Syntax',
              content: 'An array is declared with the square brackets syntax.',
            },
          ],
          codeExamples: [
            'var cars = ["Saab", "Volvo", "BMW"];',
            'cars[0]; // Returns "Saab"',
          ],
        },
      ],
    },
    python: {
      name: 'Python',
      icon: '🐍',
      description: 'A popular programming language',
      topics: [
        {
          id: 'python_intro',
          name: 'Python Introduction',
          sections: [
            {
              heading: 'What is Python?',
              content: 'Python is a popular programming language. It was created by Guido van Rossum, and released in 1991. Python is used for: web development, software development, mathematics, system scripting.',
            },
            {
              heading: 'Why Python?',
              content: 'Python works on different platforms. Python has a simple syntax similar to the English language. Python runs on an interpreter system, meaning that code can be executed as soon as it is written.',
            },
          ],
          codeExamples: ['print("Hello, World!")'],
        },
        {
          id: 'python_syntax',
          name: 'Python Syntax',
          sections: [
            {
              heading: 'Python Syntax',
              content: 'Python was designed for readability, and has some similarities to the English language. Python uses new lines to complete a command.',
            },
            {
              heading: 'Indentation',
              content: 'Python uses indentation to indicate a block of code.',
            },
          ],
          codeExamples: [
            'if 5 > 2:\n  print("Five is greater than two!")',
            'x = 5\ny = "Hello, World!"',
          ],
        },
        {
          id: 'python_variables',
          name: 'Python Variables',
          sections: [
            {
              heading: 'Creating Variables',
              content: 'In Python, variables are created when you assign a value to it. Variables do not need to be declared with any particular type.',
            },
            {
              heading: 'Variable Names',
              content: 'A variable name must start with a letter or underscore. Variable names are case-sensitive.',
            },
          ],
          codeExamples: [
            'x = 5\ny = "John"\nprint(x)\nprint(y)',
            'x, y, z = "Orange", "Banana", "Cherry"',
          ],
        },
        {
          id: 'python_lists',
          name: 'Python Lists',
          sections: [
            {
              heading: 'List',
              content: 'Lists are used to store multiple items in a single variable. Lists are ordered and changeable.',
            },
            {
              heading: 'Access Items',
              content: 'You access the list items by referring to the index number.',
            },
          ],
          codeExamples: [
            'thislist = ["apple", "banana", "cherry"]\nprint(thislist)',
            'thislist = ["apple", "banana", "cherry"]\nprint(thislist[1])',
          ],
        },
        {
          id: 'python_functions',
          name: 'Python Functions',
          sections: [
            {
              heading: 'Creating a Function',
              content: 'In Python a function is defined using the def keyword.',
            },
            {
              heading: 'Arguments',
              content: 'Information can be passed into functions as arguments.',
            },
          ],
          codeExamples: [
            'def my_function():\n  print("Hello from a function")',
            'def my_function(fname):\n  print(fname + " Refsnes")\n\nmy_function("Emil")',
          ],
        },
      ],
    },
    sql: {
      name: 'SQL',
      icon: '🗄️',
      description: 'Standard language for data manipulation',
      topics: [
        {
          id: 'sql_intro',
          name: 'SQL Introduction',
          sections: [
            {
              heading: 'What is SQL?',
              content: 'SQL stands for Structured Query Language. SQL lets you access and manipulate databases. SQL became a standard of ANSI in 1986.',
            },
            {
              heading: 'What Can SQL do?',
              content: 'SQL can execute queries against a database. SQL can retrieve data from a database. SQL can insert records in a database. SQL can update records. SQL can delete records from a database.',
            },
          ],
          codeExamples: ['SELECT * FROM Customers;'],
        },
        {
          id: 'sql_select',
          name: 'SQL SELECT Statement',
          sections: [
            {
              heading: 'SELECT Syntax',
              content: 'The SELECT statement is used to select data from a database. The data is returned in a result table.',
            },
            {
              heading: 'SELECT DISTINCT',
              content: 'The SELECT DISTINCT statement is used to return only distinct values.',
            },
          ],
          codeExamples: [
            'SELECT column1, column2 FROM table_name;',
            'SELECT * FROM table_name;',
            'SELECT DISTINCT Country FROM Customers;',
          ],
        },
        {
          id: 'sql_where',
          name: 'SQL WHERE Clause',
          sections: [
            {
              heading: 'WHERE Syntax',
              content: 'The WHERE clause is used to filter records. The WHERE clause is used to extract only those records that fulfill a specified condition.',
            },
            {
              heading: 'Operators',
              content: 'The following operators can be used: = Equal, <> Not equal, > Greater than, < Less than, >= Greater or equal, <= Less or equal.',
            },
          ],
          codeExamples: [
            'SELECT * FROM Customers\nWHERE Country="Mexico";',
            'SELECT * FROM Customers\nWHERE CustomerID=1;',
          ],
        },
        {
          id: 'sql_insert',
          name: 'SQL INSERT INTO Statement',
          sections: [
            {
              heading: 'INSERT INTO Syntax',
              content: 'The INSERT INTO statement is used to insert new records in a table.',
            },
          ],
          codeExamples: [
            'INSERT INTO Customers (CustomerName, ContactName, Address, City, PostalCode, Country)\nVALUES ("Cardinal", "Tom B. Erichsen", "Skagen 21", "Stavanger", "4006", "Norway");',
          ],
        },
        {
          id: 'sql_update',
          name: 'SQL UPDATE Statement',
          sections: [
            {
              heading: 'UPDATE Syntax',
              content: 'The UPDATE statement is used to modify the existing records in a table. Be careful when updating records!',
            },
          ],
          codeExamples: [
            'UPDATE Customers\nSET ContactName = "Alfred Schmidt", City= "Frankfurt"\nWHERE CustomerID = 1;',
          ],
        },
        {
          id: 'sql_delete',
          name: 'SQL DELETE Statement',
          sections: [
            {
              heading: 'DELETE Syntax',
              content: 'The DELETE statement is used to delete existing records in a table. Be careful when deleting records!',
            },
          ],
          codeExamples: [
            'DELETE FROM Customers WHERE CustomerName="Alfreds Futterkiste";',
          ],
        },
      ],
    },
  },
}
