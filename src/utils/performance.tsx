import React from 'react';

/**
 * Performance Monitoring Utilities
 * 
 * Provides tools for measuring and optimizing application performance
 */

/**
 * Performance measurement result
 */
interface PerformanceMeasurement {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
}

/**
 * Performance monitor class for tracking operations
 */
class PerformanceMonitor {
  private measurements: Map<string, number> = new Map();
  private isEnabled: boolean;

  constructor() {
    // Only enable in development or when explicitly requested
    this.isEnabled = process.env.NODE_ENV === 'development' || 
                     localStorage.getItem('enablePerformanceMonitoring') === 'true';
  }

  /**
   * Start measuring a performance operation
   */
  start(name: string): void {
    if (!this.isEnabled) return;
    this.measurements.set(name, performance.now());
  }

  /**
   * End measuring and log the result
   */
  end(name: string): PerformanceMeasurement | null {
    if (!this.isEnabled) return null;
    
    const startTime = this.measurements.get(name);
    if (!startTime) {
      console.warn(`Performance measurement '${name}' was not started`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    const measurement: PerformanceMeasurement = {
      name,
      duration,
      startTime,
      endTime
    };

    // Log slow operations
    if (duration > 100) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    } else if (duration > 16) {
      console.info(`${name} took ${duration.toFixed(2)}ms`);
    }

    this.measurements.delete(name);
    return measurement;
  }

  /**
   * Measure a function execution time
   */
  async measure<T>(name: string, fn: () => T | Promise<T>): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      return result;
    } finally {
      this.end(name);
    }
  }

  /**
   * Get all current measurements
   */
  getActiveMeasurements(): string[] {
    return Array.from(this.measurements.keys());
  }

  /**
   * Clear all measurements
   */
  clear(): void {
    this.measurements.clear();
  }

  /**
   * Enable or disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (enabled) {
      localStorage.setItem('enablePerformanceMonitoring', 'true');
    } else {
      localStorage.removeItem('enablePerformanceMonitoring');
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for measuring component render performance
 */
export const usePerformanceMonitor = (componentName: string) => {
  // Measure render performance automatically
  React.useEffect(() => {
    performanceMonitor.start(`${componentName}-render`);
    performanceMonitor.end(`${componentName}-render`);
  });

  const startMeasurement = (name: string) => {
    performanceMonitor.start(`${componentName}-${name}`);
  };

  const endMeasurement = (name: string) => {
    return performanceMonitor.end(`${componentName}-${name}`);
  };

  function measureFunction<T>(name: string, fn: () => T | Promise<T>): Promise<T> {
    return performanceMonitor.measure(`${componentName}-${name}`, fn);
  }

  // Return utility functions for manual measurements
  return {
    startMeasurement,
    endMeasurement,
    measureFunction
  };
};

/**
 * Higher-order component for automatic performance monitoring
 */
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const MonitoredComponent: React.FC<P> = (props) => {
    React.useEffect(() => {
      performanceMonitor.start(`${displayName}-mount`);
      return () => {
        performanceMonitor.end(`${displayName}-mount`);
      };
    }, []);

    performanceMonitor.start(`${displayName}-render`);
    React.useEffect(() => {
      performanceMonitor.end(`${displayName}-render`);
    });

    return <WrappedComponent {...props} />;
  };

  MonitoredComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  return MonitoredComponent;
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Lazy loading utility for components
 */
export const createLazyComponent = (
  importFunc: () => Promise<{ default: React.ComponentType<unknown> }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = React.lazy(importFunc);
  
  const WrappedComponent: React.FC<Record<string, unknown>> = (props) => (
    <React.Suspense fallback={fallback ? React.createElement(fallback) : <div>Loading...</div>}>
      <LazyComponent {...props} />
    </React.Suspense>
  );

  return WrappedComponent;
};

/**
 * Memory usage monitoring (development only)
 */
export const logMemoryUsage = (label?: string) => {
  if (process.env.NODE_ENV !== 'development') return;
  
  if ('memory' in performance) {
    const memory = (performance as { memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    }}).memory;
    
    if (memory) {
      console.log(`Memory Usage ${label ? `(${label})` : ''}:`, {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`
      });
    }
  }
}; 