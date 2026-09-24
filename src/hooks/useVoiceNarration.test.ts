import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVoiceNarration } from './useVoiceNarration'

interface VoiceSpec {
  voiceURI: string
  name: string
  lang: string
}

/** Recording stand-in for SpeechSynthesisUtterance. */
class FakeUtterance {
  static instances: FakeUtterance[] = []

  readonly text: string
  volume = 1
  rate = 1
  pitch = 1
  lang = ''
  voice: VoiceSpec | null = null
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor(text: string) {
    this.text = text
    FakeUtterance.instances.push(this)
  }

  start(): void {
    this.onstart?.()
  }

  finish(): void {
    this.onend?.()
  }

  fail(): void {
    this.onerror?.()
  }
}

/** Recording stand-in for window.speechSynthesis. */
class FakeSpeechSynthesis {
  static instances: FakeSpeechSynthesis[] = []

  readonly voices: VoiceSpec[] = []
  readonly spoken: FakeUtterance[] = []
  cancelCount = 0
  onvoiceschanged: (() => void) | null = null

  constructor(voices: VoiceSpec[] = []) {
    this.voices.push(...voices)
    FakeSpeechSynthesis.instances.push(this)
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

  /** Simulates the browser announcing voices late (Chrome behaviour). */
  emitVoicesChanged(): void {
    this.onvoiceschanged?.()
  }
}

const STORAGE_KEY = 'devopsquest_voice_settings'
const ENGLISH_VOICE: VoiceSpec = { voiceURI: 'en-US-1', name: 'Google US English', lang: 'en-US' }
const FRENCH_VOICE: VoiceSpec = { voiceURI: 'fr-FR-1', name: 'Amélie', lang: 'fr-FR' }

let synth: FakeSpeechSynthesis

// The hook validates the full shape of stored settings, so seeds are always
// written as complete objects with only the fields under test overridden.
interface StoredSettings {
  enabled: boolean
  volume: number
  rate: number
  pitch: number
  voiceURI: string | null
}

const VALID_STORED: StoredSettings = {
  enabled: true,
  volume: 1,
  rate: 1,
  pitch: 1,
  voiceURI: null,
}

function storedSettings(overrides: Partial<StoredSettings> = {}): StoredSettings {
  return { ...VALID_STORED, ...overrides }
}

/**
 * Installs the Web Speech API fakes on `window`. `vi.stubGlobal` writes to the
 * Node global, which is a different object from the jsdom `window` the hook
 * reads, so the property is declared on `window` directly.
 */
function installSpeechSupport(voices: VoiceSpec[] = [ENGLISH_VOICE, FRENCH_VOICE]): void {
  synth = new FakeSpeechSynthesis(voices)
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synth })
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
}

function removeSpeechSupport(): void {
  Reflect.deleteProperty(window, 'speechSynthesis')
  vi.unstubAllGlobals()
}

/**
 * Drops the Web Speech API for the duration of `run`. Testing Library's
 * auto-cleanup unmounts after the test body, so removal stays scoped to the
 * test itself instead of afterEach.
 */
async function withoutSpeechSupport(run: () => void | Promise<void>): Promise<void> {
  removeSpeechSupport()
  await run()
  installSpeechSupport()
}

/** Renders the hook with the given stored settings already in localStorage. */
function renderVoiceHook(stored?: StoredSettings) {
  if (stored) localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  return renderHook(() => useVoiceNarration())
}

function lastUtterance(): FakeUtterance {
  if (synth.spoken.length === 0) throw new Error('expected an utterance to be spoken')
  return synth.spoken[synth.spoken.length - 1]
}

function expectNoSpeech(): void {
  expect(synth.spoken).toHaveLength(0)
  expect(FakeUtterance.instances).toHaveLength(0)
}

describe('useVoiceNarration', () => {
  beforeEach(() => {
    localStorage.clear()
    FakeUtterance.instances = []
    FakeSpeechSynthesis.instances = []
    installSpeechSupport()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('support detection', () => {
    it('reports support when speechSynthesis exists', () => {
      const { result } = renderVoiceHook()
      expect(result.current.isSupported).toBe(true)
    })

    it('reports no support when speechSynthesis is missing', async () => {
      await withoutSpeechSupport(() => {
        const { result, unmount } = renderVoiceHook()
        expect(result.current.isSupported).toBe(false)
        unmount()
      })
    })
  })

  describe('settings persistence', () => {
    it('starts with narration disabled and neutral voice settings', () => {
      const { result } = renderVoiceHook()

      // voiceURI is auto-selected from the available English voice on mount.
      expect(result.current.settings).toEqual({
        enabled: false,
        volume: 1,
        rate: 1,
        pitch: 1,
        voiceURI: 'en-US-1',
      })
    })

    it('restores previously saved settings', () => {
      const { result } = renderVoiceHook(
        storedSettings({ volume: 0.4, rate: 1.5, pitch: 0.8, voiceURI: 'fr-FR-1' }),
      )

      expect(result.current.settings).toEqual({
        enabled: true,
        volume: 0.4,
        rate: 1.5,
        pitch: 0.8,
        voiceURI: 'fr-FR-1',
      })
    })

    it('falls back to defaults for a corrupt payload', () => {
      // No English voice available, so voiceURI keeps its default (null) and
      // does not mask the fallback being asserted.
      removeSpeechSupport()
      installSpeechSupport([FRENCH_VOICE])
      localStorage.setItem(STORAGE_KEY, '{definitely not json')
      const { result } = renderHook(() => useVoiceNarration())

      expect(result.current.settings).toEqual({
        enabled: false,
        volume: 1,
        rate: 1,
        pitch: 1,
        voiceURI: null,
      })
    })

    it('falls back to defaults when the payload has the wrong shape', () => {
      removeSpeechSupport()
      installSpeechSupport([FRENCH_VOICE])
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: 'yes', volume: 'loud' }))
      const { result } = renderHook(() => useVoiceNarration())

      expect(result.current.settings).toEqual({
        enabled: false,
        volume: 1,
        rate: 1,
        pitch: 1,
        voiceURI: null,
      })
    })

    it('falls back to defaults when the payload is the JSON literal null', () => {
      removeSpeechSupport()
      installSpeechSupport([FRENCH_VOICE])
      localStorage.setItem(STORAGE_KEY, 'null')
      const { result } = renderHook(() => useVoiceNarration())

      expect(result.current.settings).toMatchObject({ enabled: false, volume: 1, voiceURI: null })
    })

    it('persists every settings change', () => {
      const { result } = renderVoiceHook(storedSettings())

      act(() => {
        result.current.updateSettings({ volume: 0.25, rate: 1.2, pitch: 0.9 })
      })

      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({
        volume: 0.25,
        rate: 1.2,
        pitch: 0.9,
        enabled: true,
      })
    })

    it('toggles narration on and off', () => {
      const { result } = renderVoiceHook()

      act(() => {
        result.current.toggleEnabled()
      })
      expect(result.current.settings.enabled).toBe(true)

      act(() => {
        result.current.toggleEnabled()
      })
      expect(result.current.settings.enabled).toBe(false)
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({
        enabled: false,
      })
    })

    it('keeps unrelated settings when one is updated', () => {
      const { result } = renderVoiceHook(storedSettings({ pitch: 1.7 }))

      act(() => {
        result.current.updateSettings({ volume: 0.5 })
      })

      expect(result.current.settings).toMatchObject({ volume: 0.5, pitch: 1.7, enabled: true })
    })
  })

  describe('voice discovery', () => {
    it('exposes the voices reported by the browser', () => {
      const { result } = renderVoiceHook()
      expect(result.current.voices).toEqual([ENGLISH_VOICE, FRENCH_VOICE])
    })

    it('selects the first English voice when none is configured', () => {
      const { result } = renderVoiceHook()

      expect(result.current.settings.voiceURI).toBe('en-US-1')
    })

    it('keeps a configured voice instead of auto-selecting', () => {
      const { result } = renderVoiceHook(storedSettings({ voiceURI: 'fr-FR-1' }))

      expect(result.current.settings.voiceURI).toBe('fr-FR-1')
    })

    it('leaves the voice unset when no English voice is available', () => {
      removeSpeechSupport()
      installSpeechSupport([FRENCH_VOICE])

      const { result } = renderVoiceHook()

      expect(result.current.settings.voiceURI).toBeNull()
    })

    it('refreshes voices when the browser announces them late', () => {
      removeSpeechSupport()
      installSpeechSupport([])
      const { result } = renderVoiceHook()

      expect(result.current.voices).toEqual([])
      expect(result.current.settings.voiceURI).toBeNull()

      act(() => {
        synth.voices.push(ENGLISH_VOICE)
        synth.emitVoicesChanged()
      })

      expect(result.current.voices).toEqual([ENGLISH_VOICE])
      expect(result.current.settings.voiceURI).toBe('en-US-1')
    })

    it('unregisters the voiceschanged listener on unmount', () => {
      const { unmount } = renderVoiceHook()

      expect(synth.onvoiceschanged).toBeTypeOf('function')
      unmount()
      expect(synth.onvoiceschanged).toBeNull()
    })
  })

  describe('speak', () => {
    it('says nothing while narration is disabled', () => {
      const { result } = renderVoiceHook()

      act(() => {
        result.current.speak('Hello hero')
      })

      expectNoSpeech()
    })

    it('says nothing for empty text', () => {
      const { result } = renderVoiceHook(storedSettings())

      act(() => {
        result.current.speak('')
      })

      expectNoSpeech()
    })

    it('speaks with the configured volume, rate and pitch', () => {
      const { result } = renderVoiceHook(
        storedSettings({ volume: 0.5, rate: 1.4, pitch: 0.7, voiceURI: 'en-US-1' }),
      )

      act(() => {
        result.current.speak('Quest complete')
      })

      expect(synth.cancelCount).toBe(0)
      const utterance = lastUtterance()
      expect(utterance.text).toBe('Quest complete')
      expect(utterance.volume).toBe(0.5)
      expect(utterance.rate).toBe(1.4)
      expect(utterance.pitch).toBe(0.7)
      expect(synth.spoken).toEqual([utterance])
    })

    it('attaches the configured voice when it is available', () => {
      const { result } = renderVoiceHook(storedSettings({ voiceURI: 'fr-FR-1' }))

      act(() => {
        result.current.speak('Bonjour')
      })

      expect(lastUtterance().voice).toEqual(FRENCH_VOICE)
    })

    it('leaves the voice unset when the configured URI is unknown', () => {
      const { result } = renderVoiceHook(storedSettings({ voiceURI: 'missing-voice' }))

      act(() => {
        result.current.speak('Hello')
      })

      expect(lastUtterance().voice).toBeNull()
    })

    it('leaves the voice unset when no voice has been selected', () => {
      // Only a French voice exists, so nothing is auto-selected and the hook
      // speaks without assigning a voice at all.
      removeSpeechSupport()
      installSpeechSupport([FRENCH_VOICE])
      const { result } = renderVoiceHook(storedSettings({ voiceURI: null }))

      act(() => {
        result.current.speak('Hello')
      })

      expect(result.current.settings.voiceURI).toBeNull()
      expect(lastUtterance().voice).toBeNull()
    })

    it('cancels current speech first for high priority messages', () => {
      const { result } = renderVoiceHook(storedSettings({ voiceURI: 'en-US-1' }))

      act(() => {
        result.current.speak('Background line', 'normal')
        result.current.speak('Urgent line', 'high')
      })

      expect(synth.cancelCount).toBe(1)
      expect(synth.spoken.map((utterance) => utterance.text)).toEqual([
        'Background line',
        'Urgent line',
      ])
    })

    it('marks speaking while the utterance plays and clears it at the end', () => {
      const { result } = renderVoiceHook(storedSettings())
      expect(result.current.isSpeaking).toBe(false)

      act(() => {
        result.current.speak('Level up')
      })
      expect(result.current.isSpeaking).toBe(false)

      const utterance = lastUtterance()
      act(() => {
        utterance.start()
      })
      expect(result.current.isSpeaking).toBe(true)

      act(() => {
        utterance.finish()
      })
      expect(result.current.isSpeaking).toBe(false)
    })

    it('clears the speaking flag when synthesis errors', () => {
      const { result } = renderVoiceHook(storedSettings())

      act(() => {
        result.current.speak('Broken line')
      })
      const utterance = lastUtterance()
      act(() => {
        utterance.start()
      })
      expect(result.current.isSpeaking).toBe(true)

      act(() => {
        utterance.fail()
      })
      expect(result.current.isSpeaking).toBe(false)
    })
  })

  describe('stop', () => {
    it('cancels speech and clears the speaking flag', () => {
      const { result } = renderVoiceHook(storedSettings())

      act(() => {
        result.current.speak('Long narration')
      })
      const utterance = lastUtterance()
      act(() => {
        utterance.start()
      })
      expect(result.current.isSpeaking).toBe(true)

      act(() => {
        result.current.stop()
      })

      expect(synth.cancelCount).toBe(1)
      expect(result.current.isSpeaking).toBe(false)
    })
  })
})
