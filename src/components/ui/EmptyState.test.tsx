import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmptyState from './EmptyState'

describe('EmptyState', () => {
  it('renders the icon, title and description', () => {
    render(
      <EmptyState
        icon="🗺️"
        title="No quests yet"
        description="Complete your first quest to start your journey."
      />
    )

    expect(screen.getByText('🗺️')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'No quests yet' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Complete your first quest to start your journey.')
    ).toBeInTheDocument()
  })

  it('does not render an action button without an action', () => {
    render(<EmptyState icon="📦" title="Empty" description="Nothing here." />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('renders the action button and invokes onClick when clicked', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(
      <EmptyState
        icon="📦"
        title="Empty"
        description="Nothing here."
        action={{ label: 'Browse quests', onClick: onAction }}
      />
    )

    const button = screen.getByRole('button', { name: 'Browse quests' })
    await user.click(button)
    expect(onAction).toHaveBeenCalledTimes(1)
    // React hands the click event straight through to the caller's handler
    expect(onAction.mock.calls[0][0].type).toBe('click')
  })

  it('activates the action with the keyboard (Enter)', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(
      <EmptyState
        icon="📦"
        title="Empty"
        description="Nothing here."
        action={{ label: 'Browse quests', onClick: onAction }}
      />
    )

    const button = screen.getByRole('button', { name: 'Browse quests' })
    button.focus()
    await user.keyboard('{Enter}')
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('keeps the action usable after repeated clicks', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(
      <EmptyState
        icon="📦"
        title="Empty"
        description="Nothing here."
        action={{ label: 'Browse quests', onClick: onAction }}
      />
    )

    const button = screen.getByRole('button', { name: 'Browse quests' })
    await user.click(button)
    await user.click(button)
    expect(onAction).toHaveBeenCalledTimes(2)
  })
})
