import React from 'react';
import { cn } from '../utils.js';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly glass?: boolean;
}

export function Card({ className, glass = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-6 transition-all duration-200',
        glass
          ? 'border-slate-800/80 bg-slate-900/70 backdrop-blur-md shadow-xl'
          : 'border-slate-800 bg-slate-900/95 shadow-lg',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type BadgeTone = 'emerald' | 'amber' | 'red' | 'blue' | 'slate';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly tone?: BadgeTone;
}

const badgeTones: Record<BadgeTone, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  red: 'bg-red-500/15 text-red-300 border-red-500/30',
  blue: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  slate: 'bg-slate-800 text-slate-300 border-slate-700',
};

export function Badge({ className, tone = 'emerald', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border ps-3 pe-3 py-1 text-xs font-medium',
        badgeTones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly error?: string;
  readonly hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-200">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'min-h-[44px] w-full rounded-xl border bg-slate-950/90 ps-4 pe-4 py-2.5 text-sm text-slate-100',
            'placeholder:text-slate-500 transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400',
            error ? 'border-red-500' : 'border-slate-800 hover:border-slate-700',
            className,
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
        {error && (
          <p id={errorId} role="alert" className="text-xs font-medium text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-xl bg-slate-800/80', className)}
      {...props}
    />
  );
}

export interface EmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly icon?: React.ReactNode;
  readonly action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center">
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
