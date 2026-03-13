import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card = ({ 
  children, 
  className, 
  padding = 'md', 
  hover = false,
  ...props 
}: CardProps) => {
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
        paddings[padding],
        hover && 'hover:shadow-premium hover:border-brand-200 transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
