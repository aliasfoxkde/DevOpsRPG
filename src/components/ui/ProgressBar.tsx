import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'success' | 'warning' | 'error'
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  className,
  ...props
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0

  return (
    <div
      className={clsx('w-full bg-muted rounded-full overflow-hidden', className)}
      {...props}
    >
      <div
        className={clsx(
          'h-full transition-all duration-300 ease-out rounded-full',
          {
            'h-1': size === 'sm',
            'h-2': size === 'md',
            'h-3': size === 'lg',
          },
          {
            'bg-primary': color === 'primary',
            'bg-green-500': color === 'success',
            'bg-yellow-500': color === 'warning',
            'bg-red-500': color === 'error',
          }
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
