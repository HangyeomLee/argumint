import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'support' | 'oppose' | 'neutral';
}

export const Badge = ({ className, variant = 'primary', ...props }: BadgeProps) => {
  const variants = {
    primary: 'bg-brand-100 text-brand-700 border-brand-200',
    secondary: 'bg-brand-50 text-brand-600 border-brand-100',
    support: 'bg-support-bg text-support-text border-support-border',
    oppose: 'bg-oppose-bg text-oppose-text border-oppose-border',
    neutral: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};
