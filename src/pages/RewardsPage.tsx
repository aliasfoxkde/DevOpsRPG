import { useState } from 'react'
import { useGame } from '../contexts/GameContext'
import { DAILY_REWARDS } from '../data/collectibles'
import { COLLECTIBLES_POOL, openMysteryBox, type Collectible } from '../data/collectibles'
import { REWARD_TIERS } from '../data/milestones'

export default function RewardsPage() {
  const { game, claimDailyReward, spinWheel, consumeCollectible, getActiveCollectibles, completedCount, addXP, addGold, grantBadge } = useGame()
  const [wheelSpinning, setWheelSpinning] = useState(false)
  const [wheelResult, setWheelResult] = useState<{ label: string; icon: string } | null>(null)
  const [mysteryBoxToOpen, setMysteryBoxToOpen] = useState<Collectible | null>(null)
  const [mysteryResult, setMysteryResult] = useState<{ type: string; value?: number; collectible?: Collectible } | null>(null)
  const [showMystery, setShowMystery] = useState(false)
  const [claimedTiers, setClaimedTiers] = useState<string[]>([])

  const activeCollectibles = getActiveCollectibles()

  // Check which daily rewards are claimed
  const dayOfWeek = new Date().getDay()
  const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek // Sunday = 7 instead of 0

  const getTierProgress = (tier: typeof REWARD_TIERS[0]) => {
    switch (tier.requirement.type) {
      case 'quests': return tier.requirement.value > 0 ? completedCount / tier.requirement.value : 0
      case 'level': return tier.requirement.value > 0 ? game.character.level / tier.requirement.value : 0
      case 'xp': return tier.requirement.value > 0 ? game.character.xp / tier.requirement.value : 0
      default: return 0
    }
  }

  const isTierComplete = (tier: typeof REWARD_TIERS[0]) => {
    switch (tier.requirement.type) {
      case 'quests': return completedCount >= tier.requirement.value
      case 'level': return game.character.level >= tier.requirement.value
      case 'xp': return game.character.xp >= tier.requirement.value
      default: return false
    }
  }

  const canClaimTier = (tier: typeof REWARD_TIERS[0]) => {
    return isTierComplete(tier) && !claimedTiers.includes(tier.id) && !game.collectibles.some(c => c.id === `tier_claimed_${tier.id}`)
  }

  const handleClaimTier = (tier: typeof REWARD_TIERS[0]) => {
    if (!canClaimTier(tier)) return
    // Grant XP reward
    addXP(tier.rewards.xp)
    // Grant gold reward
    addGold(tier.rewards.gold)
    // Grant badge if present
    if (tier.rewards.badge) {
      grantBadge(tier.rewards.badge)
    }
    setClaimedTiers([...claimedTiers, tier.id])
  }

  const handleClaimDaily = (day: number) => {
    if (!game.dailyRewardsClaimed.includes(day)) {
      claimDailyReward(day)
    }
  }

  const handleSpinWheel = () => {
    if (wheelSpinning) return
    setWheelSpinning(true)
    setWheelResult(null)

    // Simulate wheel spinning animation
    setTimeout(() => {
      const result = spinWheel()
      setWheelResult({ label: result.segment.label, icon: result.segment.icon })
      setWheelSpinning(false)
    }, 2000)
  }

  const handleOpenMystery = (collectible: Collectible) => {
    if (collectible.type !== 'mystery_box') {
      consumeCollectible(collectible.id)
      return
    }
    try {
      setMysteryBoxToOpen(collectible)
      const result = openMysteryBox(collectible)
      setMysteryResult(result)
      setShowMystery(true)
    } catch (err) {
      console.error('Failed to open mystery box:', err)
      // Show a friendly error message to the user
      setMysteryResult({
        type: 'gold',
        value: 10,
        collectible: undefined,
      })
      setShowMystery(true)
    }
  }

  const handleCloseMystery = () => {
    if (mysteryBoxToOpen) {
      consumeCollectible(mysteryBoxToOpen.id)
    }
    setShowMystery(false)
    setMysteryBoxToOpen(null)
    setMysteryResult(null)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">🎁 Rewards Hub</h1>
        <p className="text-slate-400">Claim daily rewards, spin the wheel, and open mystery boxes!</p>
      </div>

      {/* Daily Rewards */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>📅</span> Daily Rewards
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {DAILY_REWARDS.map((reward, index) => {
            const day = index + 1
            const isClaimed = game.dailyRewardsClaimed.includes(day)
            const isToday = day === adjustedDay

            return (
              <div
                key={day}
                className={`relative p-3 rounded-lg border text-center transition-all ${
                  isClaimed
                    ? 'bg-green-900/30 border-green-500/50'
                    : isToday
                    ? 'bg-amber-900/30 border-amber-500/50 animate-pulse'
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="text-xs text-slate-400 mb-1">Day {day}</div>
                <div className="text-2xl mb-1">{reward.icon}</div>
                <div className="text-xs text-slate-300">
                  {reward.reward.type === 'xp' && `+${reward.reward.value} XP`}
                  {reward.reward.type === 'gold' && `+${reward.reward.value} Gold`}
                  {reward.reward.type === 'collectible' && reward.reward.collectibleId && (
                    <span>
                      {COLLECTIBLES_POOL.find(c => c.id === reward.reward.collectibleId)?.icon || '🎁'}
                    </span>
                  )}
                </div>
                {isClaimed && (
                  <div className="absolute top-1 right-1 text-green-400 text-xs">✓</div>
                )}
                {isToday && !isClaimed && (
                  <button
                    onClick={() => handleClaimDaily(day)}
                    className="mt-2 w-full py-1 px-2 bg-amber-600 hover:bg-amber-500 rounded text-xs font-bold"
                  >
                    CLAIM!
                  </button>
                )}
              </div>
            )
          })}
        </div>
        <p className="text-center text-sm text-slate-400 mt-4">
          {adjustedDay <= 7 ? `Day ${adjustedDay} reward available!` : 'All rewards claimed today!'}
        </p>
      </div>

      {/* Bonus Wheel */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>🎡</span> Bonus Wheel
        </h2>
        <div className="flex flex-col items-center">
          {/* Wheel visualization */}
          <div className="relative w-64 h-64 mb-6">
            <div
              className={`w-full h-full rounded-full border-4 border-amber-500 bg-gradient-to-br from-amber-900 to-amber-950 flex items-center justify-center transition-transform ${
                wheelSpinning ? 'animate-spin' : ''
              }`}
              style={{
                backgroundImage: `conic-gradient(from 0deg, #f59e0b 0deg 45deg, #92400e 45deg 90deg, #f59e0b 90deg 135deg, #92400e 135deg 180deg, #f59e0b 180deg 225deg, #92400e 225deg 270deg, #f59e0b 270deg 315deg, #92400e 315deg 360deg)`,
              }}
            >
              <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center text-2xl">
                {wheelResult?.icon || '🎯'}
              </div>
            </div>
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-amber-500" />
            </div>
          </div>

          {wheelResult && (
            <div className="mb-4 p-3 bg-amber-900/50 rounded-lg border border-amber-500">
              <div className="text-lg font-bold">You won: {wheelResult.icon} {wheelResult.label}</div>
            </div>
          )}

          <button
            onClick={handleSpinWheel}
            disabled={wheelSpinning}
            className={`py-3 px-8 rounded-lg font-bold text-lg transition-all ${
              wheelSpinning
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white'
            }`}
          >
            {wheelSpinning ? 'Spinning...' : '🎲 SPIN!'}
          </button>
        </div>
      </div>

      {/* Collectibles Inventory */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>🎒</span> Collectibles
          <span className="text-sm font-normal text-slate-400">({activeCollectibles.length} active)</span>
        </h2>

        {activeCollectibles.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <div className="text-4xl mb-2">🎁</div>
            <p>No collectibles yet. Complete quests to earn some!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeCollectibles.map((collectible, index) => (
              <div
                key={`${collectible.id}-${index}`}
                className={`p-4 rounded-lg border text-center ${
                  collectible.rarity === 'legendary'
                    ? 'bg-amber-900/30 border-amber-500'
                    : collectible.rarity === 'epic'
                    ? 'bg-purple-900/30 border-purple-500'
                    : collectible.rarity === 'rare'
                    ? 'bg-blue-900/30 border-blue-500'
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="text-4xl mb-2">{collectible.icon}</div>
                <div className="font-medium text-sm">{collectible.name}</div>
                <div className="text-xs text-slate-400 mb-2">{collectible.description}</div>
                <div className={`text-xs ${
                  collectible.rarity === 'legendary' ? 'text-amber-400'
                    : collectible.rarity === 'epic' ? 'text-purple-400'
                    : collectible.rarity === 'rare' ? 'text-blue-400'
                    : 'text-slate-400'
                }`}>
                  {collectible.rarity}
                </div>
                <button
                  onClick={() => handleOpenMystery(collectible)}
                  className={`mt-2 w-full py-1 px-3 rounded text-sm font-bold ${
                    collectible.type === 'mystery_box'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400'
                      : 'bg-green-600 hover:bg-green-500'
                  } text-white`}
                >
                  {collectible.type === 'mystery_box' ? '🎁 OPEN' : '⚡ USE'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reward Tiers / Milestone Packs */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>🎖️</span> Milestone Packs
          <span className="text-sm font-normal text-slate-400">(Complete to claim!)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REWARD_TIERS.map((tier) => {
            const progress = getTierProgress(tier)
            const complete = isTierComplete(tier)
            const canClaim = canClaimTier(tier)
            const progressPercent = Math.min(100, Math.round(progress * 100))

            return (
              <div
                key={tier.id}
                className={`p-4 rounded-lg border ${
                  complete && !canClaim
                    ? 'bg-green-900/30 border-green-500/50'
                    : complete
                    ? 'bg-amber-900/30 border-amber-500 animate-pulse'
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{tier.icon}</div>
                  <div className="flex-1">
                    <h3 className={`font-bold ${complete ? 'text-amber-400' : 'text-white'}`}>
                      {tier.name}
                    </h3>
                    <p className="text-xs text-slate-400 mb-2">{tier.description}</p>

                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Progress</span>
                        <span className={complete ? 'text-green-400' : 'text-amber-400'}>
                          {progressPercent}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            complete ? 'bg-green-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Rewards preview */}
                    <div className="flex gap-3 text-xs mb-2">
                      <span className="text-purple-400">+{tier.rewards.xp} XP</span>
                      <span className="text-orange-400">+{tier.rewards.gold} Gold</span>
                      {tier.rewards.badge && (
                        <span className="text-blue-400">+ Badge</span>
                      )}
                    </div>

                    {/* Claim button */}
                    {canClaim && (
                      <button
                        onClick={() => handleClaimTier(tier)}
                        className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 rounded-lg font-bold text-sm text-white"
                      >
                        🎁 CLAIM PACK!
                      </button>
                    )}
                    {!canClaim && complete && (
                      <div className="text-center py-2 text-green-400 text-sm font-bold">
                        ✓ Claimed!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mystery Box Modal */}
      {showMystery && mysteryResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-gradient-to-b from-purple-900/95 to-purple-950/95 border-2 border-purple-500 rounded-xl shadow-2xl p-8 text-center animate-bounce">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-2xl font-bold mb-2">Mystery Box Opened!</h3>
            <div className="text-4xl mb-4">
              {mysteryResult.type === 'xp' && `✨ +${mysteryResult.value} XP`}
              {mysteryResult.type === 'gold' && `🪙 +${mysteryResult.value} Gold`}
              {mysteryResult.type === 'collectible' && mysteryResult.collectible && (
                <span>
                  {mysteryResult.collectible.icon} {mysteryResult.collectible.name}
                </span>
              )}
            </div>
            <button
              onClick={handleCloseMystery}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold rounded-lg"
            >
              Awesome! 🎉
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
