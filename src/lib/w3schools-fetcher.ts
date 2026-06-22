// W3Schools content fetcher
// Fetches and parses tutorial content from W3Schools

const W3SCHOOLS_BASE = 'https://www.w3schools.com';

interface W3Content {
  title: string;
  content: string;
  code?: string;
  nextTopic?: {
    slug: string;
    name: string;
  };
}

export async function fetchW3Content(topicUrl: string): Promise<W3Content | null> {
  try {
    const response = await fetch(`${topicUrl}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DevOpsQuest/1.0)',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${topicUrl}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    return parseW3HTML(html, topicUrl);
  } catch (error) {
    console.error(`Error fetching ${topicUrl}:`, error);
    return null;
  }
}

function parseW3HTML(html: string, originalUrl: string): W3Content {
  // Extract title
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(' - W3Schools', '').trim() : 'Tutorial';

  // Extract main content sections
  let content = '';

  // Find all w3-panel sections (tutorial text)
  const panelRegex = /<div class="w3-panel(?:\s+[^"]*)?"[^>]*>([\s\S]*?)<\/div>\s*(?=<div|$)/gi;
  let panelMatch;
  const panels: string[] = [];

  while ((panelMatch = panelRegex.exec(html)) !== null) {
    const panelContent = panelMatch[1].trim();
    // Skip if it's too short or contains only navigation
    if (panelContent.length > 100 && !panelContent.includes('w3-bar-item') && !panelContent.includes('w3-dropdown')) {
      panels.push(panelContent);
    }
  }

  // Extract meaningful text from panels
  if (panels.length > 0) {
    content = panels
      .map(p => extractTextFromHTML(p))
      .filter(t => t.length > 50)
      .join('\n\n');
  }

  // Fallback: try to get content from main w3-content area
  if (!content || content.length < 100) {
    const mainContentMatch = html.match(/<div class="w3-content[^>]*>([\s\S]*?)<div class="w3-panel/);
    if (mainContentMatch) {
      content = extractTextFromHTML(mainContentMatch[1]);
    }
  }

  // Extract code examples
  let code = '';
  const codeMatches: string[] = [];

  // Find w3-code blocks
  const codeRegex = /<div class="w3-code(?:[^"]*)?"[^>]*>([\s\S]*?)<\/div>/gi;
  let codeMatch;
  while ((codeMatch = codeRegex.exec(html)) !== null) {
    const codeContent = decodeHTMLEntities(codeMatch[1].trim());
    if (codeContent.length > 20) {
      codeMatches.push(stripTags(codeContent));
    }
  }

  // Find w3-example blocks (often contain both description and code)
  const exampleRegex = /<div class="w3-example"[\s\S]*?<pre[^>]*>([\s\S]*?)<\/pre>/gi;
  while ((codeMatch = exampleRegex.exec(html)) !== null) {
    const codeContent = decodeHTMLEntities(codeMatch[1].trim());
    if (codeContent.length > 20 && !codeMatches.includes(codeContent)) {
      codeMatches.push(stripTags(codeContent));
    }
  }

  if (codeMatches.length > 0) {
    code = codeMatches.slice(0, 3).join('\n\n---\n\n');
  }

  return {
    title,
    content: content || 'Content could not be extracted. Please visit the W3Schools website directly.',
    code: code || undefined,
  };
}

function extractTextFromHTML(html: string): string {
  return html
    // Remove scripts and styles
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove advertisement and tracking
    .replace(/Advertisement/gi, '')
    // Remove navigation elements
    .replace(/<div class="w3-(?:bar|dropdown|nav)"[^>]*>[\s\S]*?<\/div>/gi, '')
    // Remove video placeholders
    .replace(/<div class="w3-video[^>]*>[\s\S]*?<\/div>/gi, '')
    // Convert headings
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h[1-6]>/gi, '\n## $2\n')
    // Convert paragraphs and divs to newlines
    .replace(/<\/(?:p|div)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    // Convert lists
    .replace(/<\/?(?:ul|ol|li)>/gi, '\n')
    // Bold and italic
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '_${1}_')
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '_${1}_')
    // Code spans
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
    .replace(/<span[^>]*class="w3-codespan"[^>]*>([\s\S]*?)<\/span>/gi, '`$1`')
    // Links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean up whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

// Get all topics for a technology
export function getW3TopicsForTechnology(technology: string): Array<{name: string; url: string}> {
  const topicsMap: Record<string, Array<{name: string; url: string}>> = {
    html: [
      { name: 'HTML Introduction', url: `${W3SCHOOLS_BASE}/html/html_intro.asp` },
      { name: 'HTML Editors', url: `${W3SCHOOLS_BASE}/html/html_editors.asp` },
      { name: 'HTML Basic', url: `${W3SCHOOLS_BASE}/html/html_basic.asp` },
      { name: 'HTML Elements', url: `${W3SCHOOLS_BASE}/html/html_elements.asp` },
      { name: 'HTML Attributes', url: `${W3SCHOOLS_BASE}/html/html_attributes.asp` },
      { name: 'HTML Headings', url: `${W3SCHOOLS_BASE}/html/html_headings.asp` },
      { name: 'HTML Paragraphs', url: `${W3SCHOOLS_BASE}/html/html_paragraphs.asp` },
      { name: 'HTML Styles', url: `${W3SCHOOLS_BASE}/html/html_styles.asp` },
      { name: 'HTML Formatting', url: `${W3SCHOOLS_BASE}/html/html_formatting.asp` },
      { name: 'HTML Links', url: `${W3SCHOOLS_BASE}/html/html_links.asp` },
      { name: 'HTML Images', url: `${W3SCHOOLS_BASE}/html/html_images.asp` },
      { name: 'HTML Lists', url: `${W3SCHOOLS_BASE}/html/html_lists.asp` },
      { name: 'HTML Classes', url: `${W3SCHOOLS_BASE}/html/html_classes.asp` },
      { name: 'HTML Id', url: `${W3SCHOOLS_BASE}/html/html_id.asp` },
      { name: 'HTML Forms', url: `${W3SCHOOLS_BASE}/html/html_forms.asp` },
    ],
    css: [
      { name: 'CSS Introduction', url: `${W3SCHOOLS_BASE}/css/css_intro.asp` },
      { name: 'CSS Syntax', url: `${W3SCHOOLS_BASE}/css/css_syntax.asp` },
      { name: 'CSS Selectors', url: `${W3SCHOOLS_BASE}/css/css_selectors.asp` },
      { name: 'CSS Colors', url: `${W3SCHOOLS_BASE}/css/css_colors.asp` },
      { name: 'CSS Backgrounds', url: `${W3SCHOOLS_BASE}/css/css_background.asp` },
      { name: 'CSS Box Model', url: `${W3SCHOOLS_BASE}/css/css_boxmodel.asp` },
      { name: 'CSS Padding', url: `${W3SCHOOLS_BASE}/css/css_padding.asp` },
      { name: 'CSS Margin', url: `${W3SCHOOLS_BASE}/css/css_margin.asp` },
      { name: 'CSS Flexbox', url: `${W3SCHOOLS_BASE}/css/css3_flexbox.asp` },
      { name: 'CSS Grid', url: `${W3SCHOOLS_BASE}/css/css_grid.asp` },
    ],
    javascript: [
      { name: 'JavaScript Introduction', url: `${W3SCHOOLS_BASE}/js/js_intro.asp` },
      { name: 'JavaScript Where To', url: `${W3SCHOOLS_BASE}/js/js_whereto.asp` },
      { name: 'JavaScript Output', url: `${W3SCHOOLS_BASE}/js/js_output.asp` },
      { name: 'JavaScript Syntax', url: `${W3SCHOOLS_BASE}/js/js_syntax.asp` },
      { name: 'JavaScript Variables', url: `${W3SCHOOLS_BASE}/js/js_variables.asp` },
      { name: 'JavaScript Operators', url: `${W3SCHOOLS_BASE}/js/js_operators.asp` },
      { name: 'JavaScript Data Types', url: `${W3SCHOOLS_BASE}/js/js_datatypes.asp` },
      { name: 'JavaScript Functions', url: `${W3SCHOOLS_BASE}/js/js_functions.asp` },
      { name: 'JavaScript Objects', url: `${W3SCHOOLS_BASE}/js/js_objects.asp` },
      { name: 'JavaScript Arrays', url: `${W3SCHOOLS_BASE}/js/js_arrays.asp` },
    ],
    python: [
      { name: 'Python Introduction', url: `${W3SCHOOLS_BASE}/python/python_intro.asp` },
      { name: 'Python Get Started', url: `${W3SCHOOLS_BASE}/python/python_getstarted.asp` },
      { name: 'Python Syntax', url: `${W3SCHOOLS_BASE}/python/python_syntax.asp` },
      { name: 'Python Variables', url: `${W3SCHOOLS_BASE}/python/python_variables.asp` },
      { name: 'Python Data Types', url: `${W3SCHOOLS_BASE}/python/python_datatypes.asp` },
      { name: 'Python Numbers', url: `${W3SCHOOLS_BASE}/python/python_numbers.asp` },
      { name: 'Python Strings', url: `${W3SCHOOLS_BASE}/python/python_strings.asp` },
      { name: 'Python Booleans', url: `${W3SCHOOLS_BASE}/python/python_booleans.asp` },
      { name: 'Python Operators', url: `${W3SCHOOLS_BASE}/python/python_operators.asp` },
      { name: 'Python Lists', url: `${W3SCHOOLS_BASE}/python/python_lists.asp` },
    ],
    sql: [
      { name: 'SQL Introduction', url: `${W3SCHOOLS_BASE}/sql/sql_intro.asp` },
      { name: 'SQL Syntax', url: `${W3SCHOOLS_BASE}/sql/sql_syntax.asp` },
      { name: 'SQL SELECT', url: `${W3SCHOOLS_BASE}/sql/sql_select.asp` },
      { name: 'SQL WHERE', url: `${W3SCHOOLS_BASE}/sql/sql_where.asp` },
      { name: 'SQL ORDER BY', url: `${W3SCHOOLS_BASE}/sql/sql_orderby.asp` },
      { name: 'SQL INSERT', url: `${W3SCHOOLS_BASE}/sql/sql_insert.asp` },
      { name: 'SQL UPDATE', url: `${W3SCHOOLS_BASE}/sql/sql_update.asp` },
      { name: 'SQL DELETE', url: `${W3SCHOOLS_BASE}/sql/sql_delete.asp` },
    ],
  };

  return topicsMap[technology.toLowerCase()] || [];
}
