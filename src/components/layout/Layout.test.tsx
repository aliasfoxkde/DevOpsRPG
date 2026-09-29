import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Layout from './Layout'

function CrashingPage(): never {
  throw new Error('route blew up')
}

function renderLayoutAt(initial: string) {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<p>Home page</p>} />
          <Route path="/boom" element={<CrashingPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('Layout', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the skip link, breadcrumbs and the main landmark around the outlet', () => {
    renderLayoutAt('/')

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute(
      'href',
      '#main-content',
    )
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByText('Home page')).toBeInTheDocument()
  })

  it('contains a crashing route inside the error boundary, not the whole shell', () => {
    // React logs the recoverable error to console; keep the output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    renderLayoutAt('/boom')

    // The route's crash is contained: the fallback replaces the page, while
    // the shell (skip link, breadcrumb nav, main landmark) survives.
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
  })

  it('gives the boundary a fresh start when the user leaves the crashed route', async () => {
    const user = userEvent.setup()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    // Crash on a route whose breadcrumbs include a Home link (an unknown path
    // renders Home as the current crumb, not a link).
    render(
      <MemoryRouter initialEntries={['/quests']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<p>Home page</p>} />
            <Route path="/quests" element={<CrashingPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()

    // The breadcrumb Home link is outside the boundary, so it still works —
    // and the pathname key remounts a clean boundary for the next page.
    await user.click(screen.getByRole('link', { name: /Home/ }))

    expect(screen.getByText('Home page')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
