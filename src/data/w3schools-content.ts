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
  version: '2.0.0',
  lastUpdated: '2026-06-22',
  technologies: {
    // Phase 1: Foundations
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
        {
          id: 'html_forms',
          name: 'HTML Forms',
          sections: [
            {
              heading: 'HTML Forms',
              content: 'An HTML form is used to collect user input. The form element is a container for different types of input elements.',
            },
            {
              heading: 'The <input> Element',
              content: 'The HTML <input> element is the most used form element. An input element can be displayed in many ways, depending on the type attribute.',
            },
          ],
          codeExamples: [
            '<form>\n  <label for="fname">First name:</label><br>\n  <input type="text" id="fname" name="fname"><br>\n  <label for="lname">Last name:</label><br>\n  <input type="text" id="lname" name="lname">\n</form>',
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
        {
          id: 'css_grid',
          name: 'CSS Grid',
          sections: [
            {
              heading: 'CSS Grid Layout',
              content: 'The CSS Grid Layout Module offers a grid-based layout system, with rows and columns, making it easier to design web pages.',
            },
            {
              heading: 'Grid Container',
              content: 'A grid container is defined by setting the display property to grid or inline-grid.',
            },
          ],
          codeExamples: [
            '.grid-container {\n  display: grid;\n  grid-template-columns: auto auto auto;\n  gap: 10px;\n}',
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
    git: {
      name: 'Git',
      icon: '📚',
      description: 'Version control system for tracking changes',
      topics: [
        {
          id: 'git_intro',
          name: 'Git Introduction',
          sections: [
            {
              heading: 'What is Git?',
              content: 'Git is a distributed version control system for tracking changes in source code during software development. It was created by Linus Torvalds in 2005.',
            },
            {
              heading: 'Why Git?',
              content: 'Git is used to track changes in files and coordinate work on those files among multiple people. It helps developers collaborate on projects efficiently.',
            },
          ],
          codeExamples: [
            'git init',
            'git clone https://github.com/user/repo.git',
          ],
        },
        {
          id: 'git_branch',
          name: 'Git Branch',
          sections: [
            {
              heading: 'Creating Branches',
              content: 'Branches allow you to develop features in isolation. The main branch is typically called "main" or "master".',
            },
            {
              heading: 'Switching Branches',
              content: 'Use git checkout to switch between branches. Use git checkout -b to create and switch in one command.',
            },
          ],
          codeExamples: [
            'git branch feature-branch',
            'git checkout feature-branch',
            'git checkout -b new-feature',
          ],
        },
        {
          id: 'git_remote',
          name: 'Git Remote',
          sections: [
            {
              heading: 'Remote Repositories',
              content: 'Remote repositories are versions of your project hosted on the internet or network. GitHub, GitLab, and Bitbucket are popular hosting services.',
            },
            {
              heading: 'Pushing to Remote',
              content: 'The git push command uploads your local branch commits to the remote repository.',
            },
          ],
          codeExamples: [
            'git remote add origin https://github.com/user/repo.git',
            'git push -u origin main',
            'git pull origin main',
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

    // Phase 2: Backend Basics
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
    bash: {
      name: 'Bash',
      icon: '💻',
      description: 'Unix shell and command language',
      topics: [
        {
          id: 'bash_intro',
          name: 'Bash Introduction',
          sections: [
            {
              heading: 'What is Bash?',
              content: 'Bash (Bourne Again SHell) is a Unix shell and command language. It is the default shell on most Linux distributions and macOS.',
            },
            {
              heading: 'Why Bash?',
              content: 'Bash is essential for DevOps work, allowing you to automate tasks, manage systems, and work with files and processes.',
            },
          ],
          codeExamples: [
            '#!/bin/bash\necho "Hello, World!"',
          ],
        },
        {
          id: 'bash_variables',
          name: 'Bash Variables',
          sections: [
            {
              heading: 'Variable Assignment',
              content: 'Variables are assigned without spaces around the equals sign. Access variables with a dollar sign prefix.',
            },
            {
              heading: 'Special Variables',
              content: '$0 - Script name, $1-$9 - Arguments, $# - Number of arguments, $@ - All arguments.',
            },
          ],
          codeExamples: [
            'NAME="John"\necho $NAME',
            'echo "Script name: $0"\necho "First argument: $1"',
          ],
        },
        {
          id: 'bash_script',
          name: 'Bash Scripting',
          sections: [
            {
              heading: 'Conditionals',
              content: 'Use if, then, else, elif, and fi for conditional execution.',
            },
            {
              heading: 'Loops',
              content: 'Bash supports for, while, and until loops for repetitive tasks.',
            },
          ],
          codeExamples: [
            'if [ $age -ge 18 ]; then\n  echo "Adult"\nelse\n  echo "Minor"\nfi',
            'for item in item1 item2 item3; do\n  echo $item\ndone',
          ],
        },
      ],
    },
    docker: {
      name: 'Docker',
      icon: '🐳',
      description: 'Platform for containerized applications',
      topics: [
        {
          id: 'docker_intro',
          name: 'Docker Introduction',
          sections: [
            {
              heading: 'What is Docker?',
              content: 'Docker is an open platform for developing, shipping, and running applications using containerization technology. Containers package up code and all its dependencies.',
            },
            {
              heading: 'Why Docker?',
              content: 'Docker allows developers to package applications into standardized units that run consistently across any environment.',
            },
          ],
          codeExamples: [
            'docker --version',
            'docker run hello-world',
          ],
        },
        {
          id: 'docker_images',
          name: 'Docker Images',
          sections: [
            {
              heading: 'What is a Docker Image?',
              content: 'A Docker image is a read-only template with instructions for creating a Docker container. Images are the building blocks of Docker.',
            },
            {
              heading: 'Working with Images',
              content: 'Use docker build to create images from Dockerfiles. Use docker pull to download images from registries.',
            },
          ],
          codeExamples: [
            'docker build -t myapp:latest .',
            'docker pull nginx:latest',
            'docker images',
          ],
        },
        {
          id: 'docker_containers',
          name: 'Docker Containers',
          sections: [
            {
              heading: 'What is a Container?',
              content: 'A container is a runnable instance of an image. Containers are isolated from each other and the host system.',
            },
            {
              heading: 'Managing Containers',
              content: 'Use docker run to create and start containers. Use docker ps to list running containers.',
            },
          ],
          codeExamples: [
            'docker run -d -p 8080:80 nginx',
            'docker ps',
            'docker stop container_id',
          ],
        },
        {
          id: 'docker_dockerfile',
          name: 'Docker Dockerfile',
          sections: [
            {
              heading: 'Dockerfile Syntax',
              content: 'A Dockerfile is a text document containing instructions to assemble a Docker image. Each instruction creates a layer in the image.',
            },
            {
              heading: 'Common Instructions',
              content: 'FROM sets base image. RUN executes commands. COPY copies files. CMD specifies the default command.',
            },
          ],
          codeExamples: [
            'FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nCMD ["npm", "start"]',
          ],
        },
      ],
    },

    // Phase 3: Frameworks & Databases
    react: {
      name: 'React',
      icon: '⚛️',
      description: 'JavaScript library for building user interfaces',
      topics: [
        {
          id: 'react_intro',
          name: 'React Introduction',
          sections: [
            {
              heading: 'What is React?',
              content: 'React is a JavaScript library for building user interfaces. React lets you compose complex UIs from small, isolated pieces of code called components.',
            },
            {
              heading: 'Why React?',
              content: 'React uses a virtual DOM to improve performance. It follows a component-based architecture and enables reusable UI components.',
            },
          ],
          codeExamples: [
            'npx create-react-app my-app',
            'cd my-app && npm start',
          ],
        },
        {
          id: 'react_components',
          name: 'React Components',
          sections: [
            {
              heading: 'Functional Components',
              content: 'Components are independent, reusable pieces of UI. Functional components are JavaScript functions that return JSX.',
            },
            {
              heading: 'Component Props',
              content: 'Props are inputs to components. They allow data to flow from parent to child components.',
            },
          ],
          codeExamples: [
            'function Welcome(props) {\n  return <h1>Hello, {props.name}</h1>;\n}',
            'function App() {\n  return <Welcome name="Sara" />;\n}',
          ],
        },
        {
          id: 'react_hooks',
          name: 'React Hooks',
          sections: [
            {
              heading: 'What are Hooks?',
              content: 'Hooks let you use state and other React features in functional components. useState and useEffect are the most common hooks.',
            },
            {
              heading: 'useState Hook',
              content: 'useState is a hook that lets you add state to functional components.',
            },
          ],
          codeExamples: [
            'import { useState } from "react";\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n}',
          ],
        },
      ],
    },
    nodejs: {
      name: 'Node.js',
      icon: '🟢',
      description: 'JavaScript runtime built on Chrome\'s V8 engine',
      topics: [
        {
          id: 'nodejs_intro',
          name: 'Node.js Introduction',
          sections: [
            {
              heading: 'What is Node.js?',
              content: 'Node.js is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code outside a web browser.',
            },
            {
              heading: 'Why Node.js?',
              content: 'Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient for data-intensive real-time applications.',
            },
          ],
          codeExamples: [
            'node --version',
            'node app.js',
          ],
        },
        {
          id: 'nodejs_modules',
          name: 'Node.js Modules',
          sections: [
            {
              heading: 'What is a Module?',
              content: 'A module is a JavaScript file that exports functions, objects, or primitive values. Node.js has a built-in module system.',
            },
            {
              heading: 'Using Modules',
              content: 'Use require() to import modules and module.exports or export default to export from modules.',
            },
          ],
          codeExamples: [
            'const fs = require("fs");',
            'module.exports = { myFunction };',
          ],
        },
        {
          id: 'nodejs_http',
          name: 'Node.js HTTP Module',
          sections: [
            {
              heading: 'Creating a Server',
              content: 'The http module can be used to create HTTP servers that listen for requests and send responses.',
            },
          ],
          codeExamples: [
            'const http = require("http");\n\nhttp.createServer((req, res) => {\n  res.writeHead(200, {"Content-Type": "text/html"});\n  res.end("Hello World!");\n}).listen(8080);',
          ],
        },
      ],
    },
    postgresql: {
      name: 'PostgreSQL',
      icon: '🐘',
      description: 'Advanced open-source relational database',
      topics: [
        {
          id: 'postgresql_intro',
          name: 'PostgreSQL Introduction',
          sections: [
            {
              heading: 'What is PostgreSQL?',
              content: 'PostgreSQL is a powerful, open-source object-relational database system. It is known for reliability, feature robustness, and performance.',
            },
          ],
          codeExamples: ['psql --version'],
        },
        {
          id: 'postgresql_create_table',
          name: 'PostgreSQL CREATE TABLE',
          sections: [
            {
              heading: 'Creating Tables',
              content: 'CREATE TABLE creates a new table in the database. You specify column names and their data types.',
            },
          ],
          codeExamples: [
            'CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(100),\n  email VARCHAR(100) UNIQUE\n);',
          ],
        },
      ],
    },
    mongodb: {
      name: 'MongoDB',
      icon: '🍃',
      description: 'NoSQL document-oriented database',
      topics: [
        {
          id: 'mongodb_intro',
          name: 'MongoDB Introduction',
          sections: [
            {
              heading: 'What is MongoDB?',
              content: 'MongoDB is a document-oriented NoSQL database that uses JSON-like documents with optional schemas.',
            },
          ],
          codeExamples: ['mongod --version'],
        },
        {
          id: 'mongodb_insert',
          name: 'MongoDB Insert',
          sections: [
            {
              heading: 'Inserting Documents',
              content: 'Use insertOne() to insert a single document or insertMany() to insert multiple documents.',
            },
          ],
          codeExamples: [
            'db.users.insertOne({\n  name: "John",\n  email: "john@example.com",\n  age: 30\n});',
          ],
        },
      ],
    },

    // Phase 4: Advanced & Cloud
    aws: {
      name: 'AWS',
      icon: '☁️',
      description: 'Amazon Web Services cloud platform',
      topics: [
        {
          id: 'aws_intro',
          name: 'AWS Introduction',
          sections: [
            {
              heading: 'What is AWS?',
              content: 'Amazon Web Services (AWS) is a comprehensive cloud computing platform offering infrastructure as a service, platform as a service, and software as a service.',
            },
          ],
          codeExamples: ['aws --version'],
        },
        {
          id: 'aws_ec2',
          name: 'AWS EC2',
          sections: [
            {
              heading: 'Elastic Compute Cloud',
              content: 'EC2 provides resizable compute capacity in the cloud. It allows you to launch virtual servers (instances) on demand.',
            },
          ],
          codeExamples: [
            'aws ec2 run-instances --image-id ami-0c55b159cbfafe1f0 --count 1 --instance-type t2.micro',
          ],
        },
        {
          id: 'aws_s3',
          name: 'AWS S3',
          sections: [
            {
              heading: 'Simple Storage Service',
              content: 'S3 is an object storage service offering industry-leading scalability, data availability, security, and performance.',
            },
          ],
          codeExamples: [
            'aws s3 mb s3://my-bucket',
            'aws s3 cp file.txt s3://my-bucket/',
          ],
        },
      ],
    },
    kubernetes: {
      name: 'Kubernetes',
      icon: '☸️',
      description: 'Container orchestration platform',
      topics: [
        {
          id: 'k8s_intro',
          name: 'Kubernetes Introduction',
          sections: [
            {
              heading: 'What is Kubernetes?',
              content: 'Kubernetes is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications.',
            },
          ],
          codeExamples: ['kubectl version'],
        },
        {
          id: 'k8s_pods',
          name: 'Kubernetes Pods',
          sections: [
            {
              heading: 'What is a Pod?',
              content: 'Pods are the smallest deployable units in Kubernetes. A Pod represents a single instance of a running process and can contain one or more containers.',
            },
          ],
          codeExamples: [
            'kubectl get pods',
            'kubectl apply -f pod.yaml',
          ],
        },
        {
          id: 'k8s_services',
          name: 'Kubernetes Services',
          sections: [
            {
              heading: 'What is a Service?',
              content: 'A Kubernetes Service is an abstract way to expose an application running on a set of Pods as a network service.',
            },
          ],
          codeExamples: [
            'kubectl expose pod my-pod --port=80 --name=my-service',
            'kubectl get services',
          ],
        },
      ],
    },
    terraform: {
      name: 'Terraform',
      icon: '🏗️',
      description: 'Infrastructure as Code tool',
      topics: [
        {
          id: 'tf_intro',
          name: 'Terraform Introduction',
          sections: [
            {
              heading: 'What is Terraform?',
              content: 'Terraform is an infrastructure as code tool that lets you define cloud and on-prem resources in human-readable configuration files.',
            },
          ],
          codeExamples: ['terraform --version'],
        },
        {
          id: 'tf_resources',
          name: 'Terraform Resources',
          sections: [
            {
              heading: 'Defining Resources',
              content: 'Resources are the most important element in Terraform. Each resource block describes infrastructure objects.',
            },
          ],
          codeExamples: [
            'resource "aws_instance" "web" {\n  ami           = "ami-0c55b159cbfafe1f0"\n  instance_type = "t2.micro"\n}',
          ],
        },
      ],
    },

    // Phase 5: Modern DevOps
    cicd: {
      name: 'CI/CD',
      icon: '🔄',
      description: 'Continuous Integration and Deployment',
      topics: [
        {
          id: 'cicd_intro',
          name: 'CI/CD Introduction',
          sections: [
            {
              heading: 'What is CI/CD?',
              content: 'CI/CD stands for Continuous Integration and Continuous Deployment (or Delivery). It automates the process of integrating code changes and deploying them.',
            },
          ],
          codeExamples: [],
        },
        {
          id: 'cicd_pipeline',
          name: 'CI/CD Pipeline',
          sections: [
            {
              heading: 'Pipeline Stages',
              content: 'A typical CI/CD pipeline includes: source, build, test, deploy. Each stage runs specific tasks to validate and deliver code.',
            },
          ],
          codeExamples: [
            'stages:\n  - build\n  - test\n  - deploy',
          ],
        },
        {
          id: 'cicd_github_actions',
          name: 'GitHub Actions',
          sections: [
            {
              heading: 'What is GitHub Actions?',
              content: 'GitHub Actions is a CI/CD platform that automates build, test, and deployment workflows directly from GitHub.',
            },
          ],
          codeExamples: [
            'name: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm ci\n      - run: npm test',
          ],
        },
      ],
    },
    prometheus: {
      name: 'Prometheus',
      icon: '📊',
      description: 'Systems monitoring and alerting toolkit',
      topics: [
        {
          id: 'prom_intro',
          name: 'Prometheus Introduction',
          sections: [
            {
              heading: 'What is Prometheus?',
              content: 'Prometheus is an open-source systems monitoring and alerting toolkit. It collects and stores metrics as time series data.',
            },
          ],
          codeExamples: ['prometheus --version'],
        },
        {
          id: 'prom_metrics',
          name: 'Prometheus Metrics',
          sections: [
            {
              heading: 'Metric Types',
              content: 'Prometheus uses four main metric types: Counter (increases), Gauge (up/down), Histogram (distributions), Summary (quantile distributions).',
            },
          ],
          codeExamples: [
            'http_requests_total{method="GET", status="200"} 12345',
          ],
        },
      ],
    },
    security: {
      name: 'DevOps Security',
      icon: '🔒',
      description: 'Security best practices for DevOps',
      topics: [
        {
          id: 'sec_intro',
          name: 'DevOps Security Introduction',
          sections: [
            {
              heading: 'What is DevOps Security?',
              content: 'DevOps security (DevSecOps) integrates security practices into the DevOps workflow, ensuring security is a shared responsibility.',
            },
          ],
          codeExamples: [],
        },
        {
          id: 'sec_best_practices',
          name: 'Security Best Practices',
          sections: [
            {
              heading: 'Key Principles',
              content: 'Follow the principle of least privilege, implement defense in depth, automate security scanning, and regularly update dependencies.',
            },
          ],
          codeExamples: [],
        },
        {
          id: 'sec_secrets',
          name: 'Managing Secrets',
          sections: [
            {
              heading: 'Secret Management',
              content: 'Never hardcode secrets in code. Use tools like HashiCorp Vault, AWS Secrets Manager, or Kubernetes Secrets for secure storage.',
            },
          ],
          codeExamples: [
            'kubectl create secret generic db-pass --from-literal=password=secret123',
          ],
        },
      ],
    },
  },
}
