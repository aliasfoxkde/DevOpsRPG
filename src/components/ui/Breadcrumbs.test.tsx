import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Breadcrumbs from './Breadcrumbs'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Breadcrumbs />
    </MemoryRouter>,
  )
}

describe('Breadcrumbs', () => {
  it('renders nothing on the home page', () => {
    const { container } = renderAt('/')
    expect(container).toBeEmptyDOMElement()
  })

  it('labels the trail for assistive tech', () => {
    renderAt('/quests')
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
  })

  it('links Home and marks the current page (not a link) for a simple route', () => {
    renderAt('/settings')

    const home = screen.getByRole('link', { name: /Home/ })
    expect(home).toHaveAttribute('href', '/')

    const current = screen.getByText('Settings')
    expect(current.closest('span')).toHaveAttribute('aria-current', 'page')
    expect(current.closest('a')).toBeNull()
  })

  it('shows Home > Quests for the quests route', () => {
    renderAt('/quests')
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Home')
    expect(items[1]).toHaveTextContent('Quests')
    expect(screen.getByText('Quests').closest('span')).toHaveAttribute('aria-current', 'page')
  })

  it('adds the Battle Arena crumb for a quest battle route', () => {
    renderAt('/quest/cloud-computing-basics')

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('Home')
    expect(items[1]).toHaveTextContent('Quests')
    expect(items[2]).toHaveTextContent('Battle Arena')

    const questLink = screen.getByRole('link', { name: /Quests/ })
    expect(questLink).toHaveAttribute('href', '/quests')
    expect(screen.getByText('Battle Arena').closest('span')).toHaveAttribute('aria-current', 'page')
  })

  it('matches the world map prefix', () => {
    renderAt('/worldmap')
    expect(screen.getByText('World Map')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Home/ })).toBeInTheDocument()
  })

  it('falls back to Home alone for unknown routes', () => {
    renderAt('/definitely-not-a-route')
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(1)
    expect(items[0]).toHaveTextContent('Home')
    // A single crumb is the current page, so it is not rendered as a link
    expect(screen.queryByRole('link', { name: /Home/ })).toBeNull()
    expect(screen.getByText('Home').closest('span')).toHaveAttribute('aria-current', 'page')
  })

  it('renders the separator as hidden decoration between crumbs', () => {
    renderAt('/worldmap')
    const separator = screen.getByText('/')
    expect(separator).toHaveAttribute('aria-hidden', 'true')
  })
})
