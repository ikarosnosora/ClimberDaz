/**
 * ClimberDaz Design System 2.0
 * Gradient-Optimized design tokens for modern climbing app UI
 */

// 🌈 Refined Gradient-Optimized Color Palette 2.0
export const colors = {
  // 🔥 Primary Gradients - Adventure & Energy (Sunrise Climb)
  primary: {
    50: '#FFE8E5',
    100: '#FFF0F3',
    200: '#FFA07A',
    300: '#FF8E7B',
    400: '#FF7E5F',
    500: '#FF6B7F', // Main primary
    600: '#FF4572',
    700: '#E91E63',
    800: '#C2185B',
    900: '#AD1457',
  },
  
  // 🌊 Secondary Gradients - Mountain Sky  
  secondary: {
    50: '#E0F2FE',
    100: '#EFF6FF',
    200: '#7DD3FC',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#36D1DC', // Main secondary
    600: '#5B86E5',
    700: '#4F46E5',
    800: '#4338CA',
    900: '#3730A3',
  },
  
  // 🏔️ Neutral Gradients - Rock Face
  neutral: {
    50: '#FEF7F0',
    100: '#F9FAFB',
    200: '#F3F4F6',
    300: '#E5E7EB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // 🌟 Accent Colors - Maintained for backward compatibility
  accent: {
    50: '#E0F2FE',
    100: '#EFF6FF',
    200: '#7DD3FC',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#36D1DC', // Main accent (same as secondary.500)
    600: '#5B86E5',
    700: '#4F46E5',
    800: '#4338CA',
    900: '#3730A3',
  },
  
  // ✨ Semantic Colors
  success: {
    primary: '#10B981',
    secondary: '#059669',
    tertiary: '#047857',
    soft: '#A7F3D0',
    subtle: '#DCFCE7',
    // Backward compatibility
    500: '#10B981',
  },
  
  warning: {
    primary: '#F59E0B',
    secondary: '#D97706',
    tertiary: '#B45309',
    soft: '#FEF3C7',
    subtle: '#FDE68A',
    // Backward compatibility
    500: '#F59E0B',
  },
  
  error: {
    primary: '#EF4444',
    secondary: '#DC2626',
    tertiary: '#B91C1C',
    soft: '#FECACA',
    subtle: '#FCA5A5',
    // Backward compatibility
    500: '#EF4444',
  },
  
  info: {
    primary: '#3B82F6',
    secondary: '#2563EB',
    tertiary: '#1D4ED8',
    soft: '#DBEAFE',
    subtle: '#BFDBFE',
    // Backward compatibility
    500: '#3B82F6',
  },
} as const;

// 🎨 Core Gradient System
export const gradients = {
  // Primary Action Gradients
  primary: 'linear-gradient(135deg, #FF7E5F 0%, #FF4572 50%, #E91E63 100%)',
  primarySoft: 'linear-gradient(135deg, #FFA07A 0%, #FF6B7F 100%)',
  primarySubtle: 'linear-gradient(135deg, #FFE8E5 0%, #FFF0F3 100%)',
  
  // Secondary Action Gradients
  secondary: 'linear-gradient(135deg, #36D1DC 0%, #5B86E5 50%, #4F46E5 100%)',
  secondarySoft: 'linear-gradient(135deg, #7DD3FC 0%, #93C5FD 100%)',
  secondarySubtle: 'linear-gradient(135deg, #E0F2FE 0%, #EFF6FF 100%)',
  
  // Neutral Gradients
  neutral: 'linear-gradient(135deg, #6B7280 0%, #4B5563 50%, #374151 100%)',
  neutralSoft: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
  neutralWarm: 'linear-gradient(135deg, #FEF7F0 0%, #F9FAFB 100%)',
  
  // Semantic Gradients
  success: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)',
  successSoft: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 100%)',
  
  warning: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
  warningSoft: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
  
  error: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)',
  errorSoft: 'linear-gradient(135deg, #FECACA 0%, #FCA5A5 100%)',
  
  info: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)',
  infoSoft: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
  
  // Interface Gradients
  pageBg: 'linear-gradient(180deg, #FAFBFC 0%, #F8FAFC 100%)',
  cardBg: 'linear-gradient(145deg, #FFFFFF 0%, #FEFEFE 100%)',
  modalBg: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
  
  // Interactive Gradients
  buttonHover: 'linear-gradient(135deg, #FF8E7B 0%, #FF5A88 100%)',
  inputFocus: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 100%)',
  selection: 'linear-gradient(135deg, rgba(255, 126, 95, 0.1) 0%, rgba(255, 69, 114, 0.1) 100%)',
  
  // Status Gradients
  online: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  away: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  offline: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
  
  // Dark Mode Gradients
  darkPage: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
  darkCard: 'linear-gradient(145deg, #1E293B 0%, #334155 100%)',
  darkPrimary: 'linear-gradient(135deg, #FF8E7B 0%, #FF6B7F 100%)',
  darkSecondary: 'linear-gradient(135deg, #60A5FA 0%, #818CF8 100%)',
} as const;

// 🏔️ Activity Type Gradient System
export const activityGradients = {
  BOULDERING: {
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF4757 100%)',
    bgColor: 'rgba(255, 107, 53, 0.08)',
    borderGradient: 'linear-gradient(135deg, #FF6B35 0%, #FF4757 100%)',
  },
  
  TOP_ROPE_AUTO_BELAY: {
    gradient: 'linear-gradient(135deg, #3742FA 0%, #2F3542 100%)',
    bgColor: 'rgba(55, 66, 250, 0.08)',
    borderGradient: 'linear-gradient(135deg, #3742FA 0%, #2F3542 100%)',
  },
  
  TOP_ROPE_MANUAL_BELAY: {
    gradient: 'linear-gradient(135deg, #3742FA 0%, #2F3542 100%)',
    bgColor: 'rgba(55, 66, 250, 0.08)',
    borderGradient: 'linear-gradient(135deg, #3742FA 0%, #2F3542 100%)',
  },
  
  LEAD_CLIMBING: {
    gradient: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
    bgColor: 'rgba(139, 69, 19, 0.08)',
    borderGradient: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
  },
  
  OUTDOOR: {
    gradient: 'linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 50%, #4FC3F7 100%)',
    bgColor: 'rgba(225, 245, 254, 0.8)',
    borderGradient: 'linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%)',
  },
  
  TRAINING: {
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
    bgColor: 'rgba(156, 39, 176, 0.08)',
    borderGradient: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
  },
} as const;

// Typography scale (unchanged but reorganized)
export const typography = {
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
} as const;

// Spacing system (8px grid)
export const spacing = {
  xs: '0.5rem',   // 8px
  sm: '1rem',     // 16px
  md: '1.5rem',   // 24px
  lg: '2rem',     // 32px
  xl: '2.5rem',   // 40px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
} as const;

// Enhanced shadow system for gradients
export const shadows = {
  soft: '0 2px 8px rgba(0, 0, 0, 0.08)',
  medium: '0 4px 16px rgba(0, 0, 0, 0.12)',
  large: '0 8px 32px rgba(0, 0, 0, 0.16)',
  card: '0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 25px rgba(0, 0, 0, 0.05)',
  cardHover: '0 8px 25px rgba(0, 0, 0, 0.1), 0 16px 40px rgba(255, 126, 95, 0.15)',
  
  // Gradient-specific shadows
  primaryGlow: '0 8px 25px rgba(255, 126, 95, 0.3)',
  secondaryGlow: '0 8px 25px rgba(54, 209, 220, 0.3)',
  cardGradient: '0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 25px rgba(0, 0, 0, 0.05)',
  
  // Dark mode shadows
  darkCard: '0 4px 6px rgba(0, 0, 0, 0.3), 0 10px 25px rgba(0, 0, 0, 0.2)',
} as const;

// Border radius (unchanged)
export const borderRadius = {
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px',
} as const;

// Enhanced animation system
export const animations = {
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
  
  // Easing functions
  easings: {
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
  
  // Gradient animations
  gradientShift: 'gradient-shift 3s ease infinite',
  shimmer: 'shimmer 1.5s infinite',
} as const;

// Updated activity type styles with gradients
export const activityTypeStyles = {
  BOULDERING: {
    gradient: activityGradients.BOULDERING.gradient,
    color: '#FF6B35',
    bgColor: activityGradients.BOULDERING.bgColor,
    borderGradient: activityGradients.BOULDERING.borderGradient,
    borderColor: '#FF6B35',
    emoji: '🧗',
    label: '抱石',
    description: '无绳攀岩，专注技巧与力量',
  },
  TOP_ROPE_AUTO_BELAY: {
    gradient: activityGradients.TOP_ROPE_AUTO_BELAY.gradient,
    color: '#3742FA',
    bgColor: activityGradients.TOP_ROPE_AUTO_BELAY.bgColor,
    borderGradient: activityGradients.TOP_ROPE_AUTO_BELAY.borderGradient,
    borderColor: '#3742FA',
    emoji: '🔗',
    label: '顶绳(自动)',
    description: '自动保护装置，安全可靠',
  },
  TOP_ROPE_MANUAL_BELAY: {
    gradient: activityGradients.TOP_ROPE_MANUAL_BELAY.gradient,
    color: '#3742FA',
    bgColor: activityGradients.TOP_ROPE_MANUAL_BELAY.bgColor,
    borderGradient: activityGradients.TOP_ROPE_MANUAL_BELAY.borderGradient,
    borderColor: '#3742FA',
    emoji: '👥',
    label: '顶绳(手动)',
    description: '人工保护，需要搭档配合',
  },
  LEAD_CLIMBING: {
    gradient: activityGradients.LEAD_CLIMBING.gradient,
    color: '#8B4513',
    bgColor: activityGradients.LEAD_CLIMBING.bgColor,
    borderGradient: activityGradients.LEAD_CLIMBING.borderGradient,
    borderColor: '#8B4513',
    emoji: '🧭',
    label: '先锋',
    description: '挑战性攀登，需要高超技巧',
  },
  OUTDOOR: {
    gradient: activityGradients.OUTDOOR.gradient,
    color: '#4FC3F7',
    bgColor: activityGradients.OUTDOOR.bgColor,
    borderGradient: activityGradients.OUTDOOR.borderGradient,
    borderColor: '#4FC3F7',
    emoji: '🏔️',
    label: '野外',
    description: '真岩体验，亲近自然',
  },
  TRAINING: {
    gradient: activityGradients.TRAINING.gradient,
    color: '#9C27B0',
    bgColor: activityGradients.TRAINING.bgColor,
    borderGradient: activityGradients.TRAINING.borderGradient,
    borderColor: '#9C27B0',
    emoji: '💪',
    label: '训练',
    description: '技能提升，体能锻炼',
  },
} as const;

// Enhanced button system with gradients
export const buttonStyles = {
  primary: {
    background: gradients.primary,
    color: '#FFFFFF',
    hoverBackground: gradients.buttonHover,
    shadow: shadows.soft,
    hoverShadow: shadows.primaryGlow,
    border: 'none',
  },
  secondary: {
    background: gradients.secondary,
    color: '#FFFFFF',
    hoverBackground: gradients.secondarySoft,
    shadow: shadows.soft,
    hoverShadow: shadows.secondaryGlow,
    border: 'none',
  },
  ghost: {
    background: 'transparent',
    color: colors.primary[400],
    border: '2px solid transparent',
    backgroundImage: `${gradients.primary}, linear-gradient(white, white)`,
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    hoverBackground: gradients.primarySubtle,
  },
  outline: {
    background: 'transparent',
    color: colors.primary[500],
    border: `1px solid ${colors.primary[500]}`,
    hoverBackground: colors.primary[50],
    hoverColor: colors.primary[600],
  },
} as const;

// Component specific tokens with gradients
export const components = {
  card: {
    background: gradients.cardBg,
    border: '1px solid rgba(255, 255, 255, 0.8)',
    borderRadius: borderRadius.lg,
    shadow: shadows.cardGradient,
    hoverShadow: shadows.cardHover,
    backdropFilter: 'blur(10px)',
    padding: spacing.md,
  },
  
  input: {
    borderColor: colors.neutral[300],
    focusBorderColor: colors.primary[400],
    focusBackground: gradients.inputFocus,
    background: '#FFFFFF',
    borderRadius: borderRadius.md,
    padding: `${spacing.sm} ${spacing.md}`,
  },
  
  modal: {
    background: gradients.modalBg,
    border: '1px solid rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    shadow: shadows.large,
  },
  
  navigation: {
    background: gradients.cardBg,
    borderTop: '1px solid rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    activeTabGradient: gradients.primary,
    tabIndicatorGradient: gradients.primary,
  },
} as const;

// Icon sizes (unchanged)
export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
} as const;

// Breakpoints and z-index (unchanged)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
} as const;

export default {
  colors,
  gradients,
  activityGradients,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  activityTypeStyles,
  buttonStyles,
  iconSizes,
  components,
  breakpoints,
  zIndex,
}; 