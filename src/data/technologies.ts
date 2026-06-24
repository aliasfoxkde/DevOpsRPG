// Simplified technologies data for ViteJS app

export interface Topic {
  id: string
  name: string
  slug: string
  url: string
  order: number
}

export interface Technology {
  id: string
  name: string
  slug: string
  category: string
  phase: number
  description: string
  icon: string
  color: string
  xpPerTopic: number
  estimatedHours: number
  prerequisites: string[]
  topics: Topic[]
}

type CategoryKey = 'Foundations' | 'Backend Basics' | 'Frameworks & Databases' | 'Advanced & Cloud' | 'Modern DevOps'

interface CategoryInfo {
  name: CategoryKey
  phase: number
  icon: string
  color: string
}

export const categories: Record<string, CategoryInfo> = {
  foundations: { name: 'Foundations', phase: 1, icon: '🏗️', color: '#6366f1' },
  'backend-basics': { name: 'Backend Basics', phase: 2, icon: '⚙️', color: '#0891b2' },
  'frameworks-databases': { name: 'Frameworks & Databases', phase: 3, icon: '🗄️', color: '#22c55e' },
  'advanced-cloud': { name: 'Advanced & Cloud', phase: 4, icon: '☁️', color: '#f59e0b' },
  'modern-devops': { name: 'Modern DevOps', phase: 5, icon: '🚀', color: '#ef4444' },
}

export const technologies: Record<string, Omit<Technology, 'category'>> = {
  // Phase 1: Foundations
  html: {
    id: 'html',
    name: 'HTML',
    slug: 'html',
    phase: 1,
    description: 'The standard markup language for Web pages',
    icon: '📄',
    color: '#e34c26',
    xpPerTopic: 75,
    estimatedHours: 8,
    prerequisites: [],
    topics: [
      { id: 'html_intro', name: 'HTML Introduction', slug: 'html-intro', url: 'https://www.w3schools.com/html/html_intro.asp', order: 1 },
      { id: 'html_editors', name: 'HTML Editors', slug: 'html-editors', url: 'https://www.w3schools.com/html/html_editors.asp', order: 2 },
      { id: 'html_basic', name: 'HTML Basic', slug: 'html-basic', url: 'https://www.w3schools.com/html/html_basic.asp', order: 3 },
      { id: 'html_elements', name: 'HTML Elements', slug: 'html-elements', url: 'https://www.w3schools.com/html/html_elements.asp', order: 4 },
      { id: 'html_attributes', name: 'HTML Attributes', slug: 'html-attributes', url: 'https://www.w3schools.com/html/html_attributes.asp', order: 5 },
      { id: 'html_headings', name: 'HTML Headings', slug: 'html-headings', url: 'https://www.w3schools.com/html/html_headings.asp', order: 6 },
      { id: 'html_paragraphs', name: 'HTML Paragraphs', slug: 'html-paragraphs', url: 'https://www.w3schools.com/html/html_paragraphs.asp', order: 7 },
      { id: 'html_styles', name: 'HTML Styles', slug: 'html-styles', url: 'https://www.w3schools.com/html/html_styles.asp', order: 8 },
      { id: 'html_formatting', name: 'HTML Formatting', slug: 'html-formatting', url: 'https://www.w3schools.com/html/html_formatting.asp', order: 9 },
      { id: 'html_links', name: 'HTML Links', slug: 'html-links', url: 'https://www.w3schools.com/html/html_links.asp', order: 10 },
      { id: 'html_images', name: 'HTML Images', slug: 'html-images', url: 'https://www.w3schools.com/html/html_images.asp', order: 11 },
      { id: 'html_lists', name: 'HTML Lists', slug: 'html-lists', url: 'https://www.w3schools.com/html/html_lists.asp', order: 12 },
      { id: 'html_classes', name: 'HTML Classes', slug: 'html-classes', url: 'https://www.w3schools.com/html/html_classes.asp', order: 13 },
      { id: 'html_id', name: 'HTML id Attribute', slug: 'html-id', url: 'https://www.w3schools.com/html/html_id.asp', order: 14 },
      { id: 'html_forms', name: 'HTML Forms', slug: 'html-forms', url: 'https://www.w3schools.com/html/html_forms.asp', order: 15 },
    ],
  },
  css: {
    id: 'css',
    name: 'CSS',
    slug: 'css',
    phase: 1,
    description: 'Style sheets for describing the presentation of HTML',
    icon: '🎨',
    color: '#264de4',
    xpPerTopic: 75,
    estimatedHours: 10,
    prerequisites: ['html'],
    topics: [
      { id: 'css_intro', name: 'CSS Introduction', slug: 'css-intro', url: 'https://www.w3schools.com/css/css_intro.asp', order: 1 },
      { id: 'css_syntax', name: 'CSS Syntax', slug: 'css-syntax', url: 'https://www.w3schools.com/css/css_syntax.asp', order: 2 },
      { id: 'css_selectors', name: 'CSS Selectors', slug: 'css-selectors', url: 'https://www.w3schools.com/css/css_selectors.asp', order: 3 },
      { id: 'css_colors', name: 'CSS Colors', slug: 'css-colors', url: 'https://www.w3schools.com/css/css_colors.asp', order: 4 },
      { id: 'css_backgrounds', name: 'CSS Backgrounds', slug: 'css-backgrounds', url: 'https://www.w3schools.com/css/css_background.asp', order: 5 },
      { id: 'css_box_model', name: 'CSS Box Model', slug: 'css-box-model', url: 'https://www.w3schools.com/css/css_boxmodel.asp', order: 6 },
      { id: 'css_padding', name: 'CSS Padding', slug: 'css-padding', url: 'https://www.w3schools.com/css/css_padding.asp', order: 7 },
      { id: 'css_margin', name: 'CSS Margin', slug: 'css-margin', url: 'https://www.w3schools.com/css/css_margin.asp', order: 8 },
      { id: 'css_width_height', name: 'CSS Width/Height', slug: 'css-width-height', url: 'https://www.w3schools.com/css/css_dimensions.asp', order: 9 },
      { id: 'css_flexbox', name: 'CSS Flexbox', slug: 'css-flexbox', url: 'https://www.w3schools.com/css/css3_flexbox.asp', order: 10 },
      { id: 'css_grid', name: 'CSS Grid', slug: 'css-grid', url: 'https://www.w3schools.com/css/css_grid.asp', order: 11 },
    ],
  },
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    slug: 'javascript',
    phase: 1,
    description: 'The programming language of the Web',
    icon: '⚡',
    color: '#f7df1e',
    xpPerTopic: 100,
    estimatedHours: 20,
    prerequisites: ['html', 'css'],
    topics: [
      { id: 'js_intro', name: 'JavaScript Introduction', slug: 'js-intro', url: 'https://www.w3schools.com/js/js_intro.asp', order: 1 },
      { id: 'js_where_to', name: 'Where to Put JavaScript', slug: 'js-where-to', url: 'https://www.w3schools.com/js/js_whereto.asp', order: 2 },
      { id: 'js_output', name: 'JavaScript Output', slug: 'js-output', url: 'https://www.w3schools.com/js/js_output.asp', order: 3 },
      { id: 'js_syntax', name: 'JavaScript Syntax', slug: 'js-syntax', url: 'https://www.w3schools.com/js/js_syntax.asp', order: 4 },
      { id: 'js_variables', name: 'JavaScript Variables', slug: 'js-variables', url: 'https://www.w3schools.com/js/js_variables.asp', order: 5 },
      { id: 'js_operators', name: 'JavaScript Operators', slug: 'js-operators', url: 'https://www.w3schools.com/js/js_operators.asp', order: 6 },
      { id: 'js_data_types', name: 'JavaScript Data Types', slug: 'js-data-types', url: 'https://www.w3schools.com/js/js_datatypes.asp', order: 7 },
      { id: 'js_functions', name: 'JavaScript Functions', slug: 'js-functions', url: 'https://www.w3schools.com/js/js_functions.asp', order: 8 },
      { id: 'js_objects', name: 'JavaScript Objects', slug: 'js-objects', url: 'https://www.w3schools.com/js/js_objects.asp', order: 9 },
      { id: 'js_arrays', name: 'JavaScript Arrays', slug: 'js-arrays', url: 'https://www.w3schools.com/js/js_arrays.asp', order: 10 },
      { id: 'js_conditions', name: 'JavaScript Conditions', slug: 'js-conditions', url: 'https://www.w3schools.com/js/js_if_else.asp', order: 11 },
      { id: 'js_loops', name: 'JavaScript Loops', slug: 'js-loops', url: 'https://www.w3schools.com/js/js_loop_for.asp', order: 12 },
    ],
  },
  git: {
    id: 'git',
    name: 'Git',
    slug: 'git',
    phase: 1,
    description: 'Version control system for tracking changes',
    icon: '📚',
    color: '#f05032',
    xpPerTopic: 75,
    estimatedHours: 6,
    prerequisites: [],
    topics: [
      { id: 'git_intro', name: 'Git Introduction', slug: 'git-intro', url: 'https://www.w3schools.com/git/git_intro.asp', order: 1 },
      { id: 'git_getstarted', name: 'Git Get Started', slug: 'git-getstarted', url: 'https://www.w3schools.com/git/git_getstarted.asp', order: 2 },
      { id: 'git_branch', name: 'Git Branch', slug: 'git-branch', url: 'https://www.w3schools.com/git/git_branch.asp', order: 3 },
      { id: 'git_remote', name: 'Git Remote', slug: 'git-remote', url: 'https://www.w3schools.com/git/git_remote.asp', order: 4 },
    ],
  },
  sql: {
    id: 'sql',
    name: 'SQL',
    slug: 'sql',
    phase: 1,
    description: 'Standard language for data manipulation',
    icon: '🗄️',
    color: '#336791',
    xpPerTopic: 75,
    estimatedHours: 10,
    prerequisites: ['javascript'],
    topics: [
      { id: 'sql_intro', name: 'SQL Introduction', slug: 'sql-intro', url: 'https://www.w3schools.com/sql/sql_intro.asp', order: 1 },
      { id: 'sql_syntax', name: 'SQL Syntax', slug: 'sql-syntax', url: 'https://www.w3schools.com/sql/sql_syntax.asp', order: 2 },
      { id: 'sql_select', name: 'SQL SELECT', slug: 'sql-select', url: 'https://www.w3schools.com/sql/sql_select.asp', order: 3 },
      { id: 'sql_where', name: 'SQL WHERE', slug: 'sql-where', url: 'https://www.w3schools.com/sql/sql_where.asp', order: 4 },
      { id: 'sql_orderby', name: 'SQL ORDER BY', slug: 'sql-orderby', url: 'https://www.w3schools.com/sql/sql_orderby.asp', order: 5 },
      { id: 'sql_insert', name: 'SQL INSERT INTO', slug: 'sql-insert', url: 'https://www.w3schools.com/sql/sql_insert.asp', order: 6 },
      { id: 'sql_update', name: 'SQL UPDATE', slug: 'sql-update', url: 'https://www.w3schools.com/sql/sql_update.asp', order: 7 },
      { id: 'sql_delete', name: 'SQL DELETE', slug: 'sql-delete', url: 'https://www.w3schools.com/sql/sql_delete.asp', order: 8 },
    ],
  },

  // Phase 2: Backend Basics
  python: {
    id: 'python',
    name: 'Python',
    slug: 'python',
    phase: 2,
    description: 'A powerful, easy-to-learn programming language',
    icon: '🐍',
    color: '#3776ab',
    xpPerTopic: 100,
    estimatedHours: 25,
    prerequisites: [],
    topics: [
      { id: 'py_intro', name: 'Python Introduction', slug: 'py-intro', url: 'https://www.w3schools.com/python/python_intro.asp', order: 1 },
      { id: 'py_getstarted', name: 'Python Get Started', slug: 'py-getstarted', url: 'https://www.w3schools.com/python/python_getstarted.asp', order: 2 },
      { id: 'py_syntax', name: 'Python Syntax', slug: 'py-syntax', url: 'https://www.w3schools.com/python/python_syntax.asp', order: 3 },
      { id: 'py_variables', name: 'Python Variables', slug: 'py-variables', url: 'https://www.w3schools.com/python/python_variables.asp', order: 4 },
      { id: 'py_data_types', name: 'Python Data Types', slug: 'py-data-types', url: 'https://www.w3schools.com/python/python_datatypes.asp', order: 5 },
      { id: 'py_strings', name: 'Python Strings', slug: 'py-strings', url: 'https://www.w3schools.com/python/python_strings.asp', order: 6 },
      { id: 'py_booleans', name: 'Python Booleans', slug: 'py-booleans', url: 'https://www.w3schools.com/python/python_booleans.asp', order: 7 },
      { id: 'py_lists', name: 'Python Lists', slug: 'py-lists', url: 'https://www.w3schools.com/python/python_lists.asp', order: 8 },
      { id: 'py_dictionaries', name: 'Python Dictionaries', slug: 'py-dictionaries', url: 'https://www.w3schools.com/python/python_dictionaries.asp', order: 9 },
      { id: 'py_functions', name: 'Python Functions', slug: 'py-functions', url: 'https://www.w3schools.com/python/python_functions.asp', order: 10 },
    ],
  },
  bash: {
    id: 'bash',
    name: 'Bash',
    slug: 'bash',
    phase: 2,
    description: 'Unix shell and command language',
    icon: '💻',
    color: '#4eaa25',
    xpPerTopic: 100,
    estimatedHours: 12,
    prerequisites: ['git'],
    topics: [
      { id: 'bash_intro', name: 'Bash Introduction', slug: 'bash-intro', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 1 },
      { id: 'bash_getstarted', name: 'Bash Get Started', slug: 'bash-getstarted', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 2 },
      { id: 'bash_script', name: 'Bash Scripting', slug: 'bash-script', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 3 },
      { id: 'bash_variables', name: 'Bash Variables', slug: 'bash-variables', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 4 },
    ],
  },
  docker: {
    id: 'docker',
    name: 'Docker',
    slug: 'docker',
    phase: 2,
    description: 'Platform for containerized applications',
    icon: '🐳',
    color: '#2496ed',
    xpPerTopic: 125,
    estimatedHours: 15,
    prerequisites: ['bash'],
    topics: [
      { id: 'docker_intro', name: 'Docker Introduction', slug: 'docker-intro', url: 'https://www.w3schools.com/docker/docker_intro.asp', order: 1 },
      { id: 'docker_getstarted', name: 'Docker Get Started', slug: 'docker-getstarted', url: 'https://www.w3schools.com/docker/docker_getstarted.asp', order: 2 },
      { id: 'docker_images', name: 'Docker Images', slug: 'docker-images', url: 'https://www.w3schools.com/docker/docker_images.asp', order: 3 },
      { id: 'docker_containers', name: 'Docker Containers', slug: 'docker-containers', url: 'https://www.w3schools.com/docker/docker_containers.asp', order: 4 },
      { id: 'docker_dockerfile', name: 'Docker Dockerfile', slug: 'docker-dockerfile', url: 'https://www.w3schools.com/docker/docker_dockerfile.asp', order: 5 },
    ],
  },

  // Phase 3: Frameworks & Databases
  react: {
    id: 'react',
    name: 'React',
    slug: 'react',
    phase: 3,
    description: 'JavaScript library for building user interfaces',
    icon: '⚛️',
    color: '#61dafb',
    xpPerTopic: 125,
    estimatedHours: 20,
    prerequisites: ['javascript'],
    topics: [
      { id: 'react_intro', name: 'React Introduction', slug: 'react-intro', url: 'https://www.w3schools.com/react/react_intro.asp', order: 1 },
      { id: 'react_getstarted', name: 'React Get Started', slug: 'react-getstarted', url: 'https://www.w3schools.com/react/react_getstarted.asp', order: 2 },
      { id: 'react_render', name: 'React Render', slug: 'react-render', url: 'https://www.w3schools.com/react/react_render.asp', order: 3 },
      { id: 'react_jsx', name: 'React JSX', slug: 'react-jsx', url: 'https://www.w3schools.com/react/react_jsx.asp', order: 4 },
      { id: 'react_components', name: 'React Components', slug: 'react-components', url: 'https://www.w3schools.com/react/react_components.asp', order: 5 },
      { id: 'react_props', name: 'React Props', slug: 'react-props', url: 'https://www.w3schools.com/react/react_props.asp', order: 6 },
      { id: 'react_events', name: 'React Events', slug: 'react-events', url: 'https://www.w3schools.com/react/react_events.asp', order: 7 },
      { id: 'react_hooks', name: 'React Hooks', slug: 'react-hooks', url: 'https://www.w3schools.com/react/react_hooks.asp', order: 8 },
    ],
  },
  nodejs: {
    id: 'nodejs',
    name: 'Node.js',
    slug: 'nodejs',
    phase: 3,
    description: 'JavaScript runtime built on Chrome\'s V8 engine',
    icon: '🟢',
    color: '#339933',
    xpPerTopic: 125,
    estimatedHours: 18,
    prerequisites: ['javascript'],
    topics: [
      { id: 'nodejs_intro', name: 'Node.js Introduction', slug: 'nodejs-intro', url: 'https://www.w3schools.com/nodejs/nodejs_intro.asp', order: 1 },
      { id: 'nodejs_getstarted', name: 'Node.js Get Started', slug: 'nodejs-getstarted', url: 'https://www.w3schools.com/nodejs/nodejs_getstarted.asp', order: 2 },
      { id: 'nodejs_modules', name: 'Node.js Modules', slug: 'nodejs-modules', url: 'https://www.w3schools.com/nodejs/nodejs_modules.asp', order: 3 },
      { id: 'nodejs_http', name: 'Node.js HTTP Module', slug: 'nodejs-http', url: 'https://www.w3schools.com/nodejs/nodejs_http.asp', order: 4 },
      { id: 'nodejs_filesystem', name: 'Node.js File System', slug: 'nodejs-filesystem', url: 'https://www.w3schools.com/nodejs/nodejs_filesystem.asp', order: 5 },
    ],
  },
  postgresql: {
    id: 'postgresql',
    name: 'PostgreSQL',
    slug: 'postgresql',
    phase: 3,
    description: 'Advanced open-source relational database',
    icon: '🐘',
    color: '#336791',
    xpPerTopic: 100,
    estimatedHours: 15,
    prerequisites: ['sql'],
    topics: [
      { id: 'postgresql_intro', name: 'PostgreSQL Introduction', slug: 'postgresql-intro', url: 'https://www.w3schools.com/postgresql/postgresql_intro.asp', order: 1 },
      { id: 'postgresql_getstarted', name: 'PostgreSQL Get Started', slug: 'postgresql-getstarted', url: 'https://www.w3schools.com/postgresql/postgresql_getstarted.asp', order: 2 },
      { id: 'postgresql_create_table', name: 'PostgreSQL CREATE TABLE', slug: 'postgresql-create-table', url: 'https://www.w3schools.com/postgresql/postgresql_create_table.asp', order: 3 },
      { id: 'postgresql_insert', name: 'PostgreSQL INSERT INTO', slug: 'postgresql-insert', url: 'https://www.w3schools.com/postgresql/postgresql_insert.asp', order: 4 },
      { id: 'postgresql_select', name: 'PostgreSQL SELECT', slug: 'postgresql-select', url: 'https://www.w3schools.com/postgresql/postgresql_select.asp', order: 5 },
    ],
  },
  mongodb: {
    id: 'mongodb',
    name: 'MongoDB',
    slug: 'mongodb',
    phase: 3,
    description: 'NoSQL document-oriented database',
    icon: '🍃',
    color: '#47a248',
    xpPerTopic: 100,
    estimatedHours: 12,
    prerequisites: ['javascript', 'nodejs'],
    topics: [
      { id: 'mongodb_intro', name: 'MongoDB Introduction', slug: 'mongodb-intro', url: 'https://www.w3schools.com/mongodb/mongodb_intro.asp', order: 1 },
      { id: 'mongodb_getstarted', name: 'MongoDB Get Started', slug: 'mongodb-getstarted', url: 'https://www.w3schools.com/mongodb/mongodb_getstarted.asp', order: 2 },
      { id: 'mongodb_create_database', name: 'MongoDB Create Database', slug: 'mongodb-create-database', url: 'https://www.w3schools.com/mongodb/mongodb_create_database.asp', order: 3 },
      { id: 'mongodb_create_collection', name: 'MongoDB Create Collection', slug: 'mongodb-create-collection', url: 'https://www.w3schools.com/mongodb/mongodb_create_collection.asp', order: 4 },
      { id: 'mongodb_insert', name: 'MongoDB Insert', slug: 'mongodb-insert', url: 'https://www.w3schools.com/mongodb/mongodb_insert.asp', order: 5 },
    ],
  },

  // Phase 4: Advanced & Cloud
  aws: {
    id: 'aws',
    name: 'AWS',
    slug: 'aws',
    phase: 4,
    description: 'Amazon Web Services cloud platform',
    icon: '☁️',
    color: '#ff9900',
    xpPerTopic: 150,
    estimatedHours: 30,
    prerequisites: ['docker', 'postgresql'],
    topics: [
      { id: 'aws_intro', name: 'AWS Introduction', slug: 'aws-intro', url: 'https://www.w3schools.com/aws/aws_intro.asp', order: 1 },
      { id: 'aws_getstarted', name: 'AWS Get Started', slug: 'aws-getstarted', url: 'https://www.w3schools.com/aws/aws_getstarted.asp', order: 2 },
      { id: 'aws-ec2', name: 'AWS EC2', slug: 'aws-ec2', url: 'https://www.w3schools.com/aws/aws_ec2.asp', order: 3 },
      { id: 'aws-s3', name: 'AWS S3', slug: 'aws-s3', url: 'https://www.w3schools.com/aws/aws_s3.asp', order: 4 },
      { id: 'aws_rds', name: 'AWS RDS', slug: 'aws-rds', url: 'https://www.w3schools.com/aws/aws_rds.asp', order: 5 },
    ],
  },
  kubernetes: {
    id: 'kubernetes',
    name: 'Kubernetes',
    slug: 'kubernetes',
    phase: 4,
    description: 'Container orchestration platform',
    icon: '☸️',
    color: '#326ce5',
    xpPerTopic: 150,
    estimatedHours: 25,
    prerequisites: ['docker'],
    topics: [
      { id: 'k8s-intro', name: 'Kubernetes Introduction', slug: 'k8s-intro', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 1 },
      { id: 'k8s-getstarted', name: 'Kubernetes Get Started', slug: 'k8s-getstarted', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 2 },
      { id: 'k8s-architecture', name: 'Kubernetes Architecture', slug: 'k8s-architecture', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 3 },
      { id: 'k8s-pods', name: 'Kubernetes Pods', slug: 'k8s-pods', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 4 },
      { id: 'k8s-services', name: 'Kubernetes Services', slug: 'k8s-services', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 5 },
    ],
  },
  terraform: {
    id: 'terraform',
    name: 'Terraform',
    slug: 'terraform',
    phase: 4,
    description: 'Infrastructure as Code tool',
    icon: '🏗️',
    color: '#7b42bc',
    xpPerTopic: 150,
    estimatedHours: 20,
    prerequisites: ['aws', 'bash'],
    topics: [
      { id: 'tf_intro', name: 'Terraform Introduction', slug: 'tf-intro', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 1 },
      { id: 'tf_getstarted', name: 'Terraform Get Started', slug: 'tf-getstarted', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 2 },
      { id: 'tf_resources', name: 'Terraform Resources', slug: 'tf-resources', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 3 },
      { id: 'tf_variables', name: 'Terraform Variables', slug: 'tf-variables', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 4 },
    ],
  },

  // Phase 5: Modern DevOps
  cicd: {
    id: 'cicd',
    name: 'CI/CD',
    slug: 'cicd',
    phase: 5,
    description: 'Continuous Integration and Deployment',
    icon: '🔄',
    color: '#22c55e',
    xpPerTopic: 125,
    estimatedHours: 15,
    prerequisites: ['git', 'docker', 'aws'],
    topics: [
      { id: 'cicd_intro', name: 'CI/CD Introduction', slug: 'cicd-intro', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 1 },
      { id: 'cicd_pipeline', name: 'CI/CD Pipeline', slug: 'cicd-pipeline', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 2 },
      { id: 'cicd_github_actions', name: 'GitHub Actions', slug: 'cicd-github-actions', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 3 },
      { id: 'cicd_jenkins', name: 'Jenkins', slug: 'cicd-jenkins', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 4 },
    ],
  },
  prometheus: {
    id: 'prometheus',
    name: 'Prometheus',
    slug: 'prometheus',
    phase: 5,
    description: 'Systems monitoring and alerting toolkit',
    icon: '📊',
    color: '#e6522c',
    xpPerTopic: 125,
    estimatedHours: 12,
    prerequisites: ['kubernetes', 'aws'],
    topics: [
      { id: 'prom_intro', name: 'Prometheus Introduction', slug: 'prom-intro', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 1 },
      { id: 'prom_getstarted', name: 'Prometheus Get Started', slug: 'prom-getstarted', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 2 },
      { id: 'prom_metrics', name: 'Prometheus Metrics', slug: 'prom-metrics', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 3 },
      { id: 'prom_alerts', name: 'Prometheus Alerts', slug: 'prom-alerts', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 4 },
    ],
  },
  security: {
    id: 'security',
    name: 'DevOps Security',
    slug: 'security',
    phase: 5,
    description: 'Security best practices for DevOps',
    icon: '🔒',
    color: '#ef4444',
    xpPerTopic: 150,
    estimatedHours: 20,
    prerequisites: ['docker', 'kubernetes', 'cicd'],
    topics: [
      { id: 'sec_intro', name: 'DevOps Security Introduction', slug: 'sec-intro', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 1 },
      { id: 'sec_best_practices', name: 'Security Best Practices', slug: 'sec-best-practices', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 2 },
      { id: 'sec_secrets', name: 'Managing Secrets', slug: 'sec-secrets', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 3 },
      { id: 'sec_scanning', name: 'Security Scanning', slug: 'sec-scanning', url: 'https://www.w3schools.com/quiztest/quiztest.asp', order: 4 },
    ],
  },
}
