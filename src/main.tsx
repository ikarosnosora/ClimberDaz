import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

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

// Performance monitoring message (development only)
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 ClimberDaz Performance Mode Enabled');
  console.log('📊 Features: React.memo, Zustand shallow, Virtual scrolling, Debounced search');
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <App />
  </BrowserRouter>
)
