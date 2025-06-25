import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Phase 4: Import advanced performance monitoring
import { advancedPerformanceMonitor } from './utils/performance.ts';

// Clear stored state if there are issues (development only)
if (process.env.NODE_ENV === 'development') {
  // Check for corrupted state and clear if necessary
  try {
    const storedState = localStorage.getItem('climberdaz_preferences');
    if (storedState) {
      const parsed = JSON.parse(storedState);
      // Check if state is corrupted or causing issues
      if (parsed.state && typeof parsed.state.isAuthenticated !== 'boolean') {
        console.warn('[Debug] Clearing corrupted persisted state');
        localStorage.removeItem('climberdaz_preferences');
      }
    }
  } catch (error) {
    console.warn('[Debug] Clearing invalid persisted state:', error);
    localStorage.removeItem('climberdaz_preferences');
  }
}

// Improved console warning filtering
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Filter out known non-critical warnings
const suppressedWarnings = [
  'findDOMNode is deprecated in StrictMode',
  'React DevTools global hook',
  'Fast Refresh is not compatible',
  '[DEPRECATED] Use `createWithEqualityFn`', // This is handled in our new implementation
];

console.error = (...args) => {
  const message = args.map(arg => {
    try {
      return String(arg);
    } catch (_e) {
      return '';
    }
  }).join(' ');

  // Check if this is a suppressed warning
  const shouldSuppress = suppressedWarnings.some(warning => message.includes(warning));
  
  if (!shouldSuppress) {
    originalConsoleError.apply(console, args);
  }
};

console.warn = (...args) => {
  const message = args.map(arg => {
    try {
      return String(arg);
    } catch (_e) {
      return '';
    }
  }).join(' ');

  // Check if this is a suppressed warning
  const shouldSuppress = suppressedWarnings.some(warning => message.includes(warning));
  
  if (!shouldSuppress) {
    originalConsoleWarn.apply(console, args);
  }
};

// Phase 4: Initialize performance monitoring for Phase 4
if (process.env.NODE_ENV === 'development' || localStorage.getItem('enablePerformanceMonitoring') === 'true') {
  console.log('🚀 ClimberDaz Phase 4 Performance Monitoring Enabled');
  console.log('📊 Features: Advanced Web Vitals, Bundle Analysis, Memory Tracking, Component Performance');
  
  // Start application performance measurement
  advancedPerformanceMonitor.start('app-initialization');
}

// Phase 4: Enhanced warning suppression for better development experience
// (Warning filtering already implemented above)

// Phase 4: Performance monitoring message (development only)
if (process.env.NODE_ENV === 'development') {
  console.group('🎯 ClimberDaz Phase 4 Performance Features');
  console.log('✅ Advanced Web Vitals Monitoring');
  console.log('✅ Bundle Size Analysis & Optimization');
  console.log('✅ Memory Usage Tracking & Warnings');
  console.log('✅ Component Render Performance Monitoring');
  console.log('✅ Performance Budget Enforcement');
  console.groupEnd();
}

// Initialize the React application
const root = createRoot(document.getElementById('root')!);

root.render(
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <App />
  </BrowserRouter>
);

// Phase 4: Complete application initialization measurement
if (process.env.NODE_ENV === 'development' || localStorage.getItem('enablePerformanceMonitoring') === 'true') {
  // End application initialization measurement
  setTimeout(() => {
    advancedPerformanceMonitor.end('app-initialization');
  }, 100);
  
  // Log initial performance metrics after app loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      const webVitals = advancedPerformanceMonitor.getWebVitals();
      console.group('📊 Initial Performance Metrics');
      console.log('Web Vitals:', webVitals);
      console.log('Performance Report:', advancedPerformanceMonitor.generateReport());
      console.groupEnd();
    }, 1000);
  });
  
  // Cleanup performance observers on page unload
  window.addEventListener('beforeunload', () => {
    advancedPerformanceMonitor.cleanup();
  });
}
