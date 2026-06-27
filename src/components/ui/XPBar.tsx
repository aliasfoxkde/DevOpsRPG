import { useGame, XP_PER_LEVEL } from '../../contexts/GameContext'

interface XPBarProps {
  compact?: boolean
}

export function XPBar({ compact = false }: XPBarProps) {
  const { game } = useGame()
  const { character } = game

  // Calculate XP within current level (XP above the threshold for previous levels)
  const xpInCurrentLevel = character.xp - (character.level - 1) * XP_PER_LEVEL
  const progressPercent = Math.min(100, (xpInCurrentLevel / XP_PER_LEVEL) * 100)

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-amber-400">LV {character.level}</span>
        <div
          className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={xpInCurrentLevel}
          aria-valuemin={0}
          aria-valuemax={XP_PER_LEVEL}
          aria-label="Experience progress"
        >
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs text-slate-400">{xpInCurrentLevel}/{XP_PER_LEVEL}</span>
        <span className="text-xs text-slate-500 ml-2" title="Total XP Earned">⚡{character.xp}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-amber-400">
          {character.title}
        </span>
        <span className="text-xs text-slate-400">
          {xpInCurrentLevel} / {XP_PER_LEVEL} XP to next level
        </span>
      </div>
      <div
        className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700"
        role="progressbar"
        aria-valuenow={xpInCurrentLevel}
        aria-valuemin={0}
        aria-valuemax={XP_PER_LEVEL}
        aria-label="Experience progress"
      >
        <div
          className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Level {character.level} • Total XP: {character.xp}</span>
        <span className="text-amber-400 font-medium">+{XP_PER_LEVEL - xpInCurrentLevel} XP to Level Up</span>
      </div>
    </div>
  )
}
