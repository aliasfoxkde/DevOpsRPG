import { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'bordered', role, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={role ?? 'region'}
        className={clsx(
          'rounded-lg',
          {
            '': variant === 'default',
            'border border-border bg-card': variant === 'bordered',
            'bg-card shadow-md': variant === 'elevated',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

export { Card }
