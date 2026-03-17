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
 * Props for the Card component.
 */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The padding size for the card. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** If true, the card will have a hover effect. */
  hover?: boolean;
}

/**
 * Renders a customizable card component that can be used to group related content.
 * It supports different padding sizes and an optional hover effect.
 */
export const Card = ({ 
  children, 
  className, 
  padding = 'md', 
  hover = false,
  ...props 
}: CardProps) => {
  // Define padding classes for different sizes.
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div 
      className={cn(
        'bg-white dark:bg-zinc-900 border border-brand-100 dark:border-zinc-800 rounded-2xl shadow-soft overflow-hidden',
        paddings[padding], // Apply selected padding
        hover && 'hover:shadow-premium hover:border-brand-200 transition-all duration-300', // Apply hover effect if enabled
        className // Apply any additional custom classes
      )}
      {...props}
    >
      {children}
    </div>
  );
};
