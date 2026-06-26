import { useMemo } from 'react'
import { useGame } from '../contexts/GameContext'
import { TITLES, FRAMES, type Title } from '../data/titles'

interface TitleCardProps {
  title: Title
  isUnlocked: boolean
  isEquipped: boolean
  onEquip: () => void
}

function TitleCard({ title, isUnlocked, isEquipped, onEquip }: TitleCardProps) {
  const rarityColors = {
    common: 'border-slate-500 bg-slate-800',
    rare: 'border-blue-500 bg-blue-900/30',
    epic: 'border-purple-500 bg-purple-900/30',
    legendary: 'border-amber-500 bg-amber-900/30',
  }

  return (
    <div
      className={`relative p-4 rounded-xl border-2 transition-all ${
        isUnlocked ? rarityColors[title.rarity] : 'border-slate-700 bg-slate-800/50 opacity-60'
      } ${isEquipped ? 'ring-2 ring-amber-400' : ''}`}
    >
      {isEquipped && (
        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
          Equipped
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="text-3xl">{title.icon}</div>
        <div className="flex-1">
          <h3 className="font-bold text-white">{title.name}</h3>
          <p className="text-sm text-slate-400">{title.description}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded ${
              title.rarity === 'legendary' ? 'bg-amber-600' :
              title.rarity === 'epic' ? 'bg-purple-600' :
              title.rarity === 'rare' ? 'bg-blue-600' : 'bg-slate-600'
            }`}>
              {title.rarity}
            </span>
            {!isUnlocked && (
              <span className="text-xs text-slate-500">{title.requirement}</span>
            )}
          </div>
        </div>
      </div>
      {isUnlocked && !isEquipped && (
        <button
          onClick={onEquip}
          className="mt-3 w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
        >
          Equip
        </button>
      )}
    </div>
  )
}

interface FrameCardProps {
  frame: typeof FRAMES[0]
  isUnlocked: boolean
  isEquipped: boolean
  onEquip: () => void
}

function FrameCard({ frame, isUnlocked, isEquipped, onEquip }: FrameCardProps) {
  const rarityColors: Record<string, string> = {
    common: 'border-slate-500 bg-slate-800',
    rare: 'border-blue-500 bg-blue-900/30',
    epic: 'border-purple-500 bg-purple-900/30',
    legendary: 'border-amber-500 bg-amber-900/30',
  }

  return (
    <div
      className={`relative p-4 rounded-xl border-2 transition-all ${
        isUnlocked ? rarityColors[frame.rarity] : 'border-slate-700 bg-slate-800/50 opacity-60'
      } ${isEquipped ? 'ring-2 ring-amber-400' : ''}`}
    >
      {isEquipped && (
        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
          Equipped
        </div>
      )}
      <div className="flex items-center gap-3">
        <div
          className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl"
          style={{
            borderWidth: 4,
            borderStyle: 'solid',
            borderColor: typeof frame.colors.border === 'string' ? frame.colors.border : '#ffd700',
          }}
        >
          🧙
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white">{frame.name}</h3>
          <p className="text-sm text-slate-400">{frame.description}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded ${
              frame.rarity === 'legendary' ? 'bg-amber-600' :
              frame.rarity === 'epic' ? 'bg-purple-600' :
              frame.rarity === 'rare' ? 'bg-blue-600' : 'bg-slate-600'
            }`}>
              {frame.rarity}
            </span>
            {!isUnlocked && (
              <span className="text-xs text-slate-500">{frame.requirement}</span>
            )}
          </div>
        </div>
      </div>
      {isUnlocked && !isEquipped && (
        <button
          onClick={onEquip}
          className="mt-3 w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
        >
          Equip
        </button>
      )}
    </div>
  )
}

export default function TitlesFramesPage() {
  const { game, checkAndUnlockTitlesFrames } = useGame()
  const { character } = game
  const { equippedTitle, equippedFrame, unlockedTitles, unlockedFrames } = character

  // Check for newly unlockable titles/frames
  useMemo(() => {
    checkAndUnlockTitlesFrames()
  }, [checkAndUnlockTitlesFrames])

  const titlesByRarity = useMemo(() => ({
    legendary: TITLES.filter(t => t.rarity === 'legendary'),
    epic: TITLES.filter(t => t.rarity === 'epic'),
    rare: TITLES.filter(t => t.rarity === 'rare'),
    common: TITLES.filter(t => t.rarity === 'common'),
  }), [])

  const framesByRarity = useMemo(() => ({
    legendary: FRAMES.filter(f => f.rarity === 'legendary'),
    epic: FRAMES.filter(f => f.rarity === 'epic'),
    rare: FRAMES.filter(f => f.rarity === 'rare'),
    common: FRAMES.filter(f => f.rarity === 'common'),
  }), [])

  const equippedTitleData = TITLES.find(t => t.id === equippedTitle)
  const equippedFrameData = FRAMES.find(f => f.id === equippedFrame)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">🏅 Titles & Frames</h1>
        <p className="text-slate-400">Customize your hero's identity</p>
      </div>

      {/* Currently Equipped */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Currently Equipped</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-2">Title</div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{equippedTitleData?.icon || '📜'}</span>
              <div>
                <div className="font-bold text-white">{equippedTitleData?.name || 'None'}</div>
                <div className="text-sm text-slate-400">{equippedTitleData?.description}</div>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-2">Frame</div>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                style={{
                  borderWidth: 3,
                  borderStyle: 'solid',
                  borderColor: equippedFrameData?.colors.border || '#475569',
                }}
              >
                🧙
              </div>
              <div>
                <div className="font-bold text-white">{equippedFrameData?.name || 'None'}</div>
                <div className="text-sm text-slate-400">{equippedFrameData?.description}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Collection Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-amber-400">{unlockedTitles.length}</div>
            <div className="text-xs text-slate-400">/ {TITLES.length} Titles</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-400">{unlockedFrames.length}</div>
            <div className="text-xs text-slate-400">/ {FRAMES.length} Frames</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-400">{character.level}</div>
            <div className="text-xs text-slate-400">Current Level</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">{game.completedQuests.length}</div>
            <div className="text-xs text-slate-400">Quests Completed</div>
          </div>
        </div>
      </div>

      {/* Titles Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          📜 Titles
        </h2>

        {(['legendary', 'epic', 'rare', 'common'] as const).map(rarity => (
          <div key={rarity} className="mb-8">
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
              rarity === 'legendary' ? 'text-amber-400' :
              rarity === 'epic' ? 'text-purple-400' :
              rarity === 'rare' ? 'text-blue-400' : 'text-slate-400'
            }`}>
              {rarity === 'legendary' && '🐉 Legendary'}
              {rarity === 'epic' && '⭐ Epic'}
              {rarity === 'rare' && '💎 Rare'}
              {rarity === 'common' && '📦 Common'}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {titlesByRarity[rarity].map(title => (
                <TitleCard
                  key={title.id}
                  title={title}
                  isUnlocked={unlockedTitles.includes(title.id)}
                  isEquipped={equippedTitle === title.id}
                  onEquip={() => {}}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Frames Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          🖼️ Frames
        </h2>

        {(['legendary', 'epic', 'rare', 'common'] as const).map(rarity => (
          <div key={rarity} className="mb-8">
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
              rarity === 'legendary' ? 'text-amber-400' :
              rarity === 'epic' ? 'text-purple-400' :
              rarity === 'rare' ? 'text-blue-400' : 'text-slate-400'
            }`}>
              {rarity === 'legendary' && '💎 Legendary'}
              {rarity === 'epic' && '⭐ Epic'}
              {rarity === 'rare' && '💎 Rare'}
              {rarity === 'common' && '📦 Common'}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {framesByRarity[rarity].map(frame => (
                <FrameCard
                  key={frame.id}
                  frame={frame}
                  isUnlocked={unlockedFrames.includes(frame.id)}
                  isEquipped={equippedFrame === frame.id}
                  onEquip={() => {}}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
