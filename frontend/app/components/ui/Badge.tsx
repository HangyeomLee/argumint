import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to conditionally join Tailwind CSS classes.
 * It uses `clsx` for conditional class joining and `tailwind-merge` to resolve Tailwind conflicts.
 * @param {ClassValue[]} inputs - An array of class names, conditional objects, or arrays.
 * @returns {string} A merged string of Tailwind CSS classes.
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Props for the Badge component.
 */
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The visual style variant of the badge. */
  variant?: 'primary' | 'secondary' | 'support' | 'oppose' | 'neutral';
}

/**
 * Renders a small, customizable badge component.
 * It supports different visual variants and can be extended with additional HTML attributes.
 */
export const Badge = ({ className, variant = 'primary', ...props }: BadgeProps) => {
  // Define base styles for each badge variant.
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
        variants[variant], // Apply variant-specific styles
        className // Apply any additional custom classes
      )}
      {...props}
    />
  );
};
