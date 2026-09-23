import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MarketplacePage from './MarketplacePage'
import { renderSeededPage, seedDefaultGame } from './test-utils'

describe('MarketplacePage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the marketplace header, gold balance and every listing', () => {
    const { character } = seedDefaultGame()
    renderSeededPage(<MarketplacePage />, { route: '/marketplace', url: '/marketplace' })

    expect(
      screen.getByRole('heading', { level: 1, name: /Marketplace/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('Backend Required')).toBeInTheDocument()
    expect(screen.getByText('Your Gold')).toBeInTheDocument()
    expect(screen.getByText(`💰 ${character.gold.toLocaleString()}`)).toBeInTheDocument()
    for (const item of ['Docker Expert', 'Kubernetes Guru', 'Infrastructure Master']) {
      expect(screen.getByText(item)).toBeInTheDocument()
    }
    for (const seller of ['CloudNinja', 'K8sMaster', 'TerraForm']) {
      expect(screen.getByText(seller)).toBeInTheDocument()
    }
  })

  it('narrows the listings when a category filter is picked', async () => {
    const user = userEvent.setup()
    renderSeededPage(<MarketplacePage />, { route: '/marketplace', url: '/marketplace' })

    await user.click(screen.getByRole('button', { name: '✨ Titles' }))

    expect(screen.getByText('Infrastructure Master')).toBeInTheDocument()
    expect(screen.queryByText('Docker Expert')).not.toBeInTheDocument()
    expect(screen.queryByText('Kubernetes Guru')).not.toBeInTheDocument()

    // Equipment has no listings at all, so the empty state kicks in
    await user.click(screen.getByRole('button', { name: '⚙️ Equipment' }))
    expect(screen.getByText('No items listed')).toBeInTheDocument()
    expect(screen.getByText('Be the first to list an item for sale!')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '🏪 All Items' }))
    expect(screen.getByText('Docker Expert')).toBeInTheDocument()
    expect(screen.queryByText('No items listed')).not.toBeInTheDocument()
  })

  it('opens a purchase modal that blocks buyers without enough gold', async () => {
    const user = userEvent.setup()
    renderSeededPage(<MarketplacePage />, { route: '/marketplace', url: '/marketplace' })

    await user.click(screen.getByText('Docker Expert'))

    expect(
      screen.getByRole('heading', { name: 'Confirm Purchase' }),
    ).toBeInTheDocument()
    // The price shows on the card behind the modal and inside the modal itself
    expect(screen.getAllByText('💰 500')).toHaveLength(2)
    const balance = screen.getByText('Your Balance:').nextElementSibling
    // A fresh hero has no gold at all
    expect(balance).toHaveTextContent('💰 0')
    const buyButton = screen.getByRole('button', { name: 'Not Enough Gold' })
    expect(buyButton).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(
      screen.queryByRole('heading', { name: 'Confirm Purchase' }),
    ).not.toBeInTheDocument()
  })

  it('shows the placeholder flow for creating a new listing', async () => {
    const user = userEvent.setup()
    renderSeededPage(<MarketplacePage />, { route: '/marketplace', url: '/marketplace' })

    await user.click(screen.getByRole('button', { name: /Create New Listing/ }))

    expect(
      screen.getByRole('heading', { name: 'Create New Listing' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    expect(
      screen.getByText('Login required to list items'),
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter price')).toBeDisabled()

    await user.click(screen.getAllByRole('button', { name: 'Close' })[0])
    expect(
      screen.queryByRole('heading', { name: 'Create New Listing' }),
    ).not.toBeInTheDocument()
  })
})
