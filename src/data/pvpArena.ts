export interface PVPRank {
  id: string
  name: string
  icon: string
  minPoints: number
  maxPoints: number
  color: string
  rewards?: {
    bonusXP?: number
    bonusGold?: number
  }
}

export const PVP_RANKS: PVPRank[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    icon: '🥉',
    minPoints: 0,
    maxPoints: 999,
    color: '#cd7f32',
    rewards: { bonusXP: 1.1, bonusGold: 1.1 },
  },
  {
    id: 'silver',
    name: 'Silver',
    icon: '🥈',
    minPoints: 1000,
    maxPoints: 2499,
    color: '#c0c0c0',
    rewards: { bonusXP: 1.2, bonusGold: 1.2 },
  },
  {
    id: 'gold',
    name: 'Gold',
    icon: '🥇',
    minPoints: 2500,
    maxPoints: 4999,
    color: '#ffd700',
    rewards: { bonusXP: 1.3, bonusGold: 1.3 },
  },
  {
    id: 'platinum',
    name: 'Platinum',
    icon: '💎',
    minPoints: 5000,
    maxPoints: 9999,
    color: '#e5e4e2',
    rewards: { bonusXP: 1.4, bonusGold: 1.4 },
  },
  {
    id: 'diamond',
    name: 'Diamond',
    icon: '💠',
    minPoints: 10000,
    maxPoints: 19999,
    color: '#b9f2ff',
    rewards: { bonusXP: 1.5, bonusGold: 1.5 },
  },
  {
    id: 'master',
    name: 'Master',
    icon: '🏆',
    minPoints: 20000,
    maxPoints: 39999,
    color: '#ff6b6b',
    rewards: { bonusXP: 1.75, bonusGold: 1.75 },
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    icon: '👑',
    minPoints: 40000,
    maxPoints: Infinity,
    color: '#9b59b6',
    rewards: { bonusXP: 2.0, bonusGold: 2.0 },
  },
]

export interface PVPMatch {
  id: string
  opponentName: string
  opponentAvatar: string
  opponentRank: string
  difficulty: 'easy' | 'medium' | 'hard'
  rewardMultiplier: number
  questions: PVPQuestion[]
  timeLimit: number // seconds
}

export interface PVPQuestion {
  question: string
  options: string[]
  correctIndex: number
  topic: string
}

export interface PVPMatchResult {
  won: boolean
  pointsEarned: number
  pointsLost: number
  xpEarned: number
  goldEarned: number
  correctAnswers: number
  totalQuestions: number
  timeSpent: number // seconds
}

// AI opponent names and avatars for PvP
export const PVP_OPPONENTS = [
  { name: 'CodeKnight', avatar: '🧙‍♂️', rank: 'silver' },
  { name: 'DockerDiva', avatar: '🧝‍♀️', rank: 'gold' },
  { name: 'GitGuru', avatar: '🧝', rank: 'silver' },
  { name: 'PipelinePro', avatar: '🤖', rank: 'platinum' },
  { name: 'CloudCaptain', avatar: '🏴‍☠️', rank: 'gold' },
  { name: 'K8sKnight', avatar: '⚔️', rank: 'diamond' },
  { name: 'TerraformTitan', avatar: '🗿', rank: 'platinum' },
  { name: 'AnsibleAce', avatar: '🎯', rank: 'silver' },
  { name: 'LinuxLegend', avatar: '🦁', rank: 'gold' },
  { name: 'SecuritySage', avatar: '🦊', rank: 'diamond' },
  { name: 'NetworkNinja', avatar: '🥷', rank: 'master' },
  { name: 'DatabaseDragon', avatar: '🐲', rank: 'grandmaster' },
]

// Sample PvP questions by topic
export const PVP_QUESTIONS: Record<string, PVPQuestion[]> = {
  git: [
    { question: 'What command stages changes for commit?', options: ['git stage', 'git commit', 'git push', 'git add'], correctIndex: 3, topic: 'Git' },
    { question: 'Which command creates a new branch?', options: ['git branch new', 'git checkout -b new', 'git new branch', 'git split'], correctIndex: 1, topic: 'Git' },
    { question: 'What does git merge do?', options: ['Deletes branches', 'Combines branch histories', 'Creates tags', 'Stages files'], correctIndex: 1, topic: 'Git' },
  ],
  docker: [
    { question: 'What command builds a Docker image?', options: ['docker run', 'docker build', 'docker create', 'docker start'], correctIndex: 1, topic: 'Docker' },
    { question: 'What is a Dockerfile instruction for running commands during build?', options: ['RUN', 'CMD', 'ENTRYPOINT', 'EXEC'], correctIndex: 0, topic: 'Docker' },
    { question: 'What does docker-compose do?', options: ['Builds single images', 'Orchestrates multi-container apps', 'Monitors containers', 'Manages networks'], correctIndex: 1, topic: 'Docker' },
  ],
  kubernetes: [
    { question: 'What is the basic deployable unit in K8s?', options: ['Pod', 'Node', 'Cluster', 'Service'], correctIndex: 0, topic: 'Kubernetes' },
    { question: 'What does a Service in K8s provide?', options: ['Storage', 'Network abstraction', 'CPU resources', 'Memory'], correctIndex: 1, topic: 'Kubernetes' },
    { question: 'What command lists K8s pods?', options: ['kubectl get pods', 'kubectl list pods', 'kubectl show pods', 'kubectl display pods'], correctIndex: 0, topic: 'Kubernetes' },
  ],
  aws: [
    { question: 'What is AWS S3?', options: ['Compute service', 'Storage service', 'Database service', 'Network service'], correctIndex: 1, topic: 'AWS' },
    { question: 'What does EC2 stand for?', options: ['Elastic Compute Cloud', 'Enterprise Compute Link', 'Efficient Container Cluster', 'Edge Content Cache'], correctIndex: 0, topic: 'AWS' },
    { question: 'What service provides serverless functions?', options: ['EC2', 'Lambda', 'ECS', 'EKS'], correctIndex: 1, topic: 'AWS' },
  ],
  terraform: [
    { question: 'What is Terraform used for?', options: ['Container orchestration', 'Infrastructure as Code', 'Monitoring', 'CI/CD'], correctIndex: 1, topic: 'Terraform' },
    { question: 'What command initializes a Terraform working directory?', options: ['terraform start', 'terraform init', 'terraform new', 'terraform setup'], correctIndex: 1, topic: 'Terraform' },
    { question: 'What does terraform plan do?', options: ['Applies changes', 'Shows execution plan', 'Destroys resources', 'Formats code'], correctIndex: 1, topic: 'Terraform' },
  ],
  cicd: [
    { question: 'What does CI in CI/CD stand for?', options: ['Continuous Integration', 'Container Infrastructure', 'Code Inspection', 'Central Integration'], correctIndex: 0, topic: 'CI/CD' },
    { question: 'What is CD in CI/CD?', options: ['Container Deployment', 'Continuous Delivery/Deployment', 'Code Development', 'Central Delivery'], correctIndex: 1, topic: 'CI/CD' },
    { question: 'What is a pipeline in CI/CD?', options: ['A physical pipe', 'Automated workflow', 'Debugging tool', 'Testing framework'], correctIndex: 1, topic: 'CI/CD' },
  ],
}

export function getRankByPoints(points: number): PVPRank {
  for (let i = PVP_RANKS.length - 1; i >= 0; i--) {
    if (points >= PVP_RANKS[i].minPoints) {
      return PVP_RANKS[i]
    }
  }
  return PVP_RANKS[0]
}

export function getRankProgress(points: number): { current: PVPRank; next: PVPRank | null; progress: number } {
  const current = getRankByPoints(points)
  const currentIndex = PVP_RANKS.findIndex(r => r.id === current.id)
  const next = currentIndex < PVP_RANKS.length - 1 ? PVP_RANKS[currentIndex + 1] : null

  if (!next) {
    return { current, next: null, progress: 100 }
  }

  const rankRange = current.maxPoints - current.minPoints
  const pointsInRank = points - current.minPoints
  const progress = Math.min(100, (pointsInRank / rankRange) * 100)

  return { current, next, progress }
}

export function generatePVPMatch(playerPoints: number): PVPMatch {
  // Select opponent based on player rank
  const playerRank = getRankByPoints(playerPoints)
  const rankIndex = PVP_RANKS.findIndex(r => r.id === playerRank.id)

  // Allow matching with opponents from adjacent ranks
  const minOpponentIndex = Math.max(0, rankIndex - 1)
  const maxOpponentIndex = Math.min(PVP_RANKS.length - 1, rankIndex + 1)
  const opponentRankIndex = minOpponentIndex + Math.floor(Math.random() * (maxOpponentIndex - minOpponentIndex + 1))

  // Filter opponents by rank
  const suitableOpponents = PVP_OPPONENTS.filter(o => {
    const oRankIndex = PVP_RANKS.findIndex(r => r.id === o.rank)
    return Math.abs(oRankIndex - opponentRankIndex) <= 1
  })

  const opponent = suitableOpponents.length > 0
    ? suitableOpponents[Math.floor(Math.random() * suitableOpponents.length)]
    : PVP_OPPONENTS[Math.floor(Math.random() * PVP_OPPONENTS.length)]

  // Determine difficulty based on rank difference
  const difficulty = opponentRankIndex <= rankIndex - 1 ? 'easy' : opponentRankIndex >= rankIndex + 1 ? 'hard' : 'medium'

  // Reward multiplier based on difficulty
  const rewardMultiplier = difficulty === 'easy' ? 1.0 : difficulty === 'medium' ? 1.25 : 1.5

  // Generate match questions from random topics
  const topics = Object.keys(PVP_QUESTIONS)
  const selectedTopics = topics.sort(() => Math.random() - 0.5).slice(0, 3)
  const questions: PVPQuestion[] = []

  for (const topic of selectedTopics) {
    const topicQuestions = PVP_QUESTIONS[topic]
    const shuffled = topicQuestions.sort(() => Math.random() - 0.5)
    questions.push(...shuffled.slice(0, 2))
  }

  // Shuffle all questions
  const finalQuestions = questions.sort(() => Math.random() - 0.5).slice(0, 5)

  return {
    id: `match-${Date.now()}`,
    opponentName: opponent.name,
    opponentAvatar: opponent.avatar,
    opponentRank: opponent.rank,
    difficulty,
    rewardMultiplier,
    questions: finalQuestions,
    timeLimit: 60, // 60 seconds total for the match
  }
}

export function calculatePVPRewards(
  won: boolean,
  difficulty: 'easy' | 'medium' | 'hard',
  correctAnswers: number,
  totalQuestions: number,
  playerRank: PVPRank
): PVPMatchResult {
  const basePoints = won ? 50 : 25
  const difficultyBonus = difficulty === 'easy' ? 0.75 : difficulty === 'medium' ? 1.0 : 1.25
  const accuracyBonus = correctAnswers / totalQuestions

  const pointsEarned = won ? Math.round(basePoints * difficultyBonus * accuracyBonus) : 0
  const pointsLost = won ? 0 : Math.round(basePoints * 0.5)

  const rankMultiplier = playerRank.rewards?.bonusXP || 1.0
  const xpEarned = Math.round((won ? 100 : 30) * difficultyBonus * accuracyBonus * rankMultiplier)
  const goldEarned = Math.round((won ? 50 : 15) * difficultyBonus * accuracyBonus * rankMultiplier)

  return {
    won,
    pointsEarned,
    pointsLost,
    xpEarned,
    goldEarned,
    correctAnswers,
    totalQuestions,
    timeSpent: 0, // Will be calculated during match
  }
}
