import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

// Suppress findDOMNode warning
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.map(arg => {
    try {
      return String(arg);
    } catch (_e) {
      return '';
    }
  }).join(' ');

  // Check for the core findDOMNode deprecation message
  if (message.includes('findDOMNode is deprecated in StrictMode')) {
    return; // Suppress
  }
  originalConsoleError.apply(console, args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const message = args.map(arg => {
    try {
      return String(arg);
    } catch (_e) {
      return '';
    }
  }).join(' ');

  // Check for the core findDOMNode deprecation message
  if (message.includes('findDOMNode is deprecated in StrictMode')) {
    return; // Suppress
  }
  originalConsoleWarn.apply(console, args);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
