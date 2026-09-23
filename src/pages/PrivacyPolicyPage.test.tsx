import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import PrivacyPolicyPage from './PrivacyPolicyPage'
import { renderSeededPage } from './test-utils'

describe('PrivacyPolicyPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the policy heading', () => {
    renderSeededPage(<PrivacyPolicyPage />)
    expect(
      screen.getByRole('heading', { level: 1, name: /Privacy Policy/ }),
    ).toBeInTheDocument()
  })

  it('documents each numbered policy section', () => {
    renderSeededPage(<PrivacyPolicyPage />)
    expect(
      screen.getByRole('heading', { name: '1. Information We Collect' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '3. Data Storage' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '10. Contact Us' }),
    ).toBeInTheDocument()
  })

  it('explains that progress is stored locally', () => {
    renderSeededPage(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { name: 'Local Storage Data' })).toBeInTheDocument()
    expect(
      screen.getByText(/locally in your browser using localStorage/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/stays on your device and is never transmitted to our servers/i),
    ).toBeInTheDocument()
  })
})
