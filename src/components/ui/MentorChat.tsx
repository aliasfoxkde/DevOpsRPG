import { useState, useEffect, useRef } from 'react'
import { useGame } from '../../contexts/GameContext'

// Escape HTML to prevent XSS
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface MentorResponse {
  keywords: string[]
  responses: string[]
}

// Mentor personality responses
const mentorResponses: MentorResponse[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'greetings'],
    responses: [
      "Greetings, brave adventurer! Your journey into DevOps mastery begins now!",
      "Welcome back, hero! The realm of knowledge awaits your exploration!",
      "Well met! Ready to defeat some quests and level up your skills?"
    ]
  },
  {
    keywords: ['help', 'stuck', 'confused', 'how do i'],
    responses: [
      "Every master was once a beginner! Check the Quest Journal for your next adventure.",
      "Need guidance? Visit the World Map to see which realms are within your reach!",
      "Don't worry - even the strongest heroes need to consult their maps. Try the Quest Journal!"
    ]
  },
  {
    keywords: ['xp', 'points', 'level', 'progress'],
    responses: [
      "XP is earned by completing quests! The harder the battle, the greater the reward!",
      "Complete quizzes to earn XP and watch your character grow stronger!",
      "Each quest conquered brings you closer to true DevOps mastery. Keep grinding!"
    ]
  },
  {
    keywords: ['quiz', 'question', 'answer', 'study'],
    responses: [
      "Quiz time! Study the material first, then test your knowledge. You've got this!",
      "When taking a quiz, press 'N' to speed through - it auto-answers for you!",
      "Knowledge is power! Each correct answer brings you closer to victory."
    ]
  },
  {
    keywords: ['hard', 'difficult', 'too hard', 'impossible'],
    responses: [
      "The greatest victories come from the toughest battles! You can do this!",
      "Even the tallest mountains can be conquered step by step. Keep trying!",
      "Remember: every expert was once a beginner. Persist, and you shall prevail!"
    ]
  },
  {
    keywords: ['easy', 'simple', 'too easy'],
    responses: [
      "Feeling confident? Try a harder realm or tackle the boss battles!",
      "Excellent! Perhaps it's time to challenge the Cloud Mountains or beyond!",
      "You've mastered the basics! The path to mastery continues ever onward."
    ]
  },
  {
    keywords: ['complete', 'finish', 'done', 'finished'],
    responses: [
      "Excellent work! Your dedication is inspiring. What quest shall we tackle next?",
      "Victory is yours! Your progress has been noted in the chronicles of heroes!",
      "Another quest conquered! Your legend grows stronger with each battle."
    ]
  },
  {
    keywords: ['map', 'world', 'explore', 'where'],
    responses: [
      "The World Map shows your epic journey through all the DevOps realms!",
      "Explore the world map to see which areas you've unlocked and what's ahead!",
      "From the Village of Foundations to the AI Nexus, your adventure awaits!"
    ]
  },
  {
    keywords: ['level', 'level up', 'leveling'],
    responses: [
      "Level up by earning XP! Each level unlocks new realms and challenges!",
      "The higher your level, the more powerful you become. Keep questing!",
      "Level progression opens doors to previously locked territories!"
    ]
  },
  {
    keywords: ['badges', 'achievements', 'collect', 'reward'],
    responses: [
      "Collect badges and achievements as you prove your DevOps prowess!",
      "Rare collectibles await those who explore every corner of this realm!",
      "Achievement hunting! I love your enthusiasm, brave hero!"
    ]
  },
  {
    keywords: ['skill', 'ability', 'power', 'strength'],
    responses: [
      "Your skills grow with each quest completed. The DevOps arts require dedication!",
      "Power comes from knowledge! Master all the technologies to become unstoppable!",
      "Each technology you learn adds new abilities to your heroic arsenal!"
    ]
  },
  {
    keywords: ['sad', 'frustrated', 'angry', 'annoyed'],
    responses: [
      "Even heroes face setbacks! Take a deep breath - you've got this!",
      "Frustration is the precursor to achievement. Keep pushing forward!",
      "The path of a hero is never easy, but the rewards are worth it!"
    ]
  },
  {
    keywords: ['happy', 'excited', 'awesome', 'amazing'],
    responses: [
      "Your enthusiasm lights the way! Onward to victory!",
      "I love your energy! Let's channel it into conquering more quests!",
      "The joy of learning is one of the greatest treasures. Keep that spark alive!"
    ]
  },
  {
    keywords: ['thank', 'thanks', 'appreciate'],
    responses: [
      "Your gratitude warms my heroic heart! Now go forth and conquer!",
      "The best heroes are those who appreciate the journey. Well said!",
      "Together we shall achieve greatness! Onward!"
    ]
  }
]

// Default responses when no keyword matches
const defaultResponses = [
  "Interesting question! The path of DevOps mastery has many facets. Keep exploring!",
  "Hmm, let me think... The best approach is often to just dive in and try!",
  "The ancient scrolls say: 'Knowledge shared is knowledge multiplied.' Keep asking questions!",
  "A wise hero knows when to consult the codex. Check the Quest Journal for guidance!",
  "Every interaction is a learning opportunity. What aspect of DevOps intrigues you most?",
  "The realm of DevOps is vast! Tell me more about what you're exploring.",
  "Curiosity is the hero's greatest tool. What would you like to discover next?",
  "The answer lies in practice and persistence. Which quest calls to you?"
]

/* eslint-disable react-refresh/only-export-components */
// Encouragement messages based on game events
export const encouragementMessages = {
  questComplete: [
    "Dazzling work! Another quest falls before your prowess!",
    "Victory! Your dedication to learning is inspiring!",
    "Excellent effort! Each quest completed makes you stronger!"
  ],
  levelUp: [
    "LEVEL UP! Your power grows ever stronger!",
    "A new milestone reached! Your legend expands!",
    "Level achieved! The realms bow to your growing power!"
  ],
  quizPassed: [
    "Brilliant! Your knowledge proves your worth!",
    "Quiz conquered! Your mind is a weapon!",
    "Correct answers all! Your study has paid off!"
  ],
  quizFailed: [
    "Not quite! But every failure teaches. Try again!",
    "The path to mastery has obstacles. Push through!",
    "Incorrect, but not defeated! Review and retry!"
  ],
  streakMilestone: [
    "INCREDIBLE STREAK! Your dedication is legendary!",
    "A chain of victories! Your commitment is admirable!",
    "Streak of champions! Keep the momentum going!"
  ],
  realmUnlocked: [
    "A NEW REALM UNLOCKED! Adventure awaits!",
    "The path opens to new territories! Explore wisely!",
    "New challenges emerge! Prepare yourself, hero!"
  ],
  noQuest: [
    "The path ahead is clear - all quests conquered! A true master!",
    "You've vanquished every challenge! Return daily for more adventures!",
    "A moment of respite, champion. New quests emerge each day!"
  ],
  dailyReward: [
    "Daily treasure acquired! Your dedication is rewarded!",
    "A gift for returning hero! Fortune favors the persistent!",
    "Daily login bonus! The adventurer's diligence pays off!"
  ]
}

function getContextualResponse(userMessage: string, game: {
  character: { level: number; xp: number; streakDays: number }
  completedQuests: { questId: string }[]
  stats: { quizCount: number; minigameCount: number }
}): string {
  const lowerMessage = userMessage.toLowerCase()

  // Context-aware responses based on game state
  if (lowerMessage.includes('progress') || lowerMessage.includes('stat') || lowerMessage.includes('how am i')) {
    const completed = game.completedQuests.length
    const level = game.character.level
    const streak = game.character.streakDays
    const quizzes = game.stats.quizCount
    const games = game.stats.minigameCount

    if (completed === 0) {
      return "You're just starting your journey! Head to the Quest Journal to begin your first quest. Every legendary hero starts with a single step!"
    } else if (completed < 5) {
      return `You've completed ${completed} quests so far! Keep up the momentum - you're building great habits. Your ${streak}-day streak shows real dedication!`
    } else if (completed < 20) {
      return `Impressive progress! ${completed} quests conquered, Level ${level}, and ${streak}-day streak! You're developing real DevOps skills. Ready for a harder challenge?`
    } else {
      return `Champion status! ${completed} quests, ${quizzes} quizzes passed, ${games} mini-games played. Your ${streak}-day streak is legendary! What realm shall we conquer next?`
    }
  }

  if (lowerMessage.includes('next') || lowerMessage.includes('where') || lowerMessage.includes('should i go')) {
    const completed = game.completedQuests.length
    if (completed === 0) {
      return "Start your adventure in the Village of Foundations! Look for quests with 💀 difficulty 1 - they're perfect for beginners. You can do this!"
    } else if (completed < 10) {
      return "You've got the basics down! Try exploring different realms on the World Map. Each realm unlocks at higher levels - keep grinding XP!"
    } else {
      return "You're ready for intermediate challenges! Check out the Cloud Native realm for Kubernetes and Docker content. The harder quests give more XP!"
    }
  }

  if (lowerMessage.includes('xp') || lowerMessage.includes('points') || lowerMessage.includes('level up')) {
    return `You currently have ${game.character.xp} XP at Level ${game.character.level}! Complete quests, pass quizzes, and play mini-games to earn more. The formula is simple: more action = more XP!`
  }

  if (lowerMessage.includes('streak') || lowerMessage.includes('daily')) {
    const streak = game.character.streakDays
    if (streak === 0) {
      return "No active streak yet! Complete a quest today to start your streak. Once you hit 7 days, you'll unlock the Week Warrior badge!"
    } else if (streak < 7) {
      return `Amazing! ${streak}-day streak! Just ${7 - streak} more days to become a Week Warrior! Keep that daily habit going - consistency is the DevOps way!`
    } else if (streak < 30) {
      return `Incredible ${streak}-day streak! You're in the champion tier. ${30 - streak} days until Monthly Master awaits - can you make it?`
    } else {
      return `LEGENDARY ${streak}-day streak! Your dedication is unmatched. You embody the true spirit of continuous learning that DevOps represents!`
    }
  }

  if (lowerMessage.includes('quiz') || lowerMessage.includes('study')) {
    return "Quizzes test your knowledge and award bonus XP when you pass! Score 80%+ to earn the Quiz Master badge. Study the topic material first for best results!"
  }

  if (lowerMessage.includes('help') || lowerMessage.includes('stuck') || lowerMessage.includes('confused')) {
    return "Every expert was once a beginner! If you're stuck: 1) Check the Quest Journal for available quests, 2) Review topic content before taking quizzes, 3) Don't skip the study material! Need specific help? Just ask!"
  }

  // Default keyword-based responses
  for (const responseGroup of mentorResponses) {
    for (const keyword of responseGroup.keywords) {
      if (lowerMessage.includes(keyword)) {
        const responses = responseGroup.responses
        return responses[Math.floor(Math.random() * responses.length)]
      }
    }
  }

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}

export default function MentorChat() {
  const { game } = useGame()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() => [{
    id: '1',
    text: `Welcome, brave adventurer! I'm your DevOps mentor. Currently at Level ${game.character.level} with ${game.character.xp} XP. How can I guide you today?`,
    isUser: false,
    timestamp: new Date()
  }])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate mentor thinking and response
    setTimeout(() => {
      const response = getContextualResponse(userMessage.text, {
        character: game.character,
        completedQuests: game.completedQuests,
        stats: game.stats
      })
      const mentorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, mentorMessage])
      setIsTyping(false)
    }, 800 + Math.random() * 400)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Mentor Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close mentor chat' : 'Open mentor chat'}
        aria-expanded={isOpen}
        className={`fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all transform hover:scale-110 ${
          isOpen
            ? 'bg-amber-600 hover:bg-amber-500 rotate-0'
            : 'bg-gradient-to-br from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 animate-bounce'
        }`}
        title="Chat with your Mentor"
      >
        {isOpen ? '✕' : '🧙‍♂️'}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-36 right-4 z-50 w-80 sm:w-96 max-h-[500px] bg-slate-800/95 backdrop-blur-lg rounded-2xl border border-amber-600/50 shadow-2xl flex flex-col overflow-hidden"
          role="dialog"
          aria-labelledby="mentor-chat-title"
          aria-modal="false"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-900/50 to-purple-900/50 px-4 py-3 border-b border-slate-700 flex items-center gap-3">
            <div className="text-3xl">🧙‍♂️</div>
            <div>
              <h3 id="mentor-chat-title" className="font-bold text-amber-400">DevOps Mentor</h3>
              <p className="text-xs text-slate-400">Your guide to mastery</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="ml-auto text-slate-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>

          {/* Character Status Bar */}
          <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-700 flex items-center gap-4 text-xs">
            <span className="text-amber-400">⚔️ Lvl {game.character.level}</span>
            <span className="text-green-400">✨ {game.character.xp} XP</span>
            <span className="text-purple-400">🔥 {game.character.streakDays} Day Streak</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" role="log" aria-live="polite" aria-label="Chat messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.isUser
                      ? 'bg-amber-600 text-white rounded-br-sm'
                      : 'bg-slate-700 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  {!message.isUser && (
                    <div className="text-xs mb-1">🧙‍♂️ Mentor</div>
                  )}
                  <p className="text-sm">{escapeHtml(message.text)}</p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-slate-200 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-700">
            <div className="flex gap-2">
              <label htmlFor="mentor-input" className="sr-only">Type your question</label>
              <input
                id="mentor-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask your mentor..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded-full px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                aria-label="Send message"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  input.trim()
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                📤
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              <button
                onClick={() => setInput('How do I earn XP?')}
                aria-label="Ask about XP"
                className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full"
              >
                XP Help
              </button>
              <button
                onClick={() => setInput('Where should I go next?')}
                aria-label="Ask for guidance"
                className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full"
              >
                Guidance
              </button>
              <button
                onClick={() => setInput('Show me my progress')}
                aria-label="Show my progress"
                className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full"
              >
                Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
