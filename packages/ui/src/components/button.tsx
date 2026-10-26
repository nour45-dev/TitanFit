import React from 'react';
import { cn } from '../utils.js';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly isLoading?: boolean;
  readonly startIcon?: React.ReactNode;
  readonly endIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 focus-visible:ring-emerald-400 shadow-sm',
  secondary:
    'bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 focus-visible:ring-amber-400 shadow-sm',
  outline:
    'border border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800/70 focus-visible:ring-emerald-400',
  ghost:
    'bg-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white focus-visible:ring-emerald-400',
  danger:
    'bg-red-500 text-white font-semibold hover:bg-red-400 focus-visible:ring-red-400 shadow-sm',
};

/**
 * Enforces minimum 44px height (`min-h-[44px]`) for touch accessibility (WCAG 2.1 AA)
 * and uses logical padding (`ps-*`, `pe-*`, `gap-*`) for seamless RTL/LTR layout.
 */
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-[44px] ps-3.5 pe-3.5 py-2 text-sm rounded-lg gap-2',
  md: 'min-h-[44px] ps-5 pe-5 py-2.5 text-sm rounded-xl gap-2.5',
  lg: 'min-h-[48px] ps-6 pe-6 py-3 text-base rounded-xl gap-3',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      startIcon,
      endIcon,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-150 select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
          'disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99]',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        ) : (
          startIcon
        )}
        <span>{children}</span>
        {!isLoading && endIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';
