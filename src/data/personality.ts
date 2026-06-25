// Player personality and traits system
export interface PersonalityTrait {
  id: string
  name: string
  description: string
  icon: string
  value: number // -100 to 100
}

export interface PlayerProfile {
  name: string
  title: string
  class: string
  background: string
  goals: string[]
  interests: string[]
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  learningStyle: 'visual' | 'hands-on' | 'reading' | 'video'
  preferredPace: 'slow' | 'steady' | 'intensive'
  discoveredTraits: string[] // trait IDs they've shown
  storyProgress: number // 0-100
  milestones: string[] // key moments achieved
}

export const TRAITS: PersonalityTrait[] = [
  // Core personality traits
  { id: 'curious', name: 'Curious', description: 'Always asking why and exploring', icon: '🔍', value: 0 },
  { id: 'persistent', name: 'Persistent', description: 'Never gives up on a problem', icon: '💪', value: 0 },
  { id: 'methodical', name: 'Methodical', description: 'Prefers systematic approaches', icon: '📋', value: 0 },
  { id: 'creative', name: 'Creative', description: 'Thinks outside the box', icon: '🎨', value: 0 },
  { id: 'social', name: 'Social', description: 'Learns well with others', icon: '👥', value: 0 },
  { id: 'independent', name: 'Independent', description: 'Prefers self-study', icon: '🏔️', value: 0 },
  { id: 'competitive', name: 'Competitive', description: 'Motivated by challenges', icon: '🏆', value: 0 },
  { id: 'collaborative', name: 'Collaborative', description: 'Values team success', icon: '🤝', value: 0 },
  { id: 'risk_taker', name: 'Risk Taker', description: 'Dives into difficult problems', icon: '🎲', value: 0 },
  { id: 'cautious', name: 'Cautious', description: 'Thinks before acting', icon: '🛡️', value: 0 },
  { id: 'impatient', name: 'Impatient', description: 'Wants quick results', icon: '⚡', value: 0 },
  { id: 'patient', name: 'Patient', description: 'Takes time to understand', icon: '🧘', value: 0 },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Details matter', icon: '🔬', value: 0 },
  { id: 'pragmatic', name: 'Pragmatic', description: 'Results over perfection', icon: '🛠️', value: 0 },
]

export const BACKGROUNDS = [
  { id: 'student', name: 'Student', icon: '🎓', description: 'Learning as part of education' },
  { id: 'career_change', name: 'Career Changer', icon: '🔄', description: 'Transitioning from another field' },
  { id: 'self_taught', name: 'Self-Taught', icon: '📚', description: 'Learning on your own' },
  { id: 'professional', name: 'Professional', icon: '💼', description: 'Already working in tech' },
  { id: 'hobbyist', name: 'Hobbyist', icon: '🎯', description: 'Learning for fun' },
  { id: 'entrepreneur', name: 'Entrepreneur', icon: '🚀', description: 'Building your own projects' },
]

export const GOALS = [
  { id: 'job_ready', name: 'Get job-ready', icon: '💼' },
  { id: 'career_advancement', name: 'Advance my career', icon: '📈' },
  { id: 'freelance', name: 'Become freelance', icon: '🌐' },
  { id: 'startup', name: 'Start a company', icon: '🏗️' },
  { id: 'personal_project', name: 'Build personal projects', icon: '🧪' },
  { id: 'understand_devops', name: 'Understand DevOps culture', icon: '🔧' },
]

export const INTERESTS = [
  { id: 'web_dev', name: 'Web Development', icon: '🌐' },
  { id: 'cloud', name: 'Cloud Computing', icon: '☁️' },
  { id: 'automation', name: 'Automation', icon: '⚙️' },
  { id: 'security', name: 'Security', icon: '🔒' },
  { id: 'data', name: 'Data Engineering', icon: '📊' },
  { id: 'ai_ml', name: 'AI/ML', icon: '🤖' },
  { id: 'mobile', name: 'Mobile Development', icon: '📱' },
  { id: 'gaming', name: 'Game Development', icon: '🎮' },
]

export const LEARNING_STYLES = [
  { id: 'visual', name: 'Visual', icon: '👁️', description: 'Learn through diagrams and visuals' },
  { id: 'hands_on', name: 'Hands-on', icon: '👐', description: 'Learn by doing and experimenting' },
  { id: 'reading', name: 'Reading', icon: '📖', description: 'Learn through documentation' },
  { id: 'video', name: 'Video', icon: '🎬', description: 'Learn through videos and tutorials' },
]

// Track trait changes based on player actions
export function updateTrait(traits: PersonalityTrait[], traitId: string, delta: number): PersonalityTrait[] {
  return traits.map(t => {
    if (t.id === traitId) {
      return { ...t, value: Math.max(-100, Math.min(100, t.value + delta)) }
    }
    return t
  })
}

// Get dominant traits
export function getDominantTraits(traits: PersonalityTrait[], count = 3): PersonalityTrait[] {
  return [...traits]
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, count)
}

// Generate character title based on traits
export function generateCharacterTitle(traits: PersonalityTrait[], level: number): string {
  const dominant = getDominantTraits(traits, 2)

  if (level >= 20) return 'DevOps Grandmaster'
  if (level >= 15) {
    if (dominant.some(t => t.id === 'methodical')) return 'DevOps Architect'
    if (dominant.some(t => t.id === 'creative')) return 'DevOps Innovator'
    if (dominant.some(t => t.id === 'patient')) return 'DevOps Sage'
    return 'DevOps Master'
  }
  if (level >= 10) {
    if (dominant.some(t => t.id === 'curious')) return 'DevOps Explorer'
    if (dominant.some(t => t.id === 'persistent')) return 'DevOps Veteran'
    if (dominant.some(t => t.id === 'competitive')) return 'DevOps Champion'
    return 'DevOps Expert'
  }
  if (level >= 5) {
    if (dominant.some(t => t.id === 'cautious')) return 'DevOps Guardian'
    if (dominant.some(t => t.id === 'risk_taker')) return 'DevOps Pioneer'
    return 'DevOps Adept'
  }
  return 'DevOps Apprentice'
}

// Story beats based on progress
export interface StoryBeat {
  id: string
  title: string
  description: string
  triggerProgress: number
  unlocked: boolean
}

export const STORY_BEATS: StoryBeat[] = [
  { id: 'first_quest', title: 'First Steps', description: 'Begin your DevOps journey', triggerProgress: 1, unlocked: false },
  { id: 'foundation_complete', title: 'Foundation Master', description: 'Complete all foundational quests', triggerProgress: 15, unlocked: false },
  { id: 'script_knight', title: 'Script Knight', description: 'Master Python and Bash', triggerProgress: 30, unlocked: false },
  { id: 'framework_hero', title: 'Framework Hero', description: 'Conquer React and Node.js', triggerProgress: 50, unlocked: false },
  { id: 'cloud_climber', title: 'Cloud Climber', description: 'Reach the AWS Mountains', triggerProgress: 70, unlocked: false },
  { id: 'devops_initiate', title: 'DevOps Initiate', description: 'Enter the Citadel', triggerProgress: 85, unlocked: false },
  { id: 'devops_master', title: 'DevOps Master', description: 'Complete the final quest', triggerProgress: 100, unlocked: false },
]
