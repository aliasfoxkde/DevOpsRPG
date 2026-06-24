// World Map data representing the SDLC journey

export interface MapLocation {
  id: string
  name: string
  icon: string
  type: 'realm' | 'sdlc' | 'milestone'
  realmId?: string
  sdlcPhase?: number
  description: string
  position: { x: number; y: number } // percentage position on map
  unlocksAtLevel?: number
  connectedTo: string[] // IDs of connected locations
  isSecret?: boolean
}

export interface SDLCPhase {
  id: number
  name: string
  icon: string
  description: string
  color: string
}

// SDLC phases that run through all realms
export const sdlcPhases: SDLCPhase[] = [
  { id: 1, name: 'Plan', icon: '📋', description: 'Planning and requirements', color: '#6366f1' },
  { id: 2, name: 'Code', icon: '💻', description: 'Writing and reviewing code', color: '#8b5cf6' },
  { id: 3, name: 'Build', icon: '🔨', description: 'Compiling and building', color: '#ec4899' },
  { id: 4, name: 'Test', icon: '🧪', description: 'Testing and quality assurance', color: '#f59e0b' },
  { id: 5, name: 'Deploy', icon: '🚀', description: 'Deployment and release', color: '#22c55e' },
  { id: 6, name: 'Operate', icon: '⚙️', description: 'Operating and maintaining', color: '#06b6d4' },
  { id: 7, name: 'Monitor', icon: '📊', description: 'Monitoring and feedback', color: '#ef4444' },
]

// World map locations representing the journey
export const worldMapLocations: MapLocation[] = [
  // Starting area - Village of Foundations
  {
    id: 'village_center',
    name: 'Village of Foundations',
    icon: '🏘️',
    type: 'realm',
    realmId: 'foundations',
    description: 'Every hero begins here. Master the ancient arts of markup and style.',
    position: { x: 50, y: 85 },
    unlocksAtLevel: 1,
    connectedTo: ['forest_entrance', 'coding_camp'],
  },

  // Forest of Scripts
  {
    id: 'forest_entrance',
    name: 'Forest of Scripts',
    icon: '🌲',
    type: 'realm',
    realmId: 'scripts',
    description: 'The forest hums with automation. Bash through the undergrowth.',
    position: { x: 75, y: 60 },
    unlocksAtLevel: 5,
    connectedTo: ['village_center', 'castle_grounds'],
  },

  // Castle of Frameworks
  {
    id: 'castle_grounds',
    name: 'Castle of Frameworks',
    icon: '🏰',
    type: 'realm',
    realmId: 'frameworks',
    description: 'Towering halls filled with powerful frameworks and data vaults.',
    position: { x: 50, y: 40 },
    unlocksAtLevel: 10,
    connectedTo: ['forest_entrance', 'cloud_base_camp'],
  },

  // Mountains of Cloud
  {
    id: 'cloud_base_camp',
    name: 'Mountains of Cloud',
    icon: '⛰️',
    type: 'realm',
    realmId: 'cloud',
    description: 'Scale the treacherous peaks where AWS storms rage.',
    position: { x: 25, y: 55 },
    unlocksAtLevel: 15,
    connectedTo: ['castle_grounds', 'citadel_entrance'],
  },

  // Citadel of DevOps (final area)
  {
    id: 'citadel_entrance',
    name: 'Citadel of DevOps',
    icon: '🏛️',
    type: 'realm',
    realmId: 'devops',
    description: 'The final bastion. Only true DevOps Masters may enter.',
    position: { x: 50, y: 20 },
    unlocksAtLevel: 20,
    connectedTo: ['cloud_base_camp', 'summit'],
  },

  // Summit of Mastery (endgame)
  {
    id: 'summit',
    name: 'Summit of Mastery',
    icon: '🏔️',
    type: 'milestone',
    description: 'The peak of DevOps mastery. You have become legendary!',
    position: { x: 50, y: 5 },
    connectedTo: ['citadel_entrance'],
    isSecret: true,
  },

  // SDLC waypoints - journey markers
  {
    id: 'coding_camp',
    name: 'Coding Camp',
    icon: '⛺',
    type: 'sdlc',
    sdlcPhase: 1,
    description: 'Plan your journey and set your goals.',
    position: { x: 60, y: 75 },
    connectedTo: ['village_center', 'sdlc_waypoint_2'],
  },
  {
    id: 'sdlc_waypoint_2',
    name: 'Code Review Peak',
    icon: '🔍',
    type: 'sdlc',
    sdlcPhase: 2,
    description: 'Review and refine your code.',
    position: { x: 70, y: 65 },
    connectedTo: ['coding_camp', 'sdlc_waypoint_3'],
  },
  {
    id: 'sdlc_waypoint_3',
    name: 'Build Station',
    icon: '🛠️',
    type: 'sdlc',
    sdlcPhase: 3,
    description: 'Build your projects with confidence.',
    position: { x: 60, y: 50 },
    connectedTo: ['sdlc_waypoint_2', 'sdlc_waypoint_4'],
  },
  {
    id: 'sdlc_waypoint_4',
    name: 'Testing Grounds',
    icon: '🧪',
    type: 'sdlc',
    sdlcPhase: 4,
    description: 'Test thoroughly before proceeding.',
    position: { x: 45, y: 45 },
    connectedTo: ['sdlc_waypoint_3', 'sdlc_waypoint_5'],
  },
  {
    id: 'sdlc_waypoint_5',
    name: 'Deployment Bay',
    icon: '🚀',
    type: 'sdlc',
    sdlcPhase: 5,
    description: 'Deploy to the world!',
    position: { x: 35, y: 35 },
    connectedTo: ['sdlc_waypoint_4', 'sdlc_waypoint_6'],
  },
  {
    id: 'sdlc_waypoint_6',
    name: 'Operations Center',
    icon: '⚡',
    type: 'sdlc',
    sdlcPhase: 6,
    description: 'Keep systems running smoothly.',
    position: { x: 40, y: 25 },
    connectedTo: ['sdlc_waypoint_5', 'sdlc_waypoint_7'],
  },
  {
    id: 'sdlc_waypoint_7',
    name: 'Monitoring Station',
    icon: '📡',
    type: 'sdlc',
    sdlcPhase: 7,
    description: 'Watch, learn, and improve.',
    position: { x: 45, y: 15 },
    connectedTo: ['sdlc_waypoint_6', 'summit'],
  },
]

// Calculate path progress for a player
export function calculateMapProgress(completedQuests: Set<string>, totalQuests: number): number {
  if (totalQuests === 0) return 0
  return Math.round((completedQuests.size / totalQuests) * 100)
}

// Get realm completion status
export function getRealmCompletionStatus(
  _realmId: string,
  _completedQuests: Set<string>,
  _realmTechnologies: string[]
): { completed: number; total: number; percentage: number } {
  // This would need quest data to calculate properly
  return { completed: 0, total: 0, percentage: 0 }
}
