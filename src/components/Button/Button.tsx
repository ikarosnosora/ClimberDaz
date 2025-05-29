import React from 'react';
import { animations } from '../../utils/designSystem';

/**
 * Enhanced Button Component Props
 */
interface ButtonProps {
  /** Button content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Visual variant of the button */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** HTML button type */
  type?: 'button' | 'submit' | 'reset';
  /** Additional CSS classes */
  className?: string;
  /** Icon to display before text */
  startIcon?: React.ReactNode;
  /** Icon to display after text */
  endIcon?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
}

/**
 * Modern Button Component with Climbing-Inspired Design
 * 
 * Features:
 * - Multiple visual variants with gradients
 * - Smooth hover animations and micro-interactions
 * - Loading states with custom spinner
 * - Icon support with proper spacing
 * - Consistent sizing and accessibility
 * 
 * @example
 * ```tsx
 * <Button variant="primary" startIcon={<ClimbIcon />}>
 *   加入活动
 * </Button>
 * ```
 */
const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  startIcon,
  endIcon,
  fullWidth = false,
}) => {
  // Base styles with improved accessibility and animations
  const baseStyles = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'ease-smooth',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'transform',
    'active:scale-95',
    'disabled:transform-none',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
    'relative',
    'overflow-hidden',
  ].join(' ');

  // Size variations with proper touch targets
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm min-h-[36px] gap-1.5',
    md: 'px-4 py-2.5 text-sm min-h-[40px] gap-2',
    lg: 'px-6 py-3 text-base min-h-[44px] gap-2.5',
  };

  // Enhanced variant styles with gradients and hover effects
  const variantStyles = {
    primary: [
      'bg-gradient-to-r from-primary-500 to-primary-600',
      'text-white',
      'shadow-soft',
      'hover:from-primary-600 hover:to-primary-700',
      'hover:shadow-medium',
      'focus:ring-primary-500',
      'active:from-primary-700 active:to-primary-800',
    ].join(' '),
    
    secondary: [
      'bg-gradient-to-r from-secondary-500 to-secondary-600',
      'text-white',
      'shadow-soft',
      'hover:from-secondary-600 hover:to-secondary-700',
      'hover:shadow-medium',
      'focus:ring-secondary-500',
      'active:from-secondary-700 active:to-secondary-800',
    ].join(' '),
    
    outline: [
      'bg-transparent',
      'text-primary-600',
      'border-2 border-primary-500',
      'hover:bg-primary-50',
      'hover:text-primary-700',
      'hover:border-primary-600',
      'focus:ring-primary-500',
      'active:bg-primary-100',
    ].join(' '),
    
    ghost: [
      'bg-transparent',
      'text-neutral-700',
      'hover:bg-neutral-100',
      'hover:text-neutral-800',
      'focus:ring-neutral-500',
      'active:bg-neutral-200',
    ].join(' '),
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  // Custom loading spinner with climbing theme
  const LoadingSpinner = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        className="animate-spin h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );

  // Content with proper spacing for icons
  const content = (
    <>
      {startIcon && !loading && (
        <span className="flex-shrink-0">
          {startIcon}
        </span>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
      {endIcon && !loading && (
        <span className="flex-shrink-0">
          {endIcon}
        </span>
      )}
      {loading && <LoadingSpinner />}
    </>
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${widthStyle}
        ${className}
      `}
      style={{
        transitionProperty: 'all',
        transitionTimingFunction: animations.easings.smooth,
        transitionDuration: animations.normal,
      }}
    >
      {content}
    </button>
  );
};

export default Button; 