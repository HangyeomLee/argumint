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
 * Props for the Button component.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The visual style variant of the button. */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'support' | 'oppose';
  /** The size of the button. */
  size?: 'sm' | 'md' | 'lg' | 'icon';
  /** If true, a loading spinner will be displayed and the button will be disabled. */
  isLoading?: boolean;
}

/**
 * Renders a customizable button component with support for different variants, sizes,
 * and a loading state. It forwards refs to the underlying HTML button element.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    // Define base styles for each button variant.
    const variants = {
      primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-500/20',
      secondary: 'bg-brand-100 text-brand-700 hover:bg-brand-200',
      outline: 'border-2 border-brand-200 text-brand-700 hover:bg-brand-50',
      ghost: 'text-brand-600 hover:bg-brand-50',
      support: 'bg-support-main text-white hover:bg-blue-600 shadow-md shadow-blue-500/20',
      oppose: 'bg-oppose-main text-white hover:bg-rose-600 shadow-md shadow-rose-500/20',
    };

    // Define base styles for each button size.
    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
      icon: 'p-2', // Icon-only button size
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant], // Apply variant-specific styles
          sizes[size], // Apply size-specific styles
          isLoading && 'opacity-70 pointer-events-none', // Reduce opacity and disable interactions when loading
          className // Apply any additional custom classes
        )}
        {...props}
      >
        {/* Loading spinner, conditionally rendered */}
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
