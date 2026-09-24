import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FeedbackPage from './FeedbackPage'
import { renderSeededPage } from './test-utils'

/** The fetch double FeedbackPage talks to when it files a GitHub issue. */
type FetchMock = Mock<(url: string, init: RequestInit) => Promise<{ ok: boolean }>>

/** A fetch double that records the GitHub issue it was asked to create. */
function stubFetch(response: { ok: boolean }): FetchMock {
  const fetchMock: FetchMock = vi.fn()
  fetchMock.mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('FeedbackPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders the feedback form with every field and the pipeline info', () => {
    renderSeededPage(<FeedbackPage />, { route: '/feedback', url: '/feedback' })

    expect(screen.getByRole('heading', { level: 1, name: /Submit Feedback/ })).toBeInTheDocument()
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
    await user.type(screen.getByLabelText(/^Description/), 'Reloading the page loses my badges.')

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

  it('posts the report as a GitHub issue carrying the hero context', async () => {
    const user = userEvent.setup()
    const fetchMock = stubFetch({ ok: true })
    const { game } = renderSeededPage(<FeedbackPage />, { route: '/feedback', url: '/feedback' })

    await user.click(screen.getByRole('button', { name: /Change/ }))
    await user.type(screen.getByLabelText(/^Title/), 'Quest progress resets')
    await user.type(screen.getByLabelText(/^Description/), 'Reloading the page loses my badges.')
    await user.selectOptions(screen.getByLabelText(/^Area/), 'World Map')
    await user.click(screen.getByRole('button', { name: 'Submit Feedback' }))

    // The success screen replaces the form
    expect(await screen.findByRole('heading', { name: 'Thank You!' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'github.com/aliasfoxkde/DevOpsRPG/issues' }),
    ).toHaveAttribute('href', 'https://github.com/aliasfoxkde/DevOpsRPG/issues')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(url).toBe('https://api.github.com/repos/aliasfoxkde/DevOpsRPG/issues')
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({ Accept: 'application/vnd.github+json' })
    if (typeof init.body !== 'string') throw new Error('Expected a string request body')
    const issue: unknown = JSON.parse(init.body)
    expect(issue).toMatchObject({
      title: '[CHANGE] Quest progress resets',
      labels: ['change-request', 'needs-triage'],
    })
    const body = (issue as { body: string }).body
    expect(body).toContain('**Type**: change')
    expect(body).toContain('**Area**: World Map')
    expect(body).toContain(`${game.character.name} (Level ${game.character.level})`)
    expect(body).toContain('Reloading the page loses my badges.')
  })

  it('clears the form after returning from the thank-you screen', async () => {
    const user = userEvent.setup()
    stubFetch({ ok: true })
    renderSeededPage(<FeedbackPage />, { route: '/feedback', url: '/feedback' })

    await user.type(screen.getByLabelText(/^Title/), 'Add a dark mode timer')
    await user.type(screen.getByLabelText(/^Description/), 'The study screen is very bright.')
    await user.click(screen.getByRole('button', { name: 'Submit Feedback' }))
    await screen.findByRole('heading', { name: 'Thank You!' })

    await user.click(screen.getByRole('button', { name: 'Submit More Feedback' }))

    expect(screen.getByRole('heading', { level: 1, name: /Submit Feedback/ })).toBeInTheDocument()
    expect(screen.getByLabelText(/^Title/)).toHaveValue('')
    expect(screen.getByLabelText(/^Description/)).toHaveValue('')
    // Type and area fall back to their defaults
    expect(
      screen.getByPlaceholderText(
        'Describe the problem you want solved or the feature you want...',
      ),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/^Area/)).toHaveDisplayValue('Quest System')
    expect(screen.getByRole('button', { name: 'Submit Feedback' })).toBeDisabled()
  })

  it('keeps the report editable when GitHub rejects the submission', async () => {
    const user = userEvent.setup()
    stubFetch({ ok: false })
    renderSeededPage(<FeedbackPage />, { route: '/feedback', url: '/feedback' })
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await user.type(screen.getByLabelText(/^Title/), 'Broken badge award')
    await user.type(screen.getByLabelText(/^Description/), 'The badge never unlocks.')
    await user.click(screen.getByRole('button', { name: 'Submit Feedback' }))

    expect(await screen.findByText(/Failed to submit feedback/)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Thank You!' })).not.toBeInTheDocument()
    // The draft survives so nothing has to be retyped
    expect(screen.getByLabelText(/^Title/)).toHaveValue('Broken badge award')
    expect(screen.getByRole('button', { name: 'Submit Feedback' })).toBeEnabled()
    expect(errorSpy).toHaveBeenCalled()
  })
})
