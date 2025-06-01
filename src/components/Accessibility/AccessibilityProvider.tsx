import React, { createContext, useContext } from 'react';

interface AccessibilityContextType {
  // Screen reader support
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void;
  announcePageChange: (pageName: string) => void;
  
  // Keyboard navigation - simplified
  focusableElements: HTMLElement[];
  currentFocusIndex: number;
  navigateToNext: () => void;
  navigateToPrevious: () => void;
  focusElement: (element: HTMLElement) => void;
  
  // Interaction helpers
  enableSkipLinks: boolean;
  showFocusIndicators: boolean;
  
  // Methods - simplified
  toggleHighContrast: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large' | 'extra-large') => void;
  registerFocusableElement: (element: HTMLElement) => void;
  unregisterFocusableElement: (element: HTMLElement) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

// Minimal AccessibilityProvider that doesn't interfere with rendering
export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  // Simple mock implementations
  const announceMessage = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    console.log(`[Accessibility] ${priority}: ${message}`);
  };

  const announcePageChange = (pageName: string) => {
    console.log(`[Accessibility] Page changed to: ${pageName}`);
  };

  const contextValue: AccessibilityContextType = {
    announceMessage,
    announcePageChange,
    focusableElements: [],
    currentFocusIndex: -1,
    navigateToNext: () => {},
    navigateToPrevious: () => {},
    focusElement: () => {},
    enableSkipLinks: false, // Disable skip links to prevent rendering issues
    showFocusIndicators: false,
    toggleHighContrast: () => {},
    setFontSize: () => {},
    registerFocusableElement: () => {},
    unregisterFocusableElement: () => {},
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Hook to use accessibility context
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

// Higher-order component for accessibility
export const withAccessibility = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    announceOnMount?: string;
    role?: string;
    ariaLabel?: string;
  }
) => {
  const AccessibleComponent: React.FC<P> = (props) => {
    const { announceMessage } = useAccessibility();
    
    React.useEffect(() => {
      if (options?.announceOnMount) {
        announceMessage(options.announceOnMount);
      }
    }, [announceMessage]);

    return <WrappedComponent {...props} />;
  };

  AccessibleComponent.displayName = `withAccessibility(${WrappedComponent.displayName || WrappedComponent.name})`;
  return AccessibleComponent;
};

// Simple settings component (non-functional for now)
export const AccessibilitySettings: React.FC = () => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">无障碍设置</h3>
      <p className="text-gray-600">设置功能暂时不可用</p>
    </div>
  );
}; 