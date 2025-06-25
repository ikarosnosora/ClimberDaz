import React from 'react';
import { animations } from '../../utils/designSystem';

/**
 * Enhanced Button Component Props
 */
interface ButtonProps {
  /** Button content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
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

  // Enhanced variant styles with UX guide gradients
  const variantStyles = {
    primary: [
      'text-white',
      'shadow-soft',
      'focus:ring-primary-500',
      'hover:shadow-primary-glow',
    ].join(' '),
    
    secondary: [
      'text-white', 
      'shadow-soft',
      'focus:ring-secondary-500',
      'hover:shadow-secondary-glow',
    ].join(' '),
    
    outline: [
      'bg-transparent',
      'text-primary-600',
      'border-2',
      'hover:text-primary-700',
      'focus:ring-primary-500',
    ].join(' '),
    
    ghost: [
      'bg-transparent',
      'text-neutral-700',
      'hover:text-neutral-800',
      'focus:ring-neutral-500',
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

  // Get inline styles for gradients based on variant
  const getButtonStyles = () => {
    const baseTransition = {
      transitionProperty: 'all',
      transitionTimingFunction: animations.easings.smooth,
      transitionDuration: animations.normal,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseTransition,
          background: 'linear-gradient(135deg, #FF7E5F 0%, #FF4572 50%, #E91E63 100%)',
        };
      case 'secondary':
        return {
          ...baseTransition,
          background: 'linear-gradient(135deg, #36D1DC 0%, #5B86E5 50%, #4F46E5 100%)',
        };
      case 'outline':
        return {
          ...baseTransition,
          borderImage: 'linear-gradient(135deg, #FF7E5F 0%, #FF4572 100%) 1',
          backgroundImage: 'linear-gradient(135deg, #FF7E5F 0%, #FF4572 100%), linear-gradient(white, white)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        };
      case 'ghost':
        return {
          ...baseTransition,
        };
      default:
        return baseTransition;
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    const button = e.currentTarget;
    switch (variant) {
      case 'primary':
        button.style.background = 'linear-gradient(135deg, #FF8E7B 0%, #FF5A88 100%)';
        button.style.transform = 'translateY(-1px)';
        button.style.boxShadow = '0 8px 25px rgba(255, 126, 95, 0.3)';
        break;
      case 'secondary':
        button.style.background = 'linear-gradient(135deg, #7DD3FC 0%, #93C5FD 100%)';
        button.style.transform = 'translateY(-1px)';
        button.style.boxShadow = '0 8px 25px rgba(54, 209, 220, 0.3)';
        break;
      case 'outline':
        button.style.background = 'linear-gradient(135deg, #FFE8E5 0%, #FFF0F3 100%)';
        break;
      case 'ghost':
        button.style.background = 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)';
        break;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    const button = e.currentTarget;
    const originalStyles = getButtonStyles();
    Object.assign(button.style, originalStyles);
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '';
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${widthStyle}
        ${className}
      `}
      style={getButtonStyles()}
    >
      {content}
    </button>
  );
};

export default Button; 