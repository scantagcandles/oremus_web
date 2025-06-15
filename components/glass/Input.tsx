'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  textarea?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, textarea, ...props }, ref) => {
    const inputClasses = twMerge(
      'w-full px-4 py-2 bg-glass-white/10 border border-glass-white/20 rounded-lg text-white placeholder-white/50',
      'focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      error && 'border-red-500 focus:ring-red-500',
      className
    );

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-white">
            {label}
          </label>
        )}
        <div className="relative">
          {textarea ? (
            <textarea
              className={inputClasses}
              rows={4}
              {...props}
            />
          ) : (
            <input
              ref={ref}
              className={inputClasses}
              {...props}
            />
          )}
          {error && (
            <p className="mt-1 text-sm text-red-500">{error}</p>
          )}
        </div>
      </div>
    );
  }
) as any; // TODO: Fix typing for textarea support

Input.displayName = 'Input';
