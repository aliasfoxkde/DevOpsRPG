import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FeedbackPage from './FeedbackPage'
import { renderSeededPage } from './test-utils'

describe('FeedbackPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the feedback form with every field and the pipeline info', () => {
    renderSeededPage(<FeedbackPage />, { route: '/feedback', url: '/feedback' })

    expect(
      screen.getByRole('heading', { level: 1, name: /Submit Feedback/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('Feedback Type')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Title/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Area/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Description/)).toBeInTheDocument()
    // Nothing has been typed yet, so the submission is blocked
    expect(screen.getByRole('button', { name: 'Submit Feedback' })).toBeDisabled()
    expect(screen.getByText('🤖 Automated Improvement Pipeline')).toBeInTheDocument()
    // All four feedback types can be picked
    for (const type of ['Bug', 'Feature', 'Change', 'Praise']) {
      expect(screen.getByRole('button', { name: new RegExp(type) })).toBeInTheDocument()
    }
  })

  it('switches the helper placeholder when the feedback type changes', async () => {
    const user = userEvent.setup()
    renderSeededPage(<FeedbackPage />, { route: '/feedback', url: '/feedback' })

    expect(
      screen.getByPlaceholderText(
        'Describe the problem you want solved or the feature you want...',
      ),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Bug/ }))
    expect(
      screen.getByPlaceholderText(
        'Describe what happened, what you expected, and steps to reproduce...',
      ),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Praise/ }))
    expect(
      screen.getByPlaceholderText('Tell us what you love about DevOpsQuest!'),
    ).toBeInTheDocument()
  })

  it('fills in the form and unlocks the submit button', async () => {
    const user = userEvent.setup()
    renderSeededPage(<FeedbackPage />, { route: '/feedback', url: '/feedback' })

    const submit = screen.getByRole('button', { name: 'Submit Feedback' })
    expect(submit).toBeDisabled()

    await user.type(screen.getByLabelText(/^Title/), 'Quest progress resets')
    await user.type(
      screen.getByLabelText(/^Description/),
      'Reloading the page loses my badges.',
    )

    expect(submit).toBeEnabled()

    await user.selectOptions(screen.getByLabelText(/^Area/), 'World Map')
    expect(screen.getByLabelText(/^Area/)).toHaveDisplayValue('World Map')
  })

  it('requires both a title and a description before submitting', async () => {
    const user = userEvent.setup()
    renderSeededPage(<FeedbackPage />, { route: '/feedback', url: '/feedback' })

    const submit = screen.getByRole('button', { name: 'Submit Feedback' })

    await user.type(screen.getByLabelText(/^Title/), 'Only a title')
    expect(submit).toBeDisabled()

    await user.type(screen.getByLabelText(/^Description/), '   ')
    // Whitespace alone does not satisfy the required fields
    expect(submit).toBeDisabled()
  })
})
