import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// RTL's auto-cleanup registers through whichever module first imports it, so
// it only anchors to one file when workers are shared across suites (vitest
// isolate: false). Registering it here makes DOM cleanup explicit for every
// file, isolated or not.
afterEach(() => {
  cleanup()
})
