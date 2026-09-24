import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { VoiceSettings } from './VoiceSettings'

interface VoiceSpec {
  voiceURI: string
  name: string
  lang: string
}

/** Recording stand-in for SpeechSynthesisUtterance. */
class FakeUtterance {
  readonly text: string
  volume = 1
  rate = 1
  pitch = 1
  voice: VoiceSpec | null = null
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor(text: string) {
    this.text = text
    FakeUtterance.instances.push(this)
  }

  static instances: FakeUtterance[] = []

  start(): void {
    this.onstart?.()
  }
}

/** Recording stand-in for window.speechSynthesis. */
class FakeSpeechSynthesis {
  readonly voices: VoiceSpec[]
  readonly spoken: FakeUtterance[] = []
  cancelCount = 0
  onvoiceschanged: (() => void) | null = null

  constructor(voices: VoiceSpec[]) {
    this.voices = voices
  }

  getVoices(): VoiceSpec[] {
    return this.voices
  }

  speak(utterance: FakeUtterance): void {
    this.spoken.push(utterance)
  }

  cancel(): void {
    this.cancelCount += 1
  }
}

const STORAGE_KEY = 'devopsquest_voice_settings'
const ENGLISH_VOICE: VoiceSpec = { voiceURI: 'en-US-1', name: 'Google US English', lang: 'en-US' }
const ENGLISH_UK_VOICE: VoiceSpec = { voiceURI: 'en-GB-1', name: 'Sonia', lang: 'en-GB' }
const FRENCH_VOICE: VoiceSpec = { voiceURI: 'fr-FR-1', name: 'Amélie', lang: 'fr-FR' }

let synth: FakeSpeechSynthesis

function installSpeechSupport(voices: VoiceSpec[]): void {
  synth = new FakeSpeechSynthesis(voices)
  // vi.stubGlobal writes to the Node global rather than the jsdom window the
  // component reads, so the property is declared on `window` directly.
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synth })
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
}

/**
 * Renders the panel with narration already enabled. The hook validates the
 * full shape of stored settings, so the seed is a complete object.
 */
function renderSettings(stored?: Record<string, unknown>) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(stored ?? { enabled: true, volume: 1, rate: 1, pitch: 1, voiceURI: null }),
  )
  return render(<VoiceSettings />)
}

/**
 * The three range inputs are rendered in DOM order: volume, speed, pitch.
 * They have no associated label text, so they are addressed by position.
 */
function slider(index: number): HTMLInputElement {
  const input = screen.getAllByRole('slider')[index]
  if (!(input instanceof HTMLInputElement)) {
    throw new Error(`expected a range input at position ${index}`)
  }
  return input
}

/**
 * Drops the Web Speech API for the duration of `run`. Testing Library's
 * auto-cleanup unmounts after the test body, and the hook's cleanup writes to
 * window.speechSynthesis, so removal is scoped here instead of afterEach.
 */
function withoutSpeechSupport(run: () => void): void {
  Reflect.deleteProperty(window, 'speechSynthesis')
  vi.unstubAllGlobals()
  run()
  installSpeechSupport([ENGLISH_VOICE, ENGLISH_UK_VOICE, FRENCH_VOICE])
}

beforeEach(() => {
  localStorage.clear()
  FakeUtterance.instances = []
  installSpeechSupport([ENGLISH_VOICE, ENGLISH_UK_VOICE, FRENCH_VOICE])
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('VoiceSettings', () => {
  describe('when the Web Speech API is unavailable', () => {
    it('explains that narration is not supported', () => {
      withoutSpeechSupport(() => {
        render(<VoiceSettings />)

        expect(
          screen.getByText('Voice narration is not supported in your browser.'),
        ).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Disabled' })).toBeNull()
        expect(screen.queryByRole('combobox')).toBeNull()
      })
    })
  })

  describe('enablement', () => {
    it('starts disabled with only the toggle rendered', () => {
      renderSettings({ enabled: false, volume: 1, rate: 1, pitch: 1, voiceURI: null })

      expect(screen.getByRole('button', { name: 'Disabled' })).toBeInTheDocument()
      expect(screen.queryByRole('combobox')).toBeNull()
      expect(screen.queryByRole('button', { name: 'Play' })).toBeNull()
    })

    it('reveals the controls when narration is switched on', () => {
      renderSettings({ enabled: false, volume: 1, rate: 1, pitch: 1, voiceURI: null })

      fireEvent.click(screen.getByRole('button', { name: 'Disabled' }))

      expect(screen.getByRole('button', { name: 'Enabled' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Enabled' }).className).toContain('bg-green-600')
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
    })

    it('switches back off and hides the controls again', () => {
      renderSettings()

      fireEvent.click(screen.getByRole('button', { name: 'Enabled' }))

      expect(screen.getByRole('button', { name: 'Disabled' })).toBeInTheDocument()
      expect(screen.queryByRole('combobox')).toBeNull()
    })

    it('persists the enabled flag', () => {
      renderSettings({ enabled: false, volume: 1, rate: 1, pitch: 1, voiceURI: null })

      fireEvent.click(screen.getByRole('button', { name: 'Disabled' }))

      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({ enabled: true })
    })
  })

  describe('test voice', () => {
    it('speaks the sample line with high priority', () => {
      renderSettings()

      fireEvent.click(screen.getByRole('button', { name: 'Play' }))

      expect(synth.cancelCount).toBe(1)
      expect(synth.spoken).toHaveLength(1)
      expect(synth.spoken[0].text).toBe('Hello! Your voice narration is working correctly.')
    })

    it('copies the configured volume, speed, pitch and voice onto the utterance', () => {
      renderSettings({ enabled: true, volume: 0.6, rate: 1.4, pitch: 0.8, voiceURI: 'en-GB-1' })

      fireEvent.click(screen.getByRole('button', { name: 'Play' }))

      expect(synth.spoken[0].volume).toBe(0.6)
      expect(synth.spoken[0].rate).toBe(1.4)
      expect(synth.spoken[0].pitch).toBe(0.8)
      expect(synth.spoken[0].voice).toEqual(ENGLISH_UK_VOICE)
    })

    it('disables playback and offers a stop button while speaking', () => {
      renderSettings()

      fireEvent.click(screen.getByRole('button', { name: 'Play' }))
      const utterance = synth.spoken[0]
      act(() => {
        utterance.start()
      })

      expect(screen.getByRole('button', { name: 'Speaking...' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Stop' }))

      expect(synth.cancelCount).toBe(2)
      expect(screen.queryByRole('button', { name: 'Stop' })).toBeNull()
      expect(screen.getByRole('button', { name: 'Play' })).toBeEnabled()
    })

    it('speaks each sample narration with its own copy', () => {
      renderSettings()

      fireEvent.click(screen.getByRole('button', { name: /Correct Answer/ }))
      expect(synth.spoken[0]?.text).toBe('Correct! Great job.')

      fireEvent.click(screen.getByRole('button', { name: /Quest Complete/ }))
      expect(synth.spoken[1]?.text).toBe('Quest complete! You earned fifty XP and twenty gold.')

      fireEvent.click(screen.getByRole('button', { name: /Level Up/ }))
      expect(synth.spoken[2]?.text).toBe('Congratulations! You reached level five.')

      fireEvent.click(screen.getByRole('button', { name: /Badge Unlocked/ }))
      expect(synth.spoken[3]?.text).toBe('New badge unlocked: First Steps!')

      expect(synth.cancelCount).toBe(0)
    })
  })

  describe('voice selection', () => {
    it('lists the default entry plus English voices only', () => {
      renderSettings()
      const select = screen.getByRole('combobox')

      const options = within(select).getAllByRole('option')
      expect(options.map((option) => option.textContent)).toEqual([
        'Default',
        'Google US English (en-US)',
        'Sonia (en-GB)',
      ])
      // The hook auto-selects the first English voice.
      expect(select).toHaveValue('en-US-1')
    })

    it('saves a chosen voice', () => {
      renderSettings()
      const select = screen.getByRole('combobox')

      fireEvent.change(select, { target: { value: 'en-GB-1' } })

      expect(select).toHaveValue('en-GB-1')
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({
        voiceURI: 'en-GB-1',
      })
    })

    it('keeps the configured voice on the next render', () => {
      renderSettings({
        enabled: true,
        volume: 1,
        rate: 1,
        pitch: 1,
        voiceURI: 'en-GB-1',
      })

      expect(screen.getByRole('combobox')).toHaveValue('en-GB-1')
    })
  })

  describe('sliders', () => {
    it('shows the current volume as a percentage and saves changes', () => {
      renderSettings({ enabled: true, volume: 0.8, rate: 1, pitch: 1, voiceURI: null })

      expect(screen.getByText('80%')).toBeInTheDocument()

      fireEvent.change(slider(0), { target: { value: '0.5' } })

      expect(screen.getByText('50%')).toBeInTheDocument()
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({ volume: 0.5 })
    })

    it('shows the speed multiplier and saves changes', () => {
      renderSettings()

      expect(screen.getByText('1.0x')).toBeInTheDocument()
      fireEvent.change(slider(1), { target: { value: '1.5' } })

      expect(screen.getByText('1.5x')).toBeInTheDocument()
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({ rate: 1.5 })
    })

    it('shows the pitch and saves changes', () => {
      renderSettings()

      expect(screen.getByText('1.0')).toBeInTheDocument()
      fireEvent.change(slider(2), { target: { value: '0.7' } })

      expect(screen.getByText('0.7')).toBeInTheDocument()
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({ pitch: 0.7 })
    })
  })
})
