import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { colors } from '../../utils/designSystem';

type TransitionType = 'slide' | 'fade' | 'scale' | 'flip' | 'climbing' | 'none';
type Direction = 'left' | 'right' | 'up' | 'down';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: TransitionType;
  direction?: Direction;
  duration?: number;
  enableGestures?: boolean;
  onTransitionStart?: () => void;
  onTransitionEnd?: () => void;
}

interface TransitionConfig {
  type: TransitionType;
  direction: Direction;
  duration: number;
}

// Route-specific transition configurations
const ROUTE_TRANSITIONS: Record<string, TransitionConfig> = {
  '/': { type: 'fade', direction: 'right', duration: 300 },
  '/activities': { type: 'slide', direction: 'right', duration: 400 },
  '/activity/*': { type: 'slide', direction: 'left', duration: 350 },
  '/profile': { type: 'scale', direction: 'up', duration: 300 },
  '/notifications': { type: 'slide', direction: 'down', duration: 250 },
  '/create-activity': { type: 'climbing', direction: 'up', duration: 500 },
  '/login': { type: 'fade', direction: 'right', duration: 300 },
};

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'slide',
  direction = 'right',
  duration = 300,
  enableGestures = true,
  onTransitionStart,
  onTransitionEnd,
}) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentChildren, setCurrentChildren] = useState(children);
  const [nextChildren, setNextChildren] = useState<React.ReactNode>(null);
  const [gestureProgress, setGestureProgress] = useState(0);
  const [isGesturing, setIsGesturing] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startTouchRef = useRef<{ x: number; y: number } | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();

  // Get transition config for current route
  const getTransitionConfig = useCallback((pathname: string): TransitionConfig => {
    // Check for exact match first
    if (ROUTE_TRANSITIONS[pathname]) {
      return ROUTE_TRANSITIONS[pathname];
    }
    
    // Check for pattern matches
    for (const [pattern, config] of Object.entries(ROUTE_TRANSITIONS)) {
      if (pattern.includes('*')) {
        const basePattern = pattern.replace('*', '');
        if (pathname.startsWith(basePattern)) {
          return config;
        }
      }
    }
    
    // Default transition
    return { type, direction, duration };
  }, [type, direction, duration]);

  // Handle route changes
  useEffect(() => {
    if (nextChildren !== children) {
      setNextChildren(children);
      performTransition();
    }
  }, [children, location.pathname]);

  // Perform page transition
  const performTransition = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    onTransitionStart?.();

    const config = getTransitionConfig(location.pathname);
    
    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // Set timeout for transition completion
    transitionTimeoutRef.current = setTimeout(() => {
      setCurrentChildren(nextChildren);
      setNextChildren(null);
      setIsTransitioning(false);
      onTransitionEnd?.();
    }, config.duration);
  }, [isTransitioning, location.pathname, nextChildren, getTransitionConfig, onTransitionStart, onTransitionEnd]);

  // Touch gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enableGestures || isTransitioning) return;
    
    const touch = e.touches[0];
    startTouchRef.current = { x: touch.clientX, y: touch.clientY };
    setIsGesturing(true);
  }, [enableGestures, isTransitioning]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enableGestures || !startTouchRef.current || !isGesturing) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startTouchRef.current.x;
    const deltaY = touch.clientY - startTouchRef.current.y;
    
    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
    const containerHeight = containerRef.current?.offsetHeight || window.innerHeight;
    
    // Calculate progress based on gesture direction
    let progress = 0;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal gesture
      progress = Math.abs(deltaX) / containerWidth;
    } else {
      // Vertical gesture
      progress = Math.abs(deltaY) / containerHeight;
    }
    
    setGestureProgress(Math.min(progress, 1));
    
    // Prevent default scrolling during gesture
    if (progress > 0.1) {
      e.preventDefault();
    }
  }, [enableGestures, isGesturing]);

  const handleTouchEnd = useCallback(() => {
    if (!enableGestures || !isGesturing) return;
    
    setIsGesturing(false);
    startTouchRef.current = null;
    
    // Complete transition if gesture progress is significant
    if (gestureProgress > 0.3) {
      performTransition();
    } else {
      // Reset gesture progress
      setGestureProgress(0);
    }
  }, [enableGestures, isGesturing, gestureProgress, performTransition]);

  // Generate transition styles
  const getTransitionStyles = useCallback((
    config: TransitionConfig,
    isExiting: boolean,
    progress: number = 0
  ): React.CSSProperties => {
    const { type: transitionType, direction: transitionDirection, duration: transitionDuration } = config;
    const isReduced = document.documentElement.classList.contains('reduce-motion');
    
    if (isReduced) {
      return {
        opacity: isExiting ? 0 : 1,
        transition: `opacity ${transitionDuration}ms ease-out`,
      };
    }

    const baseTransition = `all ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    
    switch (transitionType) {
      case 'slide':
        const slideDistance = '100%';
        const transforms: Record<Direction, string> = {
          left: `translateX(${isExiting ? '-' : ''}${slideDistance})`,
          right: `translateX(${isExiting ? '' : '-'}${slideDistance})`,
          up: `translateY(${isExiting ? '-' : ''}${slideDistance})`,
          down: `translateY(${isExiting ? '' : '-'}${slideDistance})`,
        };
        
        return {
          transform: isExiting || progress > 0 
            ? transforms[transitionDirection] 
            : 'translate(0, 0)',
          transition: isGesturing ? 'none' : baseTransition,
          opacity: 1,
        };

      case 'scale':
        return {
          transform: isExiting 
            ? 'scale(0.9) translateY(20px)' 
            : 'scale(1) translateY(0)',
          opacity: isExiting ? 0 : 1,
          transition: baseTransition,
        };

      case 'flip':
        return {
          transform: isExiting 
            ? 'perspective(1000px) rotateY(-90deg)' 
            : 'perspective(1000px) rotateY(0deg)',
          opacity: isExiting ? 0 : 1,
          transition: baseTransition,
          transformStyle: 'preserve-3d',
        };

      case 'climbing':
        // Custom climbing-themed animation
        return {
          transform: isExiting 
            ? 'translateY(50px) scale(0.95) rotate(-2deg)' 
            : 'translateY(0) scale(1) rotate(0deg)',
          opacity: isExiting ? 0 : 1,
          transition: `${baseTransition}, transform ${transitionDuration + 100}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
          filter: isExiting ? 'blur(4px)' : 'blur(0px)',
        };

      case 'fade':
      default:
        return {
          opacity: isExiting ? 0 : 1,
          transition: baseTransition,
        };
    }
  }, [isGesturing]);

  const currentConfig = getTransitionConfig(location.pathname);
  const currentStyles = getTransitionStyles(currentConfig, false, gestureProgress);
  const exitingStyles = getTransitionStyles(currentConfig, true, gestureProgress);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="page-transition-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Current page */}
      <div
        className="page-transition-current"
        style={{
          position: isTransitioning ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: isTransitioning ? 1 : 2,
          ...currentStyles,
        }}
      >
        {currentChildren}
      </div>

      {/* Next page (during transition) */}
      {isTransitioning && nextChildren && (
        <div
          className="page-transition-next"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 2,
            ...exitingStyles,
          }}
        >
          {nextChildren}
        </div>
      )}

      {/* Gesture indicator */}
      {isGesturing && gestureProgress > 0.1 && (
        <div
          className="gesture-indicator"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[500]} 100%)`,
            borderRadius: '50%',
            width: `${40 + gestureProgress * 20}px`,
            height: `${40 + gestureProgress * 20}px`,
            opacity: gestureProgress,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px',
            boxShadow: `0 4px 20px rgba(0, 0, 0, 0.2)`,
          }}
        >
          🧗‍♀️
        </div>
      )}
    </div>
  );
};

// Higher-order component for automatic page transitions
export const withPageTransition = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  transitionConfig?: Partial<PageTransitionProps>
) => {
  const TransitionWrappedComponent: React.FC<P> = (props) => {
    return (
      <PageTransition {...transitionConfig}>
        <WrappedComponent {...props} />
      </PageTransition>
    );
  };

  TransitionWrappedComponent.displayName = `withPageTransition(${WrappedComponent.displayName || WrappedComponent.name})`;
  return TransitionWrappedComponent;
};

// Transition trigger component
interface TransitionTriggerProps {
  children: React.ReactNode;
  to: string;
  type?: TransitionType;
  direction?: Direction;
  className?: string;
  onClick?: () => void;
}

export const TransitionTrigger: React.FC<TransitionTriggerProps> = ({
  children,
  to,
  type = 'slide',
  direction = 'right',
  className = '',
  onClick,
}) => {
  const handleClick = useCallback(() => {
    // Store transition preference for the target route
    sessionStorage.setItem(`transition-${to}`, JSON.stringify({ type, direction }));
    onClick?.();
  }, [to, type, direction, onClick]);

  return (
    <div className={className} onClick={handleClick}>
      {children}
    </div>
  );
};

// Route transition hook
export const usePageTransition = () => {
  const location = useLocation();
  const [transitionState, setTransitionState] = useState<{
    isTransitioning: boolean;
    from: string | null;
    to: string;
  }>({
    isTransitioning: false,
    from: null,
    to: location.pathname,
  });

  useEffect(() => {
    setTransitionState(prev => ({
      isTransitioning: true,
      from: prev.to,
      to: location.pathname,
    }));

    const timer = setTimeout(() => {
      setTransitionState(prev => ({
        ...prev,
        isTransitioning: false,
      }));
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return transitionState;
};

// Preload transition configuration
export const preloadTransition = (route: string, config: TransitionConfig) => {
  ROUTE_TRANSITIONS[route] = config;
};

export default PageTransition; 