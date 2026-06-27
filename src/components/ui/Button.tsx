import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        aria-disabled={disabled}
        className={clsx(
          'inline-flex items-center justify-center font-medium rounded-lg transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-amber-600 text-white hover:bg-amber-500 active:bg-amber-700': variant === 'primary',
            'bg-slate-700 text-white hover:bg-slate-600 active:bg-slate-800': variant === 'secondary',
            'border border-slate-600 bg-transparent hover:bg-slate-800': variant === 'outline',
            'bg-transparent hover:bg-slate-800 text-slate-300': variant === 'ghost',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
