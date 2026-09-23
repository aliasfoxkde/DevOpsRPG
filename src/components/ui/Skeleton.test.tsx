import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import {
  Skeleton,
  SkeletonCard,
  SkeletonQuestCard,
  SkeletonShopItem,
  SkeletonRealmCard,
} from './Skeleton'

describe('Skeleton', () => {
  it('renders a pulsing placeholder element', () => {
    const { container } = render(<Skeleton />)
    const node = container.firstElementChild

    expect(node?.tagName).toBe('DIV')
    expect(node).toHaveClass('animate-pulse')
    expect(node).toHaveClass('bg-slate-700/50')
  })

  it('merges caller classes onto the placeholder', () => {
    const { container } = render(<Skeleton className="h-4 w-48 rounded" />)
    const node = container.firstElementChild as HTMLElement

    expect(node).toHaveClass('h-4')
    expect(node).toHaveClass('w-48')
    expect(node).toHaveClass('rounded')
    expect(node).toHaveClass('animate-pulse')
  })
})

describe('SkeletonCard', () => {
  it('renders the avatar, title, subtitle and badge placeholders', () => {
    const { container } = render(<SkeletonCard />)
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4)
    expect(container.querySelector('.w-12.h-12')).not.toBeNull()
    expect(container.querySelector('.h-5.w-3\\/4')).not.toBeNull()
    expect(container.querySelector('.h-4.w-1\\/2')).not.toBeNull()
  })
})

describe('SkeletonQuestCard', () => {
  it('renders the quest row placeholders including badge and stat chips', () => {
    const { container } = render(<SkeletonQuestCard />)
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(6)
    expect(container.querySelectorAll('.h-3.w-16')).toHaveLength(2)
    expect(container.querySelector('.w-20.h-6.rounded-full')).not.toBeNull()
  })
})

describe('SkeletonShopItem', () => {
  it('renders the shop image, name, price and action placeholders', () => {
    const { container } = render(<SkeletonShopItem />)
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(5)
    // Image + name + price sit above the divider, two buttons below it
    expect(container.querySelector('.w-16.h-16.rounded-full')).not.toBeNull()
    expect(container.querySelectorAll('.border-t .animate-pulse')).toHaveLength(2)
  })
})

describe('SkeletonRealmCard', () => {
  it('renders the realm header, description and three reward chips', () => {
    const { container } = render(<SkeletonRealmCard />)
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(8)
    expect(container.querySelectorAll('.h-6.w-20.rounded-full')).toHaveLength(3)
  })
})
