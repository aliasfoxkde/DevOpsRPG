import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import CodePlayground from './CodePlayground'

function setup() {
  const onComplete = vi.fn()
  render(<CodePlayground onComplete={onComplete} />)
  return { onComplete }
}

function openChallenge(title: string) {
  fireEvent.click(screen.getByRole('button', { name: new RegExp(title, 'i') }))
}

function editor() {
  return screen.getByRole('textbox')
}

function writeCode(code: string) {
  fireEvent.change(editor(), { target: { value: code } })
}

function run() {
  fireEvent.click(screen.getByRole('button', { name: /run code/i }))
}

describe('CodePlayground', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lists every challenge with its language and XP reward', () => {
    setup()

    expect(screen.getByText('💻 Code Playground')).toBeInTheDocument()
    expect(screen.getByText('Choose a Challenge:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create a heading/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /write a function/i })).toBeInTheDocument()
    expect(screen.getAllByText('HTML')).toHaveLength(3)
    expect(screen.getAllByText('+10 XP').length).toBeGreaterThan(0)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('opens an editor pre-filled with the challenge starter code', () => {
    setup()
    openChallenge('Create a Heading')

    expect(screen.getByText('Create a Heading')).toBeInTheDocument()
    expect(editor()).toHaveValue('<!-- Create a heading that says "Hello DevOps!" -->\n')
    expect(screen.getByRole('button', { name: /run code/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hint \(0\/3\)/i })).toBeInTheDocument()
  })

  it('awards the challenge XP and celebrates a correct solution', () => {
    const { onComplete } = setup()
    openChallenge('Create a Heading')

    writeCode('<h1>Hello DevOps!</h1>')
    run()

    expect(screen.getByText('Correct!')).toBeInTheDocument()
    expect(screen.getAllByText('+10 XP')).toHaveLength(2) // header + success overlay
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(10)
  })

  it('accepts solutions regardless of whitespace or letter case', () => {
    const { onComplete } = setup()
    openChallenge('Declare a Variable')

    writeCode('let  SERVERNAME  =  "production"')
    run()

    expect(screen.getByText('Correct!')).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledWith(15)
  })

  it('does not reward code that misses the expected output', () => {
    const { onComplete } = setup()
    openChallenge('Create a Heading')

    writeCode('<p>Something else entirely</p>')
    run()

    expect(screen.queryByText('Correct!')).not.toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()
    // The editor keeps whatever the player wrote.
    expect(editor()).toHaveValue('<p>Something else entirely</p>')
  })

  it('lowers the XP payout for every hint used', () => {
    const { onComplete } = setup()
    openChallenge('Write a Function')

    fireEvent.click(screen.getByRole('button', { name: /hint \(0\/2\)/i }))
    expect(screen.getByText(/Hint 1: Use return statement/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hint \(1\/2\)/i })).toBeInTheDocument()

    writeCode('function deploy() {\n  return "Deployed!";\n}')
    run()

    expect(screen.getByText('Correct!')).toBeInTheDocument()
    expect(screen.getByText('+18 XP')).toBeInTheDocument() // 20 XP - 2 for the hint
    expect(onComplete).toHaveBeenCalledWith(18)
  })

  it('disables the hint button once every hint has been shown', () => {
    setup()
    openChallenge('Create a Heading')

    fireEvent.click(screen.getByRole('button', { name: /hint \(0\/3\)/i }))
    fireEvent.click(screen.getByRole('button', { name: /hint \(1\/3\)/i }))
    expect(screen.getByText(/Hint 2: Tags need opening and closing/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /hint \(2\/3\)/i }))
    expect(screen.getByText(/Hint 3:/)).toBeInTheDocument()

    const hint = screen.getByRole('button', { name: /hint \(3\/3\)/i })
    expect(hint).toBeDisabled()
  })

  it('restores the starter code on reset', () => {
    setup()
    openChallenge('Create a Heading')

    writeCode('<h1>broken</h1>')
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))

    expect(editor()).toHaveValue('<!-- Create a heading that says "Hello DevOps!" -->\n')
  })

  it('returns to the list after solving and marks the challenge complete', () => {
    const { onComplete } = setup()
    openChallenge('Create a Heading')

    writeCode('<h1>Hello DevOps!</h1>')
    run()
    fireEvent.click(screen.getByRole('button', { name: /next challenge/i }))

    const listCard = screen.getByRole('button', { name: /create a heading/i })
    expect(within(listCard).getByText('✓ Completed')).toBeInTheDocument()
    expect(screen.getByText("You've earned 10 XP in Code Playground!")).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('banks XP across several challenges', () => {
    const { onComplete } = setup()

    openChallenge('Create a Heading')
    writeCode('<h1>Hello DevOps!</h1>')
    run()
    fireEvent.click(screen.getByRole('button', { name: /next challenge/i }))

    openChallenge('Declare a Variable')
    writeCode('const serverName = "production"')
    run()
    fireEvent.click(screen.getByRole('button', { name: /next challenge/i }))

    expect(screen.getByText("You've earned 25 XP in Code Playground!")).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledTimes(2)
    expect(onComplete).toHaveBeenNthCalledWith(1, 10)
    expect(onComplete).toHaveBeenNthCalledWith(2, 15)
  })

  it('goes back to the list without solving anything', () => {
    setup()
    openChallenge('Create a Heading')

    fireEvent.click(screen.getByRole('button', { name: /back to challenges/i }))
    expect(screen.getByText('Choose a Challenge:')).toBeInTheDocument()
    expect(screen.queryByText("You've earned")).not.toBeInTheDocument()
  })

  it('renders a live preview for a CSS challenge and rewards a correct rule', () => {
    const { onComplete } = setup()
    openChallenge('Style with Color')

    writeCode('div {\n  background-color: lightblue;\n}')
    run()

    expect(screen.getByText('Correct!')).toBeInTheDocument()
    expect(screen.getAllByText('+15 XP')).toHaveLength(2) // header + success overlay
    expect(onComplete).toHaveBeenCalledWith(15)
    // The preview iframe is repointed at the generated document.
    expect(screen.getByTitle('Code Preview')).toHaveAttribute('srcdoc')
  })

  it('styles a CSS selector for a different challenge family', () => {
    const { onComplete } = setup()
    openChallenge('Add Padding')

    writeCode('.box {\n  padding: 20px;\n}')
    run()

    expect(screen.getByText('Correct!')).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledWith(15)
  })

  it('solves a challenge when the parent ignores the XP callback', () => {
    render(<CodePlayground />)
    openChallenge('Declare a Variable')

    writeCode('const serverName = "production"')
    run()

    expect(screen.getByText('Correct!')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /next challenge/i }))
    expect(screen.getByText("You've earned 15 XP in Code Playground!")).toBeInTheDocument()
  })

  it('solves a JavaScript challenge and embeds the code in the preview document', () => {
    const { onComplete } = setup()
    openChallenge('Create an Object')

    writeCode('const config = {\n  env: "production"\n};')
    run()

    expect(screen.getByText('Correct!')).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledWith(20)
    const srcdoc = screen.getByTitle('Code Preview').getAttribute('srcdoc') ?? ''
    expect(srcdoc).toContain('<script>')
    expect(srcdoc).toContain('production')
  })

  it('resets the hint count and editor when a solved challenge is reopened', () => {
    setup()
    openChallenge('Style with Color')

    fireEvent.click(screen.getByRole('button', { name: /hint \(0\/2\)/i }))
    writeCode('div { background-color: lightblue; }')
    run()
    fireEvent.click(screen.getByRole('button', { name: /next challenge/i }))

    expect(
      within(screen.getByRole('button', { name: /style with color/i })).getByText('✓ Completed'),
    ).toBeInTheDocument()

    openChallenge('Style with Color')

    expect(editor()).toHaveValue('div {\n  /* Set background-color to lightblue */\n  \n}')
    expect(screen.getByRole('button', { name: /hint \(0\/2\)/i })).toBeEnabled()
    expect(screen.queryByText(/Hint 1:/)).not.toBeInTheDocument()
  })

  it('keeps the hint output intact once every hint has been handed out', () => {
    setup()
    openChallenge('Style Text')

    fireEvent.click(screen.getByRole('button', { name: /hint \(0\/3\)/i }))
    fireEvent.click(screen.getByRole('button', { name: /hint \(1\/3\)/i }))
    fireEvent.click(screen.getByRole('button', { name: /hint \(2\/3\)/i }))
    expect(screen.getByText(/Hint 3: Use 24px/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hint \(3\/3\)/i })).toBeDisabled()

    // Every hint is gone; the disabled button must not restart the list.
    fireEvent.click(screen.getByRole('button', { name: /hint \(3\/3\)/i }))
    expect(screen.getByText(/Hint 3: Use 24px/)).toBeInTheDocument()
    expect(screen.queryByText(/Hint 1: font-size property/)).not.toBeInTheDocument()
  })
})
