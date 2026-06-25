import { useState } from 'react'
import { Link } from 'react-router-dom'

interface FaqItem {
  question: string
  answer: string
  category?: string
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is DevOpsQuest?',
    answer: 'DevOpsQuest is an open-source gamified learning platform designed to make mastering DevOps concepts engaging and fun. Instead of passive watching or reading, you actively level up your character by completing real-world challenges across Linux, Git, Docker, Kubernetes, AWS, CI/CD, and more!',
    category: 'General'
  },
  {
    question: 'How does the game work?',
    answer: 'You create a character and progress through various "realms" by completing quests. Each quest tests your knowledge through quizzes based on real documentation. Complete quests to earn XP, level up, unlock new areas, and track your progress through the DevOps journey.',
    category: 'General'
  },
  {
    question: 'Is DevOpsQuest really free?',
    answer: 'Yes! DevOpsQuest is completely free and open source under the MIT License. We believe everyone should have access to quality DevOps education regardless of their background or resources.',
    category: 'General'
  },
  {
    question: 'What technologies can I learn?',
    answer: 'DevOpsQuest covers a wide range of technologies across multiple realms: HTML/CSS foundations, JavaScript, Git version control, SQL databases, Python and Bash scripting, Docker containers, React and Node.js frameworks, AWS cloud services, Kubernetes orchestration, Terraform infrastructure, CI/CD pipelines, Prometheus monitoring, security practices, and more!',
    category: 'Learning'
  },
  {
    question: 'How does XP and leveling work?',
    answer: 'You earn XP by completing quests. The amount of XP depends on the quest difficulty and your performance. Level up to unlock new realms and access more advanced topics. Higher levels also unlock special features and achievements.',
    category: 'Gameplay'
  },
  {
    question: 'What are streaks and how do they work?',
    answer: 'Streaks track how many consecutive days you\'ve completed at least one quest. Maintaining streaks earns bonus rewards and unlocks streak-specific achievements. Use streak shields to protect your streak if you miss a day!',
    category: 'Gameplay'
  },
  {
    question: 'What are the mini-games?',
    answer: 'Mini-games are side activities that let you practice DevOps skills in fun ways. Currently includes: Typing challenges (improve command syntax), Memory match (learn technology relationships), Math challenges (calculate resources), and Quick quizzes. More coming soon!',
    category: 'Gameplay'
  },
  {
    question: 'How do I earn gold?',
    answer: 'Gold is earned by completing quests and maintaining daily streaks. Spend gold in the shop on items like streak shields, hint potions, retry passes, and cosmetic items for your character!',
    category: 'Gameplay'
  },
  {
    question: 'What is the AI Pipeline Experiment?',
    answer: 'DevOpsQuest explores how large language models (LLMs) can generate dynamic learning content, adaptive quizzes, and personalized feedback. The AI doesn\'t generate the actual content—it converts real documentation and data into interactive quizzes, making learning more engaging and personalized.',
    category: 'Technical'
  },
  {
    question: 'How is the content generated?',
    answer: 'We use web scraping to pull content from authoritative sources like W3Schools. This content is then processed to create quiz questions that test your understanding. The AI pipeline helps personalize questions and create varied question formats.',
    category: 'Technical'
  },
  {
    question: 'Is my progress saved?',
    answer: 'Yes! Your progress is saved locally in your browser using localStorage. This includes your character stats, completed quests, earned badges, and all other progress. Note: Clearing browser data may reset your progress.',
    category: 'Technical'
  },
  {
    question: 'Can I contribute to the project?',
    answer: 'Absolutely! DevOpsQuest is open source and contributions are welcome. You can help by: reporting bugs, improving documentation, adding new quiz topics or questions, enhancing UI/UX, or improving the AI content generation pipeline. Check out our GitHub repository!',
    category: 'Community'
  },
  {
    question: 'How do I report a bug or suggest a feature?',
    answer: 'The best way is to open an issue on our GitHub repository. Please include as much detail as possible: what you were trying to do, what went wrong, and any error messages you saw. For suggestions, tell us what feature you\'d like and why it would improve your learning experience.',
    category: 'Community'
  },
  {
    question: 'What makes DevOpsQuest different from other learning platforms?',
    answer: 'Unlike passive video courses or text tutorials, DevOpsQuest uses gamification to keep you motivated. The RPG-style progression system, achievements, streaks, and visual progress tracking make learning DevOps feel like an adventure rather than a chore. Plus, it\'s completely free and open source!',
    category: 'General'
  },
  {
    question: 'Are there planned future features?',
    answer: 'Yes! We have a growing game library with 35+ games planned across Math, Science, Reading, Robotics, Trivia, and more. Upcoming features include: companions/pets, an in-game store, more mini-games, multiplayer challenges, leaderboards, and community features. Follow us on GitHub for updates!',
    category: 'General'
  },
]

const CATEGORIES = ['All', 'General', 'Learning', 'Gameplay', 'Technical', 'Community']

export default function FaqPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const filteredFaqs = selectedCategory === 'All'
    ? FAQ_ITEMS
    : FAQ_ITEMS.filter(faq => faq.category === selectedCategory)

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-400 mb-4">❓ Frequently Asked Questions</h1>
          <p className="text-xl text-slate-300">
            Everything you need to know about DevOpsQuest
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden hover:border-amber-600/30 transition-all"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
              >
                <div className="flex-1">
                  {faq.category && (
                    <span className="text-xs text-amber-400 font-medium mb-1 block">{faq.category}</span>
                  )}
                  <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                </div>
                <span className={`text-amber-400 text-2xl transition-transform ${expandedItems.has(index) ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>
              {expandedItems.has(index) && (
                <div className="px-6 pb-4">
                  <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-br from-amber-900/30 to-slate-800/50 rounded-2xl border border-amber-600/30 p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Still have questions?</h2>
          <p className="text-slate-300 mb-6">
            Can't find what you're looking for? Check out our GitHub or join the community!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/aliasfoxkde/DevOpsRPG"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              🐙 View on GitHub
            </a>
            <Link
              to="/about"
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors"
            >
              ℹ️ About DevOpsQuest
            </Link>
          </div>
        </div>

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
    </div>
  )
}
