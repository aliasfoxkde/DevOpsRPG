import { useState, useRef } from 'react'

interface Challenge {
  id: string
  title: string
  description: string
  language: 'html' | 'css' | 'javascript'
  initialCode: string
  expectedOutput?: string
  hints: string[]
  xpReward: number
}

const challenges: Challenge[] = [
  {
    id: 'html-heading',
    title: 'Create a Heading',
    description: 'Learn to create a heading using the <h1> tag. Make it say "Hello DevOps!"',
    language: 'html',
    initialCode: '<!-- Create a heading that says "Hello DevOps!" -->\n',
    expectedOutput: 'Hello DevOps!',
    hints: ['Use <h1> tag', 'Tags need opening and closing', '<h1>Your text</h1>'],
    xpReward: 10
  },
  {
    id: 'html-paragraph',
    title: 'Add a Paragraph',
    description: 'Create a paragraph introducing yourself using the <p> tag.',
    language: 'html',
    initialCode: '<!-- Create a paragraph about yourself -->\n',
    expectedOutput: 'paragraph',
    hints: ['Use <p> tag', 'Paragraphs can contain any text'],
    xpReward: 10
  },
  {
    id: 'css-color',
    title: 'Style with Color',
    description: 'Set the background color of a div to "lightblue" using CSS.',
    language: 'css',
    initialCode: 'div {\n  /* Set background-color to lightblue */\n  \n}',
    expectedOutput: 'lightblue',
    hints: ['Use background-color property', 'Color names are quoted strings'],
    xpReward: 15
  },
  {
    id: 'css-padding',
    title: 'Add Padding',
    description: 'Add 20px of padding inside the box using CSS.',
    language: 'css',
    initialCode: '.box {\n  /* Add 20px padding */\n  \n}',
    expectedOutput: '20px',
    hints: ['Use padding property', 'Values can be "20px" or "20px 20px 20px 20px"'],
    xpReward: 15
  },
  {
    id: 'js-variable',
    title: 'Declare a Variable',
    description: 'Create a variable called "serverName" and set it to "production".',
    language: 'javascript',
    initialCode: '// Create a variable called serverName\n',
    expectedOutput: 'production',
    hints: ['Use let or const', 'let serverName = "production"'],
    xpReward: 15
  },
  {
    id: 'js-function',
    title: 'Write a Function',
    description: 'Create a function called "deploy" that returns "Deployed!".',
    language: 'javascript',
    initialCode: '// Create a deploy function\nfunction deploy() {\n  \n}',
    expectedOutput: 'Deployed!',
    hints: ['Use return statement', 'Function should return a string'],
    xpReward: 20
  },
  {
    id: 'js-array',
    title: 'Work with Arrays',
    description: 'Create an array called "servers" with ["web", "api", "database"].',
    language: 'javascript',
    initialCode: '// Create servers array\n',
    expectedOutput: 'web,api,database',
    hints: ['Use square brackets', 'Separate items with commas'],
    xpReward: 15
  },
  {
    id: 'html-list',
    title: 'Create a List',
    description: 'Create an unordered list with two items: "CI" and "CD".',
    language: 'html',
    initialCode: '<!-- Create an unordered list with CI and CD -->\n',
    expectedOutput: 'CI',
    hints: ['Use <ul> for unordered list', 'Use <li> for each item'],
    xpReward: 15
  },
  {
    id: 'css-font',
    title: 'Style Text',
    description: 'Set the font-size to 24px and color to blue.',
    language: 'css',
    initialCode: 'p {\n  /* Set font-size to 24px and color to blue */\n  \n}',
    expectedOutput: '24px',
    hints: ['font-size property', 'color property', 'Use 24px (not "24px") for numbers'],
    xpReward: 15
  },
  {
    id: 'js-object',
    title: 'Create an Object',
    description: 'Create an object called "config" with a property "env" set to "production".',
    language: 'javascript',
    initialCode: '// Create config object\nconst config = {\n  \n};',
    expectedOutput: 'production',
    hints: ['Use key: value syntax', 'env: "production"'],
    xpReward: 20
  }
]

interface CodePlaygroundProps {
  onComplete?: (xpEarned: number) => void
}

export default function CodePlayground({ onComplete }: CodePlaygroundProps) {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null)
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([])
  const [totalXP, setTotalXP] = useState(0)
  const outputRef = useRef<HTMLIFrameElement>(null)

  const selectChallenge = (challenge: Challenge) => {
    setActiveChallenge(challenge)
    setCode(challenge.initialCode)
    setOutput('')
    setShowSuccess(false)
    setHintsUsed(0)
  }

  // Generate preview based on language
  const generatePreview = () => {
    if (!activeChallenge) return ''

    switch (activeChallenge.language) {
      case 'html':
        return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #1e293b; color: white; }
  </style>
</head>
<body>
${code}
</body>
</html>`

      case 'css':
        return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #1e293b; color: white; }
    div { padding: 20px; margin: 10px; background: #334155; border-radius: 8px; }
    ${code}
  </style>
</head>
<body>
  <div>Test Box - Your CSS will style this!</div>
</body>
</html>`

      case 'javascript':
        return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #1e293b; color: white; }
    #output { padding: 20px; background: #0f172a; border-radius: 8px; margin-top: 10px; }
  </style>
</head>
<body>
  <h2>Output:</h2>
  <div id="output"></div>
  <script>
    try {
      ${code}
    } catch (e) {
      document.getElementById('output').textContent = 'Error: ' + e.message;
    }
  </script>
</body>
</html>`

      default:
        return ''
    }
  }

  const runCode = () => {
    if (!activeChallenge) return

    const preview = generatePreview()
    if (outputRef.current) {
      outputRef.current.srcdoc = preview
    }

    // Check if answer is correct
    const normalizedCode = code.replace(/\s/g, '').toLowerCase()
    if (activeChallenge.expectedOutput) {
      const isCorrect = normalizedCode.includes(activeChallenge.expectedOutput.toLowerCase().replace(/\s/g, ''))
      if (isCorrect) {
        setShowSuccess(true)
        const xpEarned = Math.max(5, activeChallenge.xpReward - hintsUsed * 2)
        setTotalXP(prev => prev + xpEarned)
        setCompletedChallenges(prev => [...prev, activeChallenge.id])
        if (onComplete) onComplete(xpEarned)
      }
    }
  }

  const useHint = () => {
    if (!activeChallenge || hintsUsed >= activeChallenge.hints.length) return
    setHintsUsed(prev => prev + 1)
    setOutput(`💡 Hint ${hintsUsed + 1}: ${activeChallenge.hints[hintsUsed]}`)
  }

  const resetCode = () => {
    if (activeChallenge) {
      setCode(activeChallenge.initialCode)
      setOutput('')
    }
  }

  return (
    <div className="bg-slate-800/80 rounded-xl border border-amber-600/50 overflow-hidden">
      <div className="bg-gradient-to-r from-green-900/30 via-slate-800 to-blue-900/30 px-6 py-4 border-b border-slate-700">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          💻 Code Playground
        </h2>
        <p className="text-sm text-slate-400 mt-1">Practice coding in a safe environment!</p>
      </div>

      {!activeChallenge ? (
        <div className="p-6">
          <h3 className="text-lg font-bold text-amber-400 mb-4">Choose a Challenge:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {challenges.map((challenge) => {
              const isCompleted = completedChallenges.includes(challenge.id)
              return (
                <button
                  key={challenge.id}
                  onClick={() => selectChallenge(challenge)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    isCompleted
                      ? 'bg-green-900/30 border-green-600/50'
                      : 'bg-slate-700/50 border-slate-600 hover:border-amber-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm px-2 py-0.5 rounded bg-slate-600 text-slate-300">
                      {challenge.language.toUpperCase()}
                    </span>
                    <span className="text-amber-400 text-sm">+{challenge.xpReward} XP</span>
                  </div>
                  <h4 className="font-bold text-white">{challenge.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{challenge.description}</p>
                  {isCompleted && <span className="text-green-400 text-xs">✓ Completed</span>}
                </button>
              )
            })}
          </div>

          {totalXP > 0 && (
            <div className="mt-6 text-center p-4 bg-amber-900/30 rounded-lg border border-amber-600/50">
              <span className="text-2xl">🏆</span>
              <p className="text-amber-400 font-bold">You've earned {totalXP} XP in Code Playground!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          {/* Challenge Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <button
                onClick={() => setActiveChallenge(null)}
                className="text-amber-400 hover:text-amber-300 text-sm mb-1"
              >
                ← Back to Challenges
              </button>
              <h3 className="font-bold text-white">{activeChallenge.title}</h3>
              <p className="text-sm text-slate-400">{activeChallenge.description}</p>
            </div>
            <div className="text-right">
              <div className="text-amber-400 font-bold">+{activeChallenge.xpReward} XP</div>
              <div className="text-xs text-slate-400">
                {activeChallenge.language.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Code Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Code:</span>
                <div className="flex gap-2">
                  <button
                    onClick={resetCode}
                    className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded"
                  >
                    Reset
                  </button>
                  <button
                    onClick={useHint}
                    disabled={hintsUsed >= activeChallenge.hints.length}
                    className={`text-xs px-2 py-1 rounded ${
                      hintsUsed >= activeChallenge.hints.length
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }`}
                  >
                    💡 Hint ({hintsUsed}/{activeChallenge.hints.length})
                  </button>
                </div>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-48 bg-slate-900 border border-slate-600 rounded-lg p-3 text-green-400 font-mono text-sm focus:outline-none focus:border-amber-500 resize-none"
                spellCheck={false}
              />
            </div>

            {/* Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Live Preview:</span>
                <button
                  onClick={runCode}
                  className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded"
                >
                  ▶ Run Code
                </button>
              </div>
              <div className="relative">
                <iframe
                  ref={outputRef}
                  className="w-full h-48 bg-slate-900 border border-slate-600 rounded-lg"
                  sandbox="allow-scripts"
                  title="Code Preview"
                />
                {showSuccess && (
                  <div className="absolute inset-0 bg-green-900/80 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <span className="text-5xl">🎉</span>
                      <p className="text-green-300 font-bold mt-2">Correct!</p>
                      <p className="text-green-400 text-sm">+{Math.max(5, activeChallenge.xpReward - hintsUsed * 2)} XP</p>
                      <button
                        onClick={() => {
                          setShowSuccess(false)
                          setActiveChallenge(null)
                        }}
                        className="mt-3 px-4 py-1 bg-green-600 hover:bg-green-500 text-white text-sm rounded"
                      >
                        Next Challenge
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Output/Feedback */}
          {output && (
            <div className="mt-4 p-3 bg-slate-900 border border-slate-600 rounded-lg">
              <p className="text-slate-300 text-sm">{output}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
