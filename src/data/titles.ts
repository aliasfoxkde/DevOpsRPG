export interface Title {
  id: string
  name: string
  description: string
  icon: string
  requirement: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export const TITLES: Title[] = [
  // Common titles - Easy to unlock
  {
    id: 'novice-devops',
    name: 'DevOps Novice',
    description: 'Begin your DevOps journey',
    icon: '📜',
    requirement: 'Complete 5 quests',
    rarity: 'common',
  },
  {
    id: 'eager-learner',
    name: 'Eager Learner',
    description: 'Shows dedication to learning',
    icon: '📚',
    requirement: 'Complete 10 quests',
    rarity: 'common',
  },
  {
    id: 'quest-seeker',
    name: 'Quest Seeker',
    description: 'Always looking for the next challenge',
    icon: '🔍',
    requirement: 'Complete 15 quests',
    rarity: 'common',
  },
  // Rare titles - Medium difficulty
  {
    id: 'code-crusader',
    name: 'Code Crusader',
    description: 'A warrior against bugs and errors',
    icon: '⚔️',
    requirement: 'Complete 25 quests',
    rarity: 'rare',
  },
  {
    id: 'cloud-hopeful',
    name: 'Cloud Hopeful',
    description: 'Aiming for the skies',
    icon: '☁️',
    requirement: 'Complete 5 AWS quests',
    rarity: 'rare',
  },
  {
    id: 'container-captain',
    name: 'Container Captain',
    description: 'Master of Docker and containers',
    icon: '🚢',
    requirement: 'Complete 5 Docker quests',
    rarity: 'rare',
  },
  {
    id: 'git-guru',
    name: 'Git Guru',
    description: 'Version control expert',
    icon: '🌿',
    requirement: 'Complete 5 Git quests',
    rarity: 'rare',
  },
  {
    id: 'python-pro',
    name: 'Python Pro',
    description: 'Scripting and automation master',
    icon: '🐍',
    requirement: 'Complete 5 Python quests',
    rarity: 'rare',
  },
  // Epic titles - Hard to unlock
  {
    id: 'ci-cd-champion',
    name: 'CI/CD Champion',
    description: 'Pipelines are your domain',
    icon: '🔄',
    requirement: 'Complete 10 CI/CD quests',
    rarity: 'epic',
  },
  {
    id: 'kubernetes-knight',
    name: 'Kubernetes Knight',
    description: 'Orchestration specialist',
    icon: '🏰',
    requirement: 'Complete 10 Kubernetes quests',
    rarity: 'epic',
  },
  {
    id: 'infrastructure-inquisitor',
    name: 'Infrastructure Inquisitor',
    description: 'Terraform and IaC expert',
    icon: '🏗️',
    requirement: 'Complete 10 IaC quests',
    rarity: 'epic',
  },
  {
    id: 'monitoring-master',
    name: 'Monitoring Master',
    description: 'Observability is your superpower',
    icon: '📊',
    requirement: 'Complete 10 monitoring quests',
    rarity: 'epic',
  },
  {
    id: 'streak-slayer',
    name: 'Streak Slayer',
    description: 'Consistency is your weapon',
    icon: '🔥',
    requirement: 'Maintain a 14-day streak',
    rarity: 'epic',
  },
  // Legendary titles - Very hard
  {
    id: 'devops-dragon',
    name: 'DevOps Dragon',
    description: 'The ultimate DevOps master',
    icon: '🐉',
    requirement: 'Complete 100 quests',
    rarity: 'legendary',
  },
  {
    id: 'realm-ruler',
    name: 'Realm Ruler',
    description: 'Mastered all realms',
    icon: '👑',
    requirement: 'Complete all quests in every realm',
    rarity: 'legendary',
  },
  {
    id: 'almighty-architect',
    name: 'Almighty Architect',
    description: 'Can build anything from scratch',
    icon: '🏛️',
    requirement: 'Reach level 50',
    rarity: 'legendary',
  },
  {
    id: 'golden-gamer',
    name: 'Golden Gamer',
    description: 'A true completionist',
    icon: '🥇',
    requirement: 'Earn 50 badges',
    rarity: 'legendary',
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Fastest of them all',
    icon: '⚡',
    requirement: 'Complete a quest in under 30 seconds',
    rarity: 'legendary',
  },
]

export interface Frame {
  id: string
  name: string
  description: string
  icon: string
  requirement: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  colors: { border: string; glow: string }
}

export const FRAMES: Frame[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'The standard hero frame',
    icon: '⬜',
    requirement: 'Start your journey',
    rarity: 'common',
    colors: { border: '#475569', glow: 'rgba(71, 85, 105, 0.5)' },
  },
  {
    id: 'bronze',
    name: 'Bronze Frame',
    description: 'A bronze border for bronze heroes',
    icon: '🟫',
    requirement: 'Complete 10 quests',
    rarity: 'common',
    colors: { border: '#cd7f32', glow: 'rgba(205, 127, 50, 0.5)' },
  },
  {
    id: 'silver',
    name: 'Silver Frame',
    description: 'Silver reflects dedication',
    icon: '⬜',
    requirement: 'Complete 25 quests',
    rarity: 'rare',
    colors: { border: '#c0c0c0', glow: 'rgba(192, 192, 192, 0.5)' },
  },
  {
    id: 'gold',
    name: 'Gold Frame',
    description: 'Gold shimmers with achievement',
    icon: '🟨',
    requirement: 'Complete 50 quests',
    rarity: 'rare',
    colors: { border: '#ffd700', glow: 'rgba(255, 215, 0, 0.5)' },
  },
  {
    id: 'emerald',
    name: 'Emerald Frame',
    description: 'Green like the terminal',
    icon: '🟩',
    requirement: 'Complete 10 Python quests',
    rarity: 'epic',
    colors: { border: '#50c878', glow: 'rgba(80, 200, 120, 0.5)' },
  },
  {
    id: 'ruby',
    name: 'Ruby Frame',
    description: 'Red like the errors you fixed',
    icon: '🟥',
    requirement: 'Complete 10 Git quests',
    rarity: 'epic',
    colors: { border: '#e0115f', glow: 'rgba(224, 17, 95, 0.5)' },
  },
  {
    id: 'sapphire',
    name: 'Sapphire Frame',
    description: 'Blue like the cloud skies',
    icon: '🟦',
    requirement: 'Complete 10 AWS quests',
    rarity: 'epic',
    colors: { border: '#0f52ba', glow: 'rgba(15, 82, 186, 0.5)' },
  },
  {
    id: 'amethyst',
    name: 'Amethyst Frame',
    description: 'Purple like a sunset over servers',
    icon: '🟪',
    requirement: 'Complete 10 Docker quests',
    rarity: 'epic',
    colors: { border: '#9966cc', glow: 'rgba(153, 102, 204, 0.5)' },
  },
  {
    id: 'diamond',
    name: 'Diamond Frame',
    description: 'The rarest of them all',
    icon: '💎',
    requirement: 'Complete 100 quests',
    rarity: 'legendary',
    colors: { border: '#b9f2ff', glow: 'rgba(185, 242, 255, 0.7)' },
  },
  {
    id: 'prismatic',
    name: 'Prismatic Frame',
    description: 'A rainbow of accomplishments',
    icon: '🌈',
    requirement: 'Reach level 50',
    rarity: 'legendary',
    colors: { border: 'linear-gradient(135deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #8b00ff)', glow: 'rgba(255, 255, 255, 0.5)' },
  },
]

export function getTitleById(id: string): Title | undefined {
  return TITLES.find(t => t.id === id)
}

export function getFrameById(id: string) {
  return FRAMES.find(f => f.id === id)
}
