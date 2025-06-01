import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface AccessibilityConfig {
  enableSkipLinks: boolean;
  enableScreenReaderMode: boolean;
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  announcePageChanges: boolean;
  fontSizeScale: number;
  keyboardNavigationEnabled: boolean;
}

interface AccessibilityContextType {
  config: AccessibilityConfig;
  updateConfig: (updates: Partial<AccessibilityConfig>) => void;
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void;
  announcePageChange: (pageName: string) => void;
  focusElement: (elementId: string) => void;
  isHighContrast: boolean;
  isReducedMotion: boolean;
  fontSizeScale: number;
  skipToContent: () => void;
  skipToNavigation: () => void;
  skipToSearch: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<AccessibilityConfig>({
    enableSkipLinks: false, // Keep disabled to prevent UI interference
    enableScreenReaderMode: false,
    enableHighContrast: false,
    enableReducedMotion: false,
    announcePageChanges: true,
    fontSizeScale: 1,
    keyboardNavigationEnabled: true,
  });

  const announcementRef = useRef<HTMLDivElement>(null);

  const updateConfig = useCallback((updates: Partial<AccessibilityConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const announceMessage = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Enhanced announcement with logging for debugging
    console.log(`[Accessibility] Announcing: ${message}`);
    
    if (announcementRef.current) {
      // Clear previous announcement
      announcementRef.current.textContent = '';
      
      // Set new announcement after a brief delay for screen readers
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = message;
          announcementRef.current.setAttribute('aria-live', priority);
        }
      }, 100);
    }
  }, []);

  const announcePageChange = useCallback((pageName: string) => {
    if (config.announcePageChanges) {
      announceMessage(`已导航到${pageName}页面`, 'polite');
    }
  }, [config.announcePageChanges, announceMessage]);

  const focusElement = useCallback((elementId: string) => {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.focus();
        announceMessage(`焦点已移至${elementId}`, 'polite');
      }
    }, 100);
  }, [announceMessage]);

  const skipToContent = useCallback(() => {
    console.log('[Accessibility] Skip to content requested');
    focusElement('main-content');
  }, [focusElement]);

  const skipToNavigation = useCallback(() => {
    console.log('[Accessibility] Skip to navigation requested');
    focusElement('main-navigation');
  }, [focusElement]);

  const skipToSearch = useCallback(() => {
    console.log('[Accessibility] Skip to search requested');
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="搜索"]') as HTMLElement;
    if (searchInput) {
      searchInput.focus();
      announceMessage('焦点已移至搜索框', 'polite');
    }
  }, [announceMessage]);

  // Enhanced keyboard navigation
  useEffect(() => {
    if (!config.keyboardNavigationEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Enhanced keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '/':
            event.preventDefault();
            skipToSearch();
            break;
          case 'k':
            event.preventDefault();
            skipToSearch();
            break;
          case '1':
            event.preventDefault();
            skipToContent();
            break;
          case '2':
            event.preventDefault();
            skipToNavigation();
            break;
        }
      }

      // Tab navigation enhancements
      if (event.key === 'Tab') {
        announceMessage('使用Tab键导航元素', 'polite');
      }

      // Escape key handling
      if (event.key === 'Escape') {
        const activeModals = document.querySelectorAll('[role="dialog"]:not([aria-hidden="true"])');
        if (activeModals.length > 0) {
          announceMessage('已关闭对话框', 'assertive');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [config.keyboardNavigationEnabled, skipToContent, skipToNavigation, skipToSearch, announceMessage]);

  // Apply accessibility preferences to document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast mode
    if (config.enableHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (config.enableReducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Font size scaling
    root.style.fontSize = `${config.fontSizeScale * 100}%`;

    // Screen reader mode
    if (config.enableScreenReaderMode) {
      root.classList.add('screen-reader-mode');
    } else {
      root.classList.remove('screen-reader-mode');
    }
  }, [config]);

  const value: AccessibilityContextType = {
    config,
    updateConfig,
    announceMessage,
    announcePageChange,
    focusElement,
    isHighContrast: config.enableHighContrast,
    isReducedMotion: config.enableReducedMotion,
    fontSizeScale: config.fontSizeScale,
    skipToContent,
    skipToNavigation,
    skipToSearch,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      
      {/* Screen reader announcements - always present but invisible */}
      <div
        ref={announcementRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
        id="accessibility-announcements"
      />

      {/* Skip links - only render if enabled (currently disabled) */}
      {config.enableSkipLinks && (
        <div className="skip-links">
          <button
            className="skip-link"
            onClick={skipToContent}
            onFocus={(e) => e.target.classList.add('focused')}
            onBlur={(e) => e.target.classList.remove('focused')}
          >
            跳转到主要内容
          </button>
          <button
            className="skip-link"
            onClick={skipToNavigation}
            onFocus={(e) => e.target.classList.add('focused')}
            onBlur={(e) => e.target.classList.remove('focused')}
          >
            跳转到导航
          </button>
          <button
            className="skip-link"
            onClick={skipToSearch}
            onFocus={(e) => e.target.classList.add('focused')}
            onBlur={(e) => e.target.classList.remove('focused')}
          >
            转到搜索
          </button>
        </div>
      )}

      {/* Accessibility CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .skip-links {
            position: absolute;
            top: -40px;
            left: 6px;
            z-index: 10000;
          }

          .skip-link {
            position: absolute;
            top: -40px;
            left: 6px;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            transition: top 0.3s;
          }

          .skip-link:focus,
          .skip-link.focused {
            top: 6px;
          }

          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }

          /* High contrast mode styles */
          .high-contrast {
            filter: contrast(150%) brightness(120%);
          }

          /* Reduced motion styles */
          .reduce-motion * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          /* Screen reader mode styles */
          .screen-reader-mode {
            font-family: 'Arial', sans-serif !important;
            line-height: 1.6 !important;
          }

          /* Focus indicators */
          *:focus {
            outline: 2px solid #2563eb !important;
            outline-offset: 2px !important;
          }

          /* Enhanced button focus */
          button:focus {
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3) !important;
          }
        `
      }} />
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}; 