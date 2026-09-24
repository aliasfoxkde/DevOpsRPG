import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// The generator holds a module-level singleton, so every test loads a fresh
// copy of the module to start from a known "audio never initialised" state.
type SoundEffectsModule = typeof import('./useSoundEffects')

// The playSound sound-name union is not exported, so it is derived from the
// hook's public surface to keep the table below exhaustively typed.
type SoundName = Parameters<ReturnType<SoundEffectsModule['useSoundEffects']>['playSound']>[0]

interface RecordedEvent {
  method: string
  args: number[]
}

/** Records every automation event in call order. */
class FakeAudioParam {
  readonly events: RecordedEvent[] = []
  value = 0

  setValueAtTime(value: number, startTime: number): this {
    this.events.push({ method: 'setValueAtTime', args: [value, startTime] })
    return this
  }

  exponentialRampToValueAtTime(value: number, endTime: number): this {
    this.events.push({ method: 'exponentialRampToValueAtTime', args: [value, endTime] })
    return this
  }

  values(method: string): number[] {
    return this.events.filter((event) => event.method === method).map((event) => event.args[0])
  }
}

/** Placeholder for ctx.destination so connection targets can be asserted. */
class FakeDestination {
  readonly kind = 'destination'
}

class FakeOscillator {
  // null until the generator explicitly assigns a waveform
  type: OscillatorType | null = null
  readonly frequency = new FakeAudioParam()
  readonly detune = new FakeAudioParam()
  readonly connections: unknown[] = []
  readonly started: number[] = []
  readonly stopped: number[] = []

  connect(node: unknown): unknown {
    this.connections.push(node)
    return node
  }

  start(when?: number): void {
    this.started.push(when ?? 0)
  }

  stop(when?: number): void {
    this.stopped.push(when ?? 0)
  }
}

class FakeGain {
  readonly gain = new FakeAudioParam()
  readonly connections: unknown[] = []

  connect(node: unknown): unknown {
    this.connections.push(node)
    return node
  }
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = []
  // Configured per test before the generator constructs a context.
  static nextState: AudioContextState = 'running'
  static failConstruction = false

  readonly state: AudioContextState
  readonly currentTime = 0
  readonly destination = new FakeDestination()
  readonly oscillators: FakeOscillator[] = []
  readonly gains: FakeGain[] = []
  resumeCount = 0

  constructor() {
    if (FakeAudioContext.failConstruction) {
      throw new DOMException('AudioContext is not allowed', 'NotAllowedError')
    }
    this.state = FakeAudioContext.nextState
    FakeAudioContext.instances.push(this)
  }

  createOscillator(): FakeOscillator {
    const oscillator = new FakeOscillator()
    this.oscillators.push(oscillator)
    return oscillator
  }

  createGain(): FakeGain {
    const gain = new FakeGain()
    this.gains.push(gain)
    return gain
  }

  resume(): Promise<void> {
    this.resumeCount += 1
    return Promise.resolve()
  }
}

const STORAGE_KEY = 'soundEnabled'

interface SoundProfile {
  type: OscillatorType | null
  /** Pitch steps as [frequency, offset-in-seconds] pairs. */
  notes: [number, number][]
  startGain: number
  endsAt: number
}

// Signature of every sound the generator synthesises, transcribed from the
// switch statement in useSoundEffects.ts so each branch is asserted.
const SOUND_PROFILES: Record<SoundName, SoundProfile> = {
  correct: {
    type: null,
    notes: [
      [523.25, 0],
      [659.25, 0.1],
    ],
    startGain: 0.3,
    endsAt: 0.3,
  },
  incorrect: {
    type: null,
    notes: [
      [200, 0],
      [150, 0.1],
    ],
    startGain: 0.3,
    endsAt: 0.3,
  },
  levelUp: {
    type: 'sine',
    notes: [
      [523.25, 0],
      [659.25, 0.1],
      [783.99, 0.2],
      [1046.5, 0.3],
    ],
    startGain: 0.3,
    endsAt: 0.5,
  },
  questComplete: {
    type: 'sine',
    notes: [
      [392, 0],
      [523.25, 0.15],
      [659.25, 0.3],
    ],
    startGain: 0.3,
    endsAt: 0.5,
  },
  badge: {
    type: 'sine',
    notes: [
      [800, 0],
      [1000, 0.05],
      [1200, 0.1],
    ],
    startGain: 0.2,
    endsAt: 0.2,
  },
  milestone: {
    type: 'sine',
    notes: [
      [523.25, 0],
      [659.25, 0.1],
      [783.99, 0.2],
      [1046.5, 0.3],
      [783.99, 0.4],
      [1046.5, 0.5],
    ],
    startGain: 0.3,
    endsAt: 0.7,
  },
  click: { type: 'sine', notes: [[600, 0]], startGain: 0.1, endsAt: 0.05 },
  success: {
    type: 'sine',
    notes: [
      [523.25, 0],
      [659.25, 0.1],
      [783.99, 0.2],
    ],
    startGain: 0.3,
    endsAt: 0.4,
  },
  achievement: {
    type: 'triangle',
    notes: [
      [587.33, 0],
      [739.99, 0.1],
      [880, 0.2],
      [987.77, 0.3],
    ],
    startGain: 0.25,
    endsAt: 0.5,
  },
  coin: {
    type: 'sine',
    notes: [
      [988, 0],
      [1319, 0.05],
    ],
    startGain: 0.2,
    endsAt: 0.15,
  },
}

const SOUND_NAMES = Object.keys(SOUND_PROFILES) as SoundName[]

let hookModule: SoundEffectsModule | undefined

/** The freshly imported hook factory for the current test. */
function useSoundEffects(): ReturnType<SoundEffectsModule['useSoundEffects']> {
  const loaded = hookModule
  if (!loaded) throw new Error('sound effects module was not loaded for this test')
  return loaded.useSoundEffects()
}

/** The context created by the generator for the current test. */
function onlyContext(): FakeAudioContext {
  expect(FakeAudioContext.instances).toHaveLength(1)
  return FakeAudioContext.instances[0]
}

/** The oscillator produced by the most recent playSound call. */
function lastOscillator(): FakeOscillator {
  const oscillators = onlyContext().oscillators
  if (oscillators.length === 0) throw new Error('expected a synthesised voice')
  return oscillators[oscillators.length - 1]
}

function lastGain(): FakeGain {
  const gains = onlyContext().gains
  if (gains.length === 0) throw new Error('expected a gain node')
  return gains[gains.length - 1]
}

/** Opts in to sound and initialises the AudioContext the way a user gesture
 * does, so playSound() actually reaches the Web Audio API. */
function renderUnmutedHook() {
  localStorage.setItem(STORAGE_KEY, 'true')
  const hook = renderHook(() => useSoundEffects())
  expect(hook.result.current.isMuted).toBe(false)
  act(() => {
    hook.result.current.initAudio()
  })
  return hook
}

describe('useSoundEffects', () => {
  beforeEach(async () => {
    localStorage.clear()
    FakeAudioContext.instances = []
    FakeAudioContext.nextState = 'running'
    FakeAudioContext.failConstruction = false
    vi.stubGlobal('AudioContext', FakeAudioContext)
    vi.resetModules()
    hookModule = await import('./useSoundEffects')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('mute preference', () => {
    it('starts muted by default and persists the opt-out', () => {
      const { result } = renderHook(() => useSoundEffects())

      expect(result.current.isMuted).toBe(true)
      expect(localStorage.getItem(STORAGE_KEY)).toBe('false')
    })

    it('honours a stored opt-in', () => {
      localStorage.setItem(STORAGE_KEY, 'true')
      const { result } = renderHook(() => useSoundEffects())

      expect(result.current.isMuted).toBe(false)
    })

    it('honours a stored "false" as muted', () => {
      localStorage.setItem(STORAGE_KEY, 'false')
      const { result } = renderHook(() => useSoundEffects())

      expect(result.current.isMuted).toBe(true)
    })

    it('unmutes on toggleMute and writes the new preference', () => {
      const { result } = renderHook(() => useSoundEffects())

      act(() => {
        result.current.toggleMute()
      })

      expect(result.current.isMuted).toBe(false)
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true')
    })

    it('toggles back to muted through toggleMute', () => {
      localStorage.setItem(STORAGE_KEY, 'true')
      const { result } = renderHook(() => useSoundEffects())

      act(() => {
        result.current.toggleMute()
      })

      expect(result.current.isMuted).toBe(true)
      expect(localStorage.getItem(STORAGE_KEY)).toBe('false')
    })

    it('applies an explicit value through setMuted', () => {
      const { result } = renderHook(() => useSoundEffects())

      act(() => {
        result.current.setMuted(false)
      })
      expect(result.current.isMuted).toBe(false)
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true')

      act(() => {
        result.current.setMuted(true)
      })
      expect(result.current.isMuted).toBe(true)
      expect(localStorage.getItem(STORAGE_KEY)).toBe('false')
    })
  })

  describe('audio context lifecycle', () => {
    it('plays nothing before the user gesture initialises audio', () => {
      localStorage.setItem(STORAGE_KEY, 'true')
      const { result } = renderHook(() => useSoundEffects())

      act(() => {
        result.current.playSound('click')
      })

      expect(FakeAudioContext.instances).toHaveLength(0)
    })

    it('plays nothing while muted even when audio is initialised', () => {
      const hook = renderUnmutedHook()
      act(() => {
        hook.result.current.setMuted(true)
      })

      act(() => {
        hook.result.current.playSound('click')
      })

      expect(onlyContext().oscillators).toHaveLength(0)
    })

    it('initialises a single context and does not recreate it', () => {
      const { result } = renderUnmutedHook()

      act(() => {
        result.current.initAudio()
      })

      expect(FakeAudioContext.instances).toHaveLength(1)
    })

    it('resumes a suspended context to satisfy autoplay policy', () => {
      FakeAudioContext.nextState = 'suspended'
      renderHook(() => useSoundEffects())

      expect(FakeAudioContext.instances).toHaveLength(0)
      const { result } = renderHook(() => useSoundEffects())
      act(() => {
        result.current.initAudio()
      })

      expect(FakeAudioContext.instances).toHaveLength(1)
      expect(onlyContext().resumeCount).toBe(1)
    })

    it('does not resume an already running context', () => {
      const { result } = renderHook(() => useSoundEffects())

      act(() => {
        result.current.initAudio()
      })

      expect(onlyContext().resumeCount).toBe(0)
    })

    it('survives an AudioContext that cannot be created and recovers later', () => {
      localStorage.setItem(STORAGE_KEY, 'true')
      FakeAudioContext.failConstruction = true
      const { result } = renderHook(() => useSoundEffects())

      act(() => {
        result.current.initAudio()
      })
      act(() => {
        result.current.playSound('click')
      })

      expect(FakeAudioContext.instances).toHaveLength(0)

      FakeAudioContext.failConstruction = false
      act(() => {
        result.current.initAudio()
      })
      act(() => {
        result.current.playSound('click')
      })

      expect(onlyContext().oscillators).toHaveLength(1)
    })
  })

  describe('sound synthesis', () => {
    it.each(SOUND_NAMES)(
      'routes "%s" through one oscillator and gain into the destination',
      (sound) => {
        const hook = renderUnmutedHook()

        act(() => {
          hook.result.current.playSound(sound)
        })

        const context = onlyContext()
        expect(context.oscillators).toHaveLength(1)
        expect(context.gains).toHaveLength(1)
        const oscillator = lastOscillator()
        const gain = lastGain()
        expect(oscillator.connections[0]).toBe(gain)
        expect(gain.connections[0]).toBe(context.destination)
        expect(oscillator.started).toEqual([0])
      },
    )

    it.each(SOUND_NAMES)('synthesises "%s" with its documented envelope', (sound) => {
      const profile = SOUND_PROFILES[sound]
      const hook = renderUnmutedHook()

      act(() => {
        hook.result.current.playSound(sound)
      })

      const oscillator = lastOscillator()
      const gain = lastGain()

      expect(oscillator.type).toBe(profile.type)
      expect(oscillator.frequency.events.filter((e) => e.method === 'setValueAtTime')).toEqual(
        profile.notes.map(([frequency, offset]) => ({
          method: 'setValueAtTime',
          args: [frequency, offset],
        })),
      )
      expect(gain.gain.values('setValueAtTime')).toEqual([profile.startGain])
      expect(gain.gain.values('exponentialRampToValueAtTime')).toEqual([0.01])
      expect(oscillator.stopped).toEqual([profile.endsAt])
    })

    it('ramps every sound down to silence with an exponential curve', () => {
      const hook = renderUnmutedHook()

      act(() => {
        hook.result.current.playSound('questComplete')
      })

      const gain = lastGain()
      expect(gain.gain.events.map((event) => event.method)).toEqual([
        'setValueAtTime',
        'exponentialRampToValueAtTime',
      ])
      expect(gain.gain.events.map((event) => event.args[1])).toEqual([0, 0.5])
    })

    it('emits a fresh oscillator for every sound', () => {
      const hook = renderUnmutedHook()

      act(() => {
        hook.result.current.playSound('click')
      })
      act(() => {
        hook.result.current.playSound('coin')
      })

      const context = onlyContext()
      expect(context.oscillators).toHaveLength(2)
      expect(context.gains).toHaveLength(2)
      expect(lastOscillator().frequency.values('setValueAtTime')).toEqual([988, 1319])
      expect(lastGain().gain.values('setValueAtTime')).toEqual([0.2])
    })
  })
})
