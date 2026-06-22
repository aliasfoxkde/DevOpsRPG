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
      { id: 'html-intro', name: 'HTML Introduction', slug: 'html-intro', url: 'https://www.w3schools.com/html/html_intro.asp', order: 1 },
      { id: 'html-editors', name: 'HTML Editors', slug: 'html-editors', url: 'https://www.w3schools.com/html/html_editors.asp', order: 2 },
      { id: 'html-basic', name: 'HTML Basic', slug: 'html-basic', url: 'https://www.w3schools.com/html/html_basic.asp', order: 3 },
      { id: 'html-elements', name: 'HTML Elements', slug: 'html-elements', url: 'https://www.w3schools.com/html/html_elements.asp', order: 4 },
      { id: 'html-attributes', name: 'HTML Attributes', slug: 'html-attributes', url: 'https://www.w3schools.com/html/html_attributes.asp', order: 5 },
      { id: 'html-headings', name: 'HTML Headings', slug: 'html-headings', url: 'https://www.w3schools.com/html/html_headings.asp', order: 6 },
      { id: 'html-paragraphs', name: 'HTML Paragraphs', slug: 'html-paragraphs', url: 'https://www.w3schools.com/html/html_paragraphs.asp', order: 7 },
      { id: 'html-styles', name: 'HTML Styles', slug: 'html-styles', url: 'https://www.w3schools.com/html/html_styles.asp', order: 8 },
      { id: 'html-formatting', name: 'HTML Formatting', slug: 'html-formatting', url: 'https://www.w3schools.com/html/html_formatting.asp', order: 9 },
      { id: 'html-links', name: 'HTML Links', slug: 'html-links', url: 'https://www.w3schools.com/html/html_links.asp', order: 10 },
      { id: 'html-images', name: 'HTML Images', slug: 'html-images', url: 'https://www.w3schools.com/html/html_images.asp', order: 11 },
      { id: 'html-lists', name: 'HTML Lists', slug: 'html-lists', url: 'https://www.w3schools.com/html/html_lists.asp', order: 12 },
      { id: 'html-classes', name: 'HTML Classes', slug: 'html-classes', url: 'https://www.w3schools.com/html/html_classes.asp', order: 13 },
      { id: 'html-id', name: 'HTML id Attribute', slug: 'html-id', url: 'https://www.w3schools.com/html/html_id.asp', order: 14 },
      { id: 'html-forms', name: 'HTML Forms', slug: 'html-forms', url: 'https://www.w3schools.com/html/html_forms.asp', order: 15 },
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
      { id: 'css-intro', name: 'CSS Introduction', slug: 'css-intro', url: 'https://www.w3schools.com/css/css_intro.asp', order: 1 },
      { id: 'css-syntax', name: 'CSS Syntax', slug: 'css-syntax', url: 'https://www.w3schools.com/css/css_syntax.asp', order: 2 },
      { id: 'css-selectors', name: 'CSS Selectors', slug: 'css-selectors', url: 'https://www.w3schools.com/css/css_selectors.asp', order: 3 },
      { id: 'css-colors', name: 'CSS Colors', slug: 'css-colors', url: 'https://www.w3schools.com/css/css_colors.asp', order: 4 },
      { id: 'css-backgrounds', name: 'CSS Backgrounds', slug: 'css-backgrounds', url: 'https://www.w3schools.com/css/css_background.asp', order: 5 },
      { id: 'css-box-model', name: 'CSS Box Model', slug: 'css-box-model', url: 'https://www.w3schools.com/css/css_boxmodel.asp', order: 6 },
      { id: 'css-padding', name: 'CSS Padding', slug: 'css-padding', url: 'https://www.w3schools.com/css/css_padding.asp', order: 7 },
      { id: 'css-margin', name: 'CSS Margin', slug: 'css-margin', url: 'https://www.w3schools.com/css/css_margin.asp', order: 8 },
      { id: 'css-width-height', name: 'CSS Width/Height', slug: 'css-width-height', url: 'https://www.w3schools.com/css/css_dimensions.asp', order: 9 },
      { id: 'css-flexbox', name: 'CSS Flexbox', slug: 'css-flexbox', url: 'https://www.w3schools.com/css/css3_flexbox.asp', order: 10 },
      { id: 'css-grid', name: 'CSS Grid', slug: 'css-grid', url: 'https://www.w3schools.com/css/css_grid.asp', order: 11 },
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
      { id: 'js-intro', name: 'JavaScript Introduction', slug: 'js-intro', url: 'https://www.w3schools.com/js/js_intro.asp', order: 1 },
      { id: 'js-where-to', name: 'Where to Put JavaScript', slug: 'js-where-to', url: 'https://www.w3schools.com/js/js_whereto.asp', order: 2 },
      { id: 'js-output', name: 'JavaScript Output', slug: 'js-output', url: 'https://www.w3schools.com/js/js_output.asp', order: 3 },
      { id: 'js-syntax', name: 'JavaScript Syntax', slug: 'js-syntax', url: 'https://www.w3schools.com/js/js_syntax.asp', order: 4 },
      { id: 'js-variables', name: 'JavaScript Variables', slug: 'js-variables', url: 'https://www.w3schools.com/js/js_variables.asp', order: 5 },
      { id: 'js-operators', name: 'JavaScript Operators', slug: 'js-operators', url: 'https://www.w3schools.com/js/js_operators.asp', order: 6 },
      { id: 'js-data-types', name: 'JavaScript Data Types', slug: 'js-data-types', url: 'https://www.w3schools.com/js/js_datatypes.asp', order: 7 },
      { id: 'js-functions', name: 'JavaScript Functions', slug: 'js-functions', url: 'https://www.w3schools.com/js/js_functions.asp', order: 8 },
      { id: 'js-objects', name: 'JavaScript Objects', slug: 'js-objects', url: 'https://www.w3schools.com/js/js_objects.asp', order: 9 },
      { id: 'js-arrays', name: 'JavaScript Arrays', slug: 'js-arrays', url: 'https://www.w3schools.com/js/js_arrays.asp', order: 10 },
      { id: 'js-conditions', name: 'JavaScript Conditions', slug: 'js-conditions', url: 'https://www.w3schools.com/js/js_if_else.asp', order: 11 },
      { id: 'js-loops', name: 'JavaScript Loops', slug: 'js-loops', url: 'https://www.w3schools.com/js/js_loop_for.asp', order: 12 },
    ],
  },
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
      { id: 'py-intro', name: 'Python Introduction', slug: 'py-intro', url: 'https://www.w3schools.com/python/python_intro.asp', order: 1 },
      { id: 'py-getstarted', name: 'Python Get Started', slug: 'py-getstarted', url: 'https://www.w3schools.com/python/python_getstarted.asp', order: 2 },
      { id: 'py-syntax', name: 'Python Syntax', slug: 'py-syntax', url: 'https://www.w3schools.com/python/python_syntax.asp', order: 3 },
      { id: 'py-variables', name: 'Python Variables', slug: 'py-variables', url: 'https://www.w3schools.com/python/python_variables.asp', order: 4 },
      { id: 'py-data-types', name: 'Python Data Types', slug: 'py-data-types', url: 'https://www.w3schools.com/python/python_datatypes.asp', order: 5 },
      { id: 'py-strings', name: 'Python Strings', slug: 'py-strings', url: 'https://www.w3schools.com/python/python_strings.asp', order: 6 },
      { id: 'py-booleans', name: 'Python Booleans', slug: 'py-booleans', url: 'https://www.w3schools.com/python/python_booleans.asp', order: 7 },
      { id: 'py-lists', name: 'Python Lists', slug: 'py-lists', url: 'https://www.w3schools.com/python/python_lists.asp', order: 8 },
      { id: 'py-dictionaries', name: 'Python Dictionaries', slug: 'py-dictionaries', url: 'https://www.w3schools.com/python/python_dictionaries.asp', order: 9 },
      { id: 'py-functions', name: 'Python Functions', slug: 'py-functions', url: 'https://www.w3schools.com/python/python_functions.asp', order: 10 },
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
      { id: 'sql-intro', name: 'SQL Introduction', slug: 'sql-intro', url: 'https://www.w3schools.com/sql/sql_intro.asp', order: 1 },
      { id: 'sql-syntax', name: 'SQL Syntax', slug: 'sql-syntax', url: 'https://www.w3schools.com/sql/sql_syntax.asp', order: 2 },
      { id: 'sql-select', name: 'SQL SELECT', slug: 'sql-select', url: 'https://www.w3schools.com/sql/sql_select.asp', order: 3 },
      { id: 'sql-where', name: 'SQL WHERE', slug: 'sql-where', url: 'https://www.w3schools.com/sql/sql_where.asp', order: 4 },
      { id: 'sql-orderby', name: 'SQL ORDER BY', slug: 'sql-orderby', url: 'https://www.w3schools.com/sql/sql_orderby.asp', order: 5 },
      { id: 'sql-insert', name: 'SQL INSERT INTO', slug: 'sql-insert', url: 'https://www.w3schools.com/sql/sql_insert.asp', order: 6 },
      { id: 'sql-update', name: 'SQL UPDATE', slug: 'sql-update', url: 'https://www.w3schools.com/sql/sql_update.asp', order: 7 },
      { id: 'sql-delete', name: 'SQL DELETE', slug: 'sql-delete', url: 'https://www.w3schools.com/sql/sql_delete.asp', order: 8 },
    ],
  },
}
