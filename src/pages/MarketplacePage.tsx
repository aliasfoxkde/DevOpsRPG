// Marketplace Page - User-to-user trading placeholder
// NOTE: This requires backend implementation for real P2P trading
// This UI provides the structure and future integration points

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'

interface MarketplaceListing {
  id: string
  sellerName: string
  sellerLevel: number
  itemType: 'badge' | 'title' | 'equipment' | 'collectible'
  itemId: string
  itemName: string
  itemIcon: string
  price: number
  rarity?: string
  description: string
  listedAt: string
}

// Mock listings for demonstration
const MOCK_LISTINGS: MarketplaceListing[] = [
  {
    id: 'listing_1',
    sellerName: 'CloudNinja',
    sellerLevel: 25,
    itemType: 'badge',
    itemId: 'docker_expert',
    itemName: 'Docker Expert',
    itemIcon: '🐳',
    price: 500,
    rarity: 'rare',
    description: 'Proven Docker mastery badge',
    listedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'listing_2',
    sellerName: 'K8sMaster',
    sellerLevel: 32,
    itemType: 'badge',
    itemId: 'kubernetes_guru',
    itemName: 'Kubernetes Guru',
    itemIcon: '☸️',
    price: 750,
    rarity: 'epic',
    description: 'Elite Kubernetes expertise badge',
    listedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'listing_3',
    sellerName: 'TerraForm',
    sellerLevel: 18,
    itemType: 'title',
    itemId: 'infra_master',
    itemName: 'Infrastructure Master',
    itemIcon: '👑',
    price: 300,
    rarity: 'rare',
    description: 'Exclusive title showing infrastructure expertise',
    listedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
]

// Item categories
const CATEGORIES = [
  { id: 'all', name: 'All Items', icon: '🏪' },
  { id: 'badge', name: 'Badges', icon: '🏅' },
  { id: 'title', name: 'Titles', icon: '✨' },
  { id: 'equipment', name: 'Equipment', icon: '⚙️' },
  { id: 'collectible', name: 'Collectibles', icon: '💎' },
]

// Rarity colors
const RARITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  common: { bg: 'bg-slate-700', border: 'border-slate-500', text: 'text-slate-300' },
  uncommon: { bg: 'bg-green-900/30', border: 'border-green-600', text: 'text-green-400' },
  rare: { bg: 'bg-blue-900/30', border: 'border-blue-600', text: 'text-blue-400' },
  epic: { bg: 'bg-purple-900/30', border: 'border-purple-600', text: 'text-purple-400' },
  legendary: { bg: 'bg-amber-900/30', border: 'border-amber-600', text: 'text-amber-400' },
}

export default function MarketplacePage() {
  const { game } = useGame()
  const { character } = game
  const [category, setCategory] = useState('all')
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null)
  const [showCreateListing, setShowCreateListing] = useState(false)

  // Filter listings by category
  const filteredListings = category === 'all'
    ? MOCK_LISTINGS
    : MOCK_LISTINGS.filter(l => l.itemType === category)

  const formatTimeAgo = (dateStr: string): string => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000))

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  const handlePurchase = (listing: MarketplaceListing) => {
    if (character.gold < listing.price) {
      alert(`Not enough gold! Need ${listing.price} gold.`)
      return
    }
    // In a real implementation, this would call backend API
    alert(`This feature requires a backend server for real P2P trading.\n\nWould purchase "${listing.itemName}" from ${listing.sellerName} for ${listing.price} gold.`)
    setSelectedListing(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-amber-400 hover:text-amber-300 transition-colors text-sm mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-400 mb-2">🏪 Marketplace</h1>
          <p className="text-slate-400">Trade items with other adventurers! (Coming Soon)</p>
        </div>

        {/* Coming Soon Banner */}
        <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 rounded-xl border border-amber-600/30 p-6 mb-8">
          <div className="flex items-center justify-center gap-4">
            <span className="text-4xl">🔜</span>
            <div className="text-center">
              <h3 className="text-xl font-bold text-amber-400">Backend Required</h3>
              <p className="text-slate-400 text-sm">
                Real P2P trading requires a backend server. This UI shows the planned interface.
              </p>
            </div>
            <span className="text-4xl">🔜</span>
          </div>
        </div>

        {/* Your Gold */}
        <div className="bg-slate-800/80 rounded-xl border border-amber-600/30 p-4 mb-8 text-center">
          <span className="text-yellow-400 text-2xl font-bold">💰 {character.gold.toLocaleString()}</span>
          <span className="text-slate-400 ml-2">Your Gold</span>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat.id
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredListings.map((listing) => {
            const rarityStyle = RARITY_COLORS[listing.rarity || 'common']

            return (
              <div
                key={listing.id}
                onClick={() => setSelectedListing(listing)}
                className={`${rarityStyle.bg} rounded-xl border ${rarityStyle.border} overflow-hidden cursor-pointer transition-all hover:scale-102 hover:shadow-lg`}
              >
                <div className="p-4">
                  {/* Item Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{listing.itemIcon}</span>
                    <div className="flex-1">
                      <div className={`font-bold ${rarityStyle.text}`}>{listing.itemName}</div>
                      <div className="text-slate-400 text-xs">{listing.itemType}</div>
                    </div>
                    {listing.rarity && (
                      <span className={`text-xs px-2 py-0.5 rounded ${rarityStyle.bg} ${rarityStyle.border} ${rarityStyle.text}`}>
                        {listing.rarity.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 text-sm mb-3">{listing.description}</p>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400 font-bold text-lg">💰 {listing.price}</span>
                    <span className="text-slate-500 text-xs">{formatTimeAgo(listing.listedAt)}</span>
                  </div>

                  {/* Seller Info */}
                  <div className="mt-3 pt-3 border-t border-slate-600/50 flex items-center gap-2">
                    <span className="text-slate-400 text-xs">Seller:</span>
                    <span className="text-slate-300 text-xs font-medium">{listing.sellerName}</span>
                    <span className="text-slate-500 text-xs">Lv.{listing.sellerLevel}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Create Listing Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowCreateListing(true)}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-amber-600/30"
          >
            📝 Create New Listing
          </button>
        </div>

        {/* Empty State */}
        {filteredListings.length === 0 && (
          <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
            <span className="text-6xl mb-4 block">🏪</span>
            <h3 className="text-xl font-bold text-slate-300 mb-2">No items listed</h3>
            <p className="text-slate-500">Be the first to list an item for sale!</p>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Purchase Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Confirm Purchase</h2>
              <button
                onClick={() => setSelectedListing(null)}
                className="text-slate-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Item Preview */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">{selectedListing.itemIcon}</span>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedListing.itemName}</h3>
                  <p className="text-slate-400 text-sm">{selectedListing.description}</p>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-slate-900/50 rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Seller:</span>
                  <span className="text-slate-300">{selectedListing.sellerName} (Lv.{selectedListing.sellerLevel})</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-slate-500">Listed:</span>
                  <span className="text-slate-300">{formatTimeAgo(selectedListing.listedAt)}</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between p-4 bg-yellow-900/20 rounded-lg border border-yellow-600/30 mb-6">
                <span className="text-slate-300">Price:</span>
                <span className="text-yellow-400 font-bold text-xl">💰 {selectedListing.price}</span>
              </div>

              {/* Your Balance */}
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg mb-6">
                <span className="text-slate-500">Your Balance:</span>
                <span className="text-slate-300 font-medium">💰 {character.gold.toLocaleString()}</span>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedListing(null)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePurchase(selectedListing)}
                  disabled={character.gold < selectedListing.price}
                  className={`flex-1 py-3 font-medium rounded-lg transition-colors ${
                    character.gold >= selectedListing.price
                      ? 'bg-green-600 hover:bg-green-500 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {character.gold >= selectedListing.price ? 'Confirm Purchase' : 'Not Enough Gold'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      {showCreateListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Create New Listing</h2>
              <button
                onClick={() => setShowCreateListing(false)}
                className="text-slate-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="text-center py-8">
                <span className="text-6xl mb-4 block">🔜</span>
                <h3 className="text-xl font-bold text-slate-300 mb-2">Coming Soon</h3>
                <p className="text-slate-500 mb-4">
                  Listing creation will be available once the backend server is implemented.
                </p>
                <p className="text-slate-600 text-sm">
                  You'll be able to list your badges, titles, equipment, and collectibles for other players to purchase.
                </p>
              </div>

              {/* Item Selection Preview */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Select Item to List</label>
                  <select
                    disabled
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
                  >
                    <option>Login required to list items</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Set Price (Gold)</label>
                  <input
                    type="number"
                    disabled
                    placeholder="Enter price"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                onClick={() => setShowCreateListing(false)}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
