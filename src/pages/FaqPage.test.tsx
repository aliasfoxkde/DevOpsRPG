import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FaqPage from './FaqPage'
import { renderSeededPage } from './test-utils'

describe('FaqPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the page heading and intro copy', () => {
    renderSeededPage(<FaqPage />)
    expect(
      screen.getByRole('heading', { level: 1, name: /Frequently Asked Questions/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('Everything you need to know about DevOpsQuest')).toBeInTheDocument()
  })

  it('renders one filter button per FAQ category', () => {
    renderSeededPage(<FaqPage />)
    for (const category of ['All', 'General', 'Learning', 'Gameplay', 'Technical', 'Community']) {
      expect(screen.getByRole('button', { name: category })).toBeInTheDocument()
    }
  })

  it('shows every answer collapsed by default', () => {
    renderSeededPage(<FaqPage />)
    // The answer text only appears once an item is expanded
    expect(
      screen.queryByText(/completely free and open source under the MIT License/),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Is DevOpsQuest really free?')).toBeInTheDocument()
  })

  it('expands an answer when the question is clicked', async () => {
    const user = userEvent.setup()
    renderSeededPage(<FaqPage />)

    await user.click(screen.getByText('Is DevOpsQuest really free?'))

    expect(
      screen.getByText(/completely free and open source under the MIT License/),
    ).toBeInTheDocument()
  })

  it('filters questions down to the selected category', async () => {
    const user = userEvent.setup()
    renderSeededPage(<FaqPage />)

    await user.click(screen.getByRole('button', { name: 'Technical' }))

    expect(screen.getByText('How is the content generated?')).toBeInTheDocument()
    expect(screen.queryByText('Is DevOpsQuest really free?')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Still have questions?' })).toBeInTheDocument()
  })
})
