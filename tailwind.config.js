/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 🌈 Refined Gradient-Optimized Color Palette 2.0
      colors: {
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
        
        // ✨ Enhanced Semantic Colors
        success: {
          50: '#DCFCE7',
          100: '#A7F3D0',
          200: '#6EE7B7',
          300: '#34D399',
          400: '#10B981',
          500: '#059669', // Primary success
          600: '#047857',
          700: '#065F46',
          800: '#064E3B',
          900: '#022C22',
        },
        
        warning: {
          50: '#FEF3C7',
          100: '#FDE68A',
          200: '#FCD34D',
          300: '#FBBF24',
          400: '#F59E0B',
          500: '#D97706', // Primary warning
          600: '#B45309',
          700: '#92400E',
          800: '#78350F',
          900: '#451A03',
        },
        
        error: {
          50: '#FECACA',
          100: '#FCA5A5',
          200: '#F87171',
          300: '#EF4444',
          400: '#DC2626',
          500: '#B91C1C', // Primary error
          600: '#991B1B',
          700: '#7F1D1D',
          800: '#450A0A',
          900: '#1F2937',
        },
        
        info: {
          50: '#DBEAFE',
          100: '#BFDBFE',
          200: '#93C5FD',
          300: '#60A5FA',
          400: '#3B82F6',
          500: '#2563EB', // Primary info
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#1E3A8A',
        },
      },
      
      // 🎨 Custom Gradient Utilities
      backgroundImage: {
        // Primary Gradients
        'gradient-primary': 'linear-gradient(135deg, #FF7E5F 0%, #FF4572 50%, #E91E63 100%)',
        'gradient-primary-soft': 'linear-gradient(135deg, #FFA07A 0%, #FF6B7F 100%)',
        'gradient-primary-subtle': 'linear-gradient(135deg, #FFE8E5 0%, #FFF0F3 100%)',
        
        // Secondary Gradients
        'gradient-secondary': 'linear-gradient(135deg, #36D1DC 0%, #5B86E5 50%, #4F46E5 100%)',
        'gradient-secondary-soft': 'linear-gradient(135deg, #7DD3FC 0%, #93C5FD 100%)',
        'gradient-secondary-subtle': 'linear-gradient(135deg, #E0F2FE 0%, #EFF6FF 100%)',
        
        // Neutral Gradients
        'gradient-neutral': 'linear-gradient(135deg, #6B7280 0%, #4B5563 50%, #374151 100%)',
        'gradient-neutral-soft': 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
        'gradient-neutral-warm': 'linear-gradient(135deg, #FEF7F0 0%, #F9FAFB 100%)',
        
        // Semantic Gradients
        'gradient-success': 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)',
        'gradient-success-soft': 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 100%)',
        
        'gradient-warning': 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
        'gradient-warning-soft': 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
        
        'gradient-error': 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)',
        'gradient-error-soft': 'linear-gradient(135deg, #FECACA 0%, #FCA5A5 100%)',
        
        'gradient-info': 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)',
        'gradient-info-soft': 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
        
        // Interface Gradients
        'gradient-page': 'linear-gradient(180deg, #FAFBFC 0%, #F8FAFC 100%)',
        'gradient-card': 'linear-gradient(145deg, #FFFFFF 0%, #FEFEFE 100%)',
        'gradient-modal': 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
        
        // Interactive Gradients
        'gradient-button-hover': 'linear-gradient(135deg, #FF8E7B 0%, #FF5A88 100%)',
        'gradient-input-focus': 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 100%)',
        'gradient-selection': 'linear-gradient(135deg, rgba(255, 126, 95, 0.1) 0%, rgba(255, 69, 114, 0.1) 100%)',
        
        // Activity Type Gradients
        'gradient-bouldering': 'linear-gradient(135deg, #FF6B35 0%, #FF4757 100%)',
        'gradient-sport': 'linear-gradient(135deg, #3742FA 0%, #2F3542 100%)',
        'gradient-traditional': 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
        'gradient-alpine': 'linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 50%, #4FC3F7 100%)',
        'gradient-indoor': 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
        
        // Status Gradients
        'gradient-online': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'gradient-away': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        'gradient-offline': 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
        
        // Dark Mode Gradients
        'gradient-dark-page': 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
        'gradient-dark-card': 'linear-gradient(145deg, #1E293B 0%, #334155 100%)',
        'gradient-dark-primary': 'linear-gradient(135deg, #FF8E7B 0%, #FF6B7F 100%)',
        'gradient-dark-secondary': 'linear-gradient(135deg, #60A5FA 0%, #818CF8 100%)',
        
        // Animated Gradients
        'gradient-animated': 'linear-gradient(-45deg, #FF7E5F, #FF4572, #36D1DC, #5B86E5)',
        'gradient-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
      },
      
      // Typography system
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      
      // Spacing system (8px grid)
      spacing: {
        '0.5': '0.125rem', // 2px
        '1': '0.25rem',    // 4px
        '2': '0.5rem',     // 8px
        '3': '0.75rem',    // 12px
        '4': '1rem',       // 16px
        '5': '1.25rem',    // 20px
        '6': '1.5rem',     // 24px
        '7': '1.75rem',    // 28px
        '8': '2rem',       // 32px
        '9': '2.25rem',    // 36px
        '10': '2.5rem',    // 40px
        '11': '2.75rem',   // 44px
        '12': '3rem',      // 48px
        '14': '3.5rem',    // 56px
        '16': '4rem',      // 64px
        '20': '5rem',      // 80px
      },
      
      // Enhanced shadows for gradients
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'large': '0 8px 32px rgba(0, 0, 0, 0.16)',
        'card': '0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 25px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 25px rgba(0, 0, 0, 0.1), 0 16px 40px rgba(255, 126, 95, 0.15)',
        
        // Gradient-specific shadows
        'primary-glow': '0 8px 25px rgba(255, 126, 95, 0.3)',
        'secondary-glow': '0 8px 25px rgba(54, 209, 220, 0.3)',
        'card-gradient': '0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 25px rgba(0, 0, 0, 0.05)',
        
        // Dark mode shadows
        'dark-card': '0 4px 6px rgba(0, 0, 0, 0.3), 0 10px 25px rgba(0, 0, 0, 0.2)',
      },
      
      // Animation durations
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '350ms',
      },
      
      // Custom animation curves
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      // Border radius system
      borderRadius: {
        'sm': '0.25rem',   // 4px
        'md': '0.375rem',  // 6px
        'lg': '0.5rem',    // 8px
        'xl': '0.75rem',   // 12px
        '2xl': '1rem',     // 16px
      },
      
      // Enhanced animations with gradients
      animation: {
        'marquee': 'marquee 20s linear infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      
      // Backdrop filters for glass morphism
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
    },
  },
  plugins: [],
}
