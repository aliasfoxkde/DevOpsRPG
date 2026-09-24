import { describe, it, expect, beforeEach, afterEach, vi, type MockInstance } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Confetti } from './Confetti'

// jsdom ships no canvas implementation, so a recording 2D context stands in
// for the real one: every call the component makes is captured for assertion.
class RecordedContext2D implements CanvasRenderingContext2D {
  readonly canvas: HTMLCanvasElement

  globalAlpha = 1
  globalCompositeOperation: GlobalCompositeOperation = 'source-over'
  fillStyle: string | CanvasGradient | CanvasPattern = '#000000'
  strokeStyle: string | CanvasGradient | CanvasPattern = '#000000'
  filter = 'none'
  imageSmoothingEnabled = true
  imageSmoothingQuality: ImageSmoothingQuality = 'low'
  lineCap: CanvasLineCap = 'butt'
  lineDashOffset = 0
  lineJoin: CanvasLineJoin = 'miter'
  lineWidth = 1
  miterLimit = 10
  shadowBlur = 0
  shadowColor = 'rgba(0, 0, 0, 0)'
  shadowOffsetX = 0
  shadowOffsetY = 0
  direction: CanvasDirection = 'inherit'
  font = '10px sans-serif'
  fontKerning: CanvasFontKerning = 'auto'
  fontStretch: CanvasFontStretch = 'normal'
  fontVariantCaps: CanvasFontVariantCaps = 'normal'
  letterSpacing = '0px'
  textAlign: CanvasTextAlign = 'start'
  textBaseline: CanvasTextBaseline = 'alphabetic'
  textRendering: CanvasTextRendering = 'auto'
  wordSpacing = '0px'

  readonly arc = vi.fn()
  readonly arcTo = vi.fn()
  readonly beginPath = vi.fn()
  readonly bezierCurveTo = vi.fn()
  readonly clearRect = vi.fn()
  readonly clip = vi.fn()
  readonly closePath = vi.fn()
  readonly createConicGradient = vi.fn()
  readonly createImageData = vi.fn()
  readonly createLinearGradient = vi.fn()
  readonly createPattern = vi.fn()
  readonly createRadialGradient = vi.fn()
  readonly drawFocusIfNeeded = vi.fn()
  readonly drawImage = vi.fn()
  readonly ellipse = vi.fn()
  readonly fill = vi.fn()
  readonly fillRect = vi.fn()
  readonly fillText = vi.fn()
  readonly getImageData = vi.fn()
  readonly getTransform = vi.fn()
  readonly getLineDash = vi.fn((): number[] => [])
  readonly isContextLost = vi.fn()
  readonly isPointInPath = vi.fn()
  readonly isPointInStroke = vi.fn()
  readonly lineTo = vi.fn()
  readonly measureText = vi.fn()
  readonly moveTo = vi.fn()
  readonly putImageData = vi.fn()
  readonly quadraticCurveTo = vi.fn()
  readonly rect = vi.fn()
  readonly reset = vi.fn()
  readonly resetTransform = vi.fn()
  readonly restore = vi.fn()
  readonly rotate = vi.fn()
  readonly roundRect = vi.fn()
  readonly save = vi.fn()
  readonly scale = vi.fn()
  readonly setLineDash = vi.fn<(segments: number[]) => void>()
  readonly setTransform = vi.fn()
  readonly stroke = vi.fn()
  readonly strokeRect = vi.fn()
  readonly strokeText = vi.fn()
  readonly transform = vi.fn()
  readonly translate = vi.fn<(x: number, y: number) => void>()

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  getContextAttributes(): CanvasRenderingContext2DSettings {
    return { colorSpace: 'srgb' }
  }

  /** Squares, circles and triangles all end in one of these two calls. */
  get drawCallCount(): number {
    return this.fillRect.mock.calls.length + this.fill.mock.calls.length
  }
}

// Animation frames are queued rather than scheduled, so each test decides when
// the browser "paints" and can inspect what is still pending.
let frameCallbacks: Map<number, (time: number) => void>
let nextFrameHandle: number

function stubAnimationFrames() {
  frameCallbacks = new Map()
  nextFrameHandle = 1
  vi.stubGlobal('requestAnimationFrame', (callback: (time: number) => void): number => {
    frameCallbacks.set(nextFrameHandle, callback)
    return nextFrameHandle++
  })
  vi.stubGlobal('cancelAnimationFrame', (handle: number): void => {
    frameCallbacks.delete(handle)
  })
}

/** Advances the fake clock by one frame and then runs the queued callbacks. */
function runFrame(stepMs = 16) {
  const pending = [...frameCallbacks.values()]
  frameCallbacks.clear()
  vi.advanceTimersByTime(stepMs)
  let time = 0
  for (const callback of pending) {
    callback(time)
    time += 16
  }
}

let context: RecordedContext2D
let getContextSpy: MockInstance
let randomSpy: MockInstance<() => number>

beforeEach(() => {
  vi.useFakeTimers()
  stubAnimationFrames()
  context = new RecordedContext2D(document.createElement('canvas'))
  getContextSpy = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockImplementation(() => context)
  // Each particle draws nine values from Math.random, the last of which picks
  // its shape. Cycling only that ninth value makes every particle identical
  // except for its shape, which rotates square -> circle -> triangle.
  // A roll under 1/3 gives square, under 2/3 circle, otherwise triangle.
  const shapeRolls = [0.05, 0.5, 0.95]
  let callIndex = 0
  randomSpy = vi.spyOn(Math, 'random').mockImplementation(() => {
    const positionInParticle = callIndex % 9
    const particleIndex = Math.floor(callIndex / 9)
    callIndex += 1
    if (positionInParticle === 8) {
      return shapeRolls[particleIndex % 3]
    }
    return 0.5
  })
})

afterEach(() => {
  getContextSpy.mockRestore()
  randomSpy.mockRestore()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('Confetti', () => {
  it('renders nothing while it is inactive', () => {
    const { container } = render(<Confetti active={false} />)

    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByRole('presentation')).toBeNull()
    expect(getContextSpy).not.toHaveBeenCalled()
    expect(frameCallbacks.size).toBe(0)
  })

  it('paints onto a fixed, screen sized canvas when activated', () => {
    const { container } = render(<Confetti active />)

    const canvas = container.firstElementChild
    expect(canvas).toBeInstanceOf(HTMLCanvasElement)
    expect(canvas).toHaveClass('fixed', 'inset-0', 'pointer-events-none')
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
    expect(canvas).toHaveProperty('width', window.innerWidth)
    expect(canvas).toHaveProperty('height', window.innerHeight)
  })

  it('spawns exactly one hundred and fifty particles', () => {
    render(<Confetti active />)

    // save/restore bracket every particle, one pair each
    expect(context.save.mock.calls).toHaveLength(150)
    expect(context.restore.mock.calls).toHaveLength(150)
    expect(context.fillStyle).toBeTypeOf('string')
  })

  it('draws fifty of each shape every frame', () => {
    render(<Confetti active />)

    expect(context.fillRect.mock.calls).toHaveLength(50) // squares
    expect(context.arc.mock.calls).toHaveLength(50) // circles
    expect(context.moveTo.mock.calls).toHaveLength(50) // triangles
    // circles and triangles both finish with fill(), squares do not
    expect(context.fill.mock.calls).toHaveLength(100)
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, window.innerWidth, window.innerHeight)
  })

  it('draws each particle at its own position, rotation, scale and colour', () => {
    render(<Confetti active />)

    // every square is drawn around its centre with a 10px side
    expect(context.fillRect.mock.calls[0]).toEqual([-5, -5, 10, 10])
    expect(context.translate).toHaveBeenCalledTimes(150)
    expect(context.rotate).toHaveBeenCalledTimes(150)
    expect(context.rotate).toHaveBeenCalledWith(Math.PI)
    expect(context.scale).toHaveBeenCalledTimes(150)
    expect(context.scale).toHaveBeenCalledWith(0.75, 0.75)

    // particles are spawned above the viewport...
    const firstTranslate = context.translate.mock.calls[0]
    expect(firstTranslate[0]).toBeCloseTo(window.innerWidth * 0.5)
    expect(firstTranslate[1]).toBeLessThan(0)
    expect(firstTranslate[1]).toBeGreaterThan(-100)
  })

  it('moves every particle downwards on the next frame', () => {
    render(<Confetti active />)

    const yAtFirstFrame = context.translate.mock.calls[0][1]
    runFrame()

    // frame two draws the same 150 particles, one step lower
    expect(context.translate).toHaveBeenCalledTimes(300)
    expect(context.translate.mock.calls[150][1]).toBeGreaterThan(yAtFirstFrame)
  })

  it('keeps animating while the duration has not elapsed', () => {
    render(<Confetti active duration={1000} />)

    const firstFrameDraws = context.drawCallCount
    expect(firstFrameDraws).toBe(150)

    runFrame()
    runFrame()
    expect(context.drawCallCount).toBe(firstFrameDraws + 300)
    expect(frameCallbacks.size).toBe(1)
  })

  it('applies gravity so particles leave the screen and drawing stops', () => {
    render(<Confetti active duration={120_000} />)

    // Ten frames in, every particle is still above the bottom edge
    for (let frame = 0; frame < 10; frame++) {
      runFrame()
    }
    expect(context.drawCallCount).toBe(150 * 11)

    // ...but gravity carries them past the canvas long before the duration
    // elapses, and off-screen particles are no longer drawn.
    for (let frame = 10; frame < 200; frame++) {
      runFrame()
    }
    expect(context.drawCallCount).toBeLessThan(150 * 110)
    expect(context.drawCallCount).toBeGreaterThan(150 * 11)

    // Once the last particle has fallen out, the loop keeps running (the
    // duration is far from over) but draws nothing further.
    const drawsAfterFall = context.drawCallCount
    for (let frame = 0; frame < 50; frame++) {
      runFrame()
    }
    expect(context.drawCallCount).toBe(drawsAfterFall)
  })

  it('bounces a particle off the right wall and damps its sideways speed', () => {
    // Re-seed the roll cycle: the x spawn lands just inside the right edge and
    // the velocityX roll pushes it across, so the wall bounce has to reverse it.
    const startX = 0.999 * window.innerWidth
    const velocityX = 1.5 // a roll of 0.6875 gives (0.6875 - 0.5) * 8
    let callIndex = 0
    randomSpy.mockImplementation(() => {
      const positionInParticle = callIndex % 9
      callIndex += 1
      if (positionInParticle === 0) return 0.999
      if (positionInParticle === 5) return 0.6875
      return 0.5
    })

    render(<Confetti active duration={60_000} />)

    const xAt = (index: number) => context.translate.mock.calls[index][0]
    // The first painted frame already includes one physics step, which carries
    // the piece past the right edge.
    expect(xAt(0)).toBeCloseTo(startX + velocityX, 3)
    expect(xAt(0)).toBeGreaterThan(window.innerWidth)

    runFrame()
    // The bounce sends it back at half the speed, with air resistance applied,
    // and that step lands it back inside the canvas.
    expect(xAt(150)).toBeCloseTo(startX + velocityX - velocityX * 0.495, 3)
    expect(xAt(150)).toBeLessThan(window.innerWidth)

    runFrame()
    // and it keeps drifting left from there.
    expect(xAt(300)).toBeLessThan(xAt(150))
  })

  it('clears the canvas and stops the loop once the duration has passed', () => {
    render(<Confetti active duration={1000} />)

    for (let frame = 0; frame < 64 && frameCallbacks.size > 0; frame++) {
      runFrame()
    }

    expect(frameCallbacks.size).toBe(0)
    const clears = context.clearRect.mock.calls.length
    expect(clears).toBeGreaterThan(60)
    const drawsBefore = context.drawCallCount
    runFrame(500)
    expect(context.drawCallCount).toBe(drawsBefore)
    expect(context.clearRect.mock.calls.length).toBe(clears)
  })

  it('releases its animation frame when it unmounts mid-burst', () => {
    const { unmount } = render(<Confetti active duration={5000} />)

    expect(frameCallbacks.size).toBe(1)
    unmount()

    expect(frameCallbacks.size).toBe(0)
  })

  it('stays on screen without animating when the canvas has no 2d context', () => {
    getContextSpy.mockRestore()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null)

    const { container } = render(<Confetti active />)

    expect(container.querySelector('canvas')).not.toBeNull()
    expect(frameCallbacks.size).toBe(0)
    expect(context.clearRect).not.toHaveBeenCalled()
  })
})
