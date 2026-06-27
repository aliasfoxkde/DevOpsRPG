import { useGame } from '../contexts/GameContext'
import { SKILL_TREES, type Skill, getSkillBonuses, meetsRequirements, getRecommendedSkill } from '../data/skills'

export default function SkillsPage() {
  const { game, allocateSkillPoint, getSkillLevel, getAvailableSkillPoints, getSkillXp, getSkillLevelFromXp } = useGame()
  const availablePoints = getAvailableSkillPoints()
  const skillAllocations = game.character.skillAllocations

  // XP thresholds for each level (0-10)
  const XP_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250]

  const getXpProgress = (skillId: string) => {
    const xp = getSkillXp(skillId)
    const level = getSkillLevelFromXp(xp)
    const currentThreshold = XP_THRESHOLDS[level] || 0
    const nextThreshold = XP_THRESHOLDS[level + 1] || XP_THRESHOLDS[10]
    const progress = level >= 10 ? 100 : Math.round(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
    return { xp, level, progress }
  }

  const canLevelUp = (skill: Skill, currentLevel: number) => {
    if (availablePoints <= 0) return false
    if (currentLevel >= skill.maxLevel) return false
    if (!meetsRequirements(skill, skillAllocations)) return false
    return true
  }

  // Get all active bonuses
  const activeBonuses = getSkillBonuses(skillAllocations)

  // Get recommended skill for each tree
  const recommendedSkills = SKILL_TREES.map(tree => ({
    tree,
    recommended: getRecommendedSkill(tree, skillAllocations, availablePoints)
  }))

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-slate-100">Skill Tree</h1>
        <p className="text-slate-400">Spend skill points to unlock abilities and enhance your powers</p>
      </div>

      {/* Skill Points Available */}
      <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/20 rounded-xl border border-amber-600/50 p-6 mb-8 text-center">
        <div className="flex items-center justify-center gap-4">
          <div className="text-6xl font-bold text-amber-400">{availablePoints}</div>
          <div className="text-left">
            <div className="text-xl font-bold text-white">Skill Points Available</div>
            <div className="text-sm text-amber-200/80">
              {availablePoints === 0
                ? 'Complete more quests to earn skill points!'
                : availablePoints === 1
                ? 'Spend your point to unlock a new ability!'
                : 'Spend your points to unlock new abilities!'}
            </div>
          </div>
        </div>
      </div>

      {/* Active Bonuses Display */}
      {activeBonuses.length > 0 && (
        <div className="bg-slate-800/80 rounded-xl border border-green-600/50 p-4 mb-8">
          <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
            <span>✨</span> Active Skill Bonuses
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {activeBonuses.map((bonus, bonusIdx) => (
              <div key={bonusIdx} className="bg-green-900/30 rounded-lg p-2 border border-green-700/30">
                <div className="text-sm font-medium text-green-300">{bonus.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Trees */}
      <div className="space-y-8">
        {recommendedSkills.map(({ tree, recommended }) => (
          <div key={tree.id} className="bg-slate-800/80 rounded-xl border border-slate-700 p-6">
            {/* Tree Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">{tree.icon}</div>
              <div>
                <h2 className="text-2xl font-bold text-slate-100">{tree.name}</h2>
                <p className="text-sm text-slate-400">{tree.description}</p>
              </div>
            </div>

            {/* Recommended Path Indicator */}
            {recommended && (
              <div className="mb-4 p-2 bg-amber-900/20 rounded-lg border border-amber-600/30 flex items-center gap-2">
                <span className="text-amber-400">💡</span>
                <span className="text-sm text-amber-200">Recommended: Level up <strong>{recommended.name}</strong> next</span>
              </div>
            )}

            {/* Skill Tree Grid with Connections */}
            <div className="relative">
              {/* Vertical connection lines */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-600/50" />

              <div className="space-y-3">
                {tree.skills.map((skill) => {
                  const currentLevel = getSkillLevel(skill.id)
                  const { xp, level } = getXpProgress(skill.id)
                  const isMaxed = level >= skill.maxLevel
                  const isRecommended = recommended?.id === skill.id
                  const requirementsMet = meetsRequirements(skill, skillAllocations)
                  const canUpgrade = canLevelUp(skill, currentLevel)
                  const xpProgress = isMaxed ? 100 : Math.round(((xp - XP_THRESHOLDS[level]) / (XP_THRESHOLDS[level + 1] - XP_THRESHOLDS[level])) * 100)

                  return (
                    <div key={skill.id} className="relative flex items-start gap-4">
                      {/* Connection dot */}
                      <div className={`relative z-10 w-4 h-4 rounded-full mt-4 ${
                        level > 0 ? 'bg-amber-500' :
                        requirementsMet ? 'bg-blue-500' : 'bg-slate-600'
                      }`} />

                      {/* Skill Card */}
                      <div
                        className={`flex-1 p-4 rounded-lg border transition-all ${
                          isMaxed
                            ? 'bg-amber-900/30 border-amber-500/50'
                            : !requirementsMet
                            ? 'bg-slate-800/50 border-slate-700/50 opacity-60'
                            : currentLevel > 0
                            ? 'bg-blue-900/20 border-blue-600/50'
                            : 'bg-slate-800/50 border-slate-700'
                        } ${isRecommended && !isMaxed ? 'ring-2 ring-amber-500/50' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {/* Skill Icon */}
                            <div className={`text-3xl ${!requirementsMet ? 'grayscale opacity-50' : isMaxed ? '' : currentLevel > 0 ? '' : 'grayscale opacity-50'}`}>
                              {skill.icon}
                            </div>

                            <div className="flex-1">
                              {/* Skill Name & Level */}
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-bold ${isMaxed ? 'text-amber-400' : 'text-white'}`}>
                                  {skill.name}
                                </h3>
                                {isMaxed && (
                                  <span className="px-2 py-0.5 bg-amber-600 text-white text-xs font-bold rounded-full">
                                    MASTER
                                  </span>
                                )}
                                {!requirementsMet && (
                                  <span className="px-2 py-0.5 bg-slate-600 text-slate-300 text-xs font-medium rounded-full">
                                    🔒 Locked
                                  </span>
                                )}
                              </div>

                              {/* Description */}
                              <p className="text-sm text-slate-400 mb-2">{skill.description}</p>

                              {/* Requirements */}
                              {skill.requires && skill.requires.length > 0 && (
                                <div className="flex items-center gap-1 mb-2 text-xs text-slate-500">
                                  <span>Requires:</span>
                                  {skill.requires.map((reqId, i) => {
                                    const reqSkill = tree.skills.find(s => s.id === reqId)
                                    const reqMet = (skillAllocations[reqId] || 0) > 0
                                    return (
                                      <span key={reqId} className={reqMet ? 'text-green-400' : 'text-red-400'}>
                                        {reqSkill?.name || reqId}{i < skill.requires!.length - 1 ? ', ' : ''}
                                      </span>
                                    )
                                  })}
                                </div>
                              )}

                              {/* XP Progress Bar */}
                              <div className="mb-2">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-slate-500">XP Progress</span>
                                  <span className="text-amber-400 font-medium">{xp} XP</span>
                                </div>
                                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-300 ${
                                      isMaxed ? 'bg-amber-500' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${Math.min(100, xpProgress)}%` }}
                                  />
                                </div>
                              </div>

                              {/* Level indicator */}
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-slate-500">LVL</span>
                                <div className="flex gap-0.5">
                                  {Array.from({ length: skill.maxLevel }).map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-3 h-3 rounded-sm ${
                                        i < level
                                          ? 'bg-amber-500'
                                          : 'bg-slate-700'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-amber-400 font-medium">
                                  {level}/{skill.maxLevel}
                                </span>
                              </div>

                              {/* Benefits at max level */}
                              {skill.benefits && isMaxed && (
                                <div className="mt-2 p-2 bg-green-900/20 rounded border border-green-700/30">
                                  <div className="text-xs text-green-400 font-medium mb-1">Max Level Benefits:</div>
                                  <ul className="text-xs text-green-300/80 space-y-0.5">
                                    {skill.benefits.map((benefit, i) => (
                                      <li key={i}>✓ {benefit}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Upgrade button */}
                          <div className="ml-4">
                            {isMaxed ? (
                              <div className="text-amber-400 text-sm font-bold px-3 py-1">
                                MAX
                              </div>
                            ) : !requirementsMet ? (
                              <div className="text-slate-500 text-xs px-2 py-1">
                                🔒
                              </div>
                            ) : (
                              <button
                                onClick={() => allocateSkillPoint(skill.id)}
                                disabled={!canUpgrade}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                  canUpgrade
                                    ? 'bg-amber-600 hover:bg-amber-500 text-white hover:scale-105'
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                +1
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Technology XP Section */}
      <div className="mt-8 bg-slate-800/80 rounded-xl border border-slate-700 p-6">
        <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
          <span>📊</span> Technology Mastery
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Earn XP by completing quests in each technology. Higher XP unlocks higher skill levels.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(game.skillXp || {}).map(([techId, xp]) => {
            const typedXp = xp as number
            const level = getSkillLevelFromXp(typedXp)
            const techName = techId.charAt(0).toUpperCase() + techId.slice(1)
            const progressPercent = Math.min(100, (typedXp / 1000) * 100)
            return (
              <div key={techId} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-200">{techName}</span>
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Lv {level}</span>
                </div>
                <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400">{typedXp} XP</span>
              </div>
            )
          })}
          {Object.keys(game.skillXp || {}).length === 0 && (
            <p className="text-slate-500 text-sm col-span-full text-center py-4">
              Complete quests to earn technology XP!
            </p>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-slate-800/80 rounded-xl border border-slate-700 p-6">
        <h3 className="font-bold text-slate-100 mb-3 flex items-center gap-2">
          <span>💡</span> Tips
        </h3>
        <ul className="text-sm text-slate-400 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>You earn 1 skill point for each level you gain</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>Each skill can be leveled up to its max level (some skills have prerequisites)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>Follow the recommended path for optimal progression</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>Balance your skills across different trees for versatility</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>Technology XP is earned by completing quests in each technology</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
