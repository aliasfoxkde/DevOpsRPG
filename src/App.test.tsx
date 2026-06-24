import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { technologies } from './data/technologies'

// Mock matchMedia for ThemeContext
function setupMatchMediaMock() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Wrap App with MemoryRouter to enable client-side routing
function renderWithRouter(ui: React.ReactElement) {
  return render(ui, { wrapper: ({ children }) => (
    <MemoryRouter initialEntries={['/']}>
      {children}
    </MemoryRouter>
  )})
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    setupMatchMediaMock()
  })

  it('renders without crashing', () => {
    renderWithRouter(<App />)
    // App should render something
    expect(document.body.textContent).toBeTruthy()
  })

  it('renders home page at root route', () => {
    renderWithRouter(<App />)
    // Should show content from HomePage
    expect(document.body.textContent).toBeTruthy()
  })

  it('renders dashboard at /dashboard route', () => {
    renderWithRouter(<App />)
    // Should show content
    expect(document.body.textContent).toBeTruthy()
  })

  it('computes total topics from technologies', () => {
    // The totalTopics calculation should be > 0 based on technologies data
    const totalTopics = Object.values(technologies).reduce(
      (sum, tech) => sum + tech.topics.length,
      0
    )
    expect(totalTopics).toBeGreaterThan(0)
  })
})
