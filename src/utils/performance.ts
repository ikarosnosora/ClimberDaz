import React from 'react';

/**
 * Phase 4: Advanced Performance Monitoring & Optimization Utilities
 * 
 * Provides comprehensive tools for measuring, monitoring, and optimizing application performance
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
 * Web Vitals metrics interface
 */
interface WebVitals {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
}

/**
 * Performance budget configuration
 */
interface PerformanceBudget {
  bundleSize: number; // Maximum bundle size in MB
  loadTime: number;   // Maximum load time in ms
  fcp: number;        // First Contentful Paint target in ms
  lcp: number;        // Largest Contentful Paint target in ms
  cls: number;        // Cumulative Layout Shift target
}

/**
 * Enhanced Performance monitor class for tracking operations
 */
class AdvancedPerformanceMonitor {
  private measurements: Map<string, number> = new Map();
  private isEnabled: boolean;
  private budget: PerformanceBudget;
  private vitals: Partial<WebVitals> = {};
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    // Only enable in development or when explicitly requested
    this.isEnabled = process.env.NODE_ENV === 'development' || 
                     localStorage.getItem('enablePerformanceMonitoring') === 'true';
    
    // Set performance budget targets
    this.budget = {
      bundleSize: 2, // 2MB max bundle size
      loadTime: 3000, // 3 seconds max load time
      fcp: 1800, // 1.8 seconds First Contentful Paint
      lcp: 2500, // 2.5 seconds Largest Contentful Paint
      cls: 0.1   // 0.1 Cumulative Layout Shift
    };

    if (this.isEnabled) {
      this.initializeWebVitalsMonitoring();
      this.initializeBundleAnalysis();
    }
  }

  /**
   * Initialize Web Vitals monitoring
   */
  private initializeWebVitalsMonitoring(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      // First Contentful Paint
      this.createObserver('paint', (entries) => {
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.vitals.FCP = fcpEntry.startTime;
          this.checkBudget('FCP', fcpEntry.startTime, this.budget.fcp);
        }
      });

      // Largest Contentful Paint
      this.createObserver('largest-contentful-paint', (entries) => {
        const lcpEntry = entries[entries.length - 1];
        if (lcpEntry) {
          this.vitals.LCP = lcpEntry.startTime;
          this.checkBudget('LCP', lcpEntry.startTime, this.budget.lcp);
        }
      });

      // First Input Delay
      this.createObserver('first-input', (entries) => {
        const fidEntry = entries[0] as any;
        if (fidEntry && fidEntry.processingStart) {
          this.vitals.FID = fidEntry.processingStart - fidEntry.startTime;
          console.log(`✅ FID: ${this.vitals.FID.toFixed(2)}ms`);
        }
      });

      // Cumulative Layout Shift
      this.createObserver('layout-shift', (entries) => {
        let clsValue = 0;
        for (const entry of entries) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.vitals.CLS = clsValue;
        this.checkBudget('CLS', clsValue, this.budget.cls);
      });

    } catch (error) {
      console.warn('Performance monitoring initialization failed:', error);
    }
  }

  /**
   * Create performance observer
   */
  private createObserver(entryType: string, callback: (entries: PerformanceEntry[]) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ entryTypes: [entryType] });
      this.observers.set(entryType, observer);
    } catch (error) {
      console.warn(`Failed to create observer for ${entryType}:`, error);
    }
  }

  /**
   * Check performance budget
   */
  private checkBudget(metric: string, value: number, budget: number): void {
    const isOverBudget = value > budget;
    const status = isOverBudget ? '⚠️' : '✅';
    const message = `${status} ${metric}: ${value.toFixed(2)}${metric === 'CLS' ? '' : 'ms'} (Budget: ${budget}${metric === 'CLS' ? '' : 'ms'})`;
    
    if (isOverBudget) {
      console.warn(message);
    } else {
      console.log(message);
    }
  }

  /**
   * Initialize bundle analysis
   */
  private initializeBundleAnalysis(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      // Analyze resource timing
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      let totalSize = 0;
      let jsSize = 0;
      let cssSize = 0;

      resources.forEach(resource => {
        if (resource.transferSize) {
          totalSize += resource.transferSize;
          
          if (resource.name.includes('.js')) {
            jsSize += resource.transferSize;
          } else if (resource.name.includes('.css')) {
            cssSize += resource.transferSize;
          }
        }
      });

      const totalSizeMB = totalSize / (1024 * 1024);
      const jsSizeMB = jsSize / (1024 * 1024);
      const cssSizeMB = cssSize / (1024 * 1024);

      console.group('📊 Bundle Analysis');
      console.log(`Total Size: ${totalSizeMB.toFixed(2)}MB`);
      console.log(`JavaScript: ${jsSizeMB.toFixed(2)}MB`);
      console.log(`CSS: ${cssSizeMB.toFixed(2)}MB`);
      
      if (totalSizeMB > this.budget.bundleSize) {
        console.warn(`⚠️ Bundle size exceeds budget: ${totalSizeMB.toFixed(2)}MB > ${this.budget.bundleSize}MB`);
      } else {
        console.log(`✅ Bundle size within budget: ${totalSizeMB.toFixed(2)}MB`);
      }
      console.groupEnd();
    });
  }

  /**
   * Start measuring a named operation
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
      console.warn(`🐌 Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    } else if (duration > 16) {
      console.info(`⏱️ ${name} took ${duration.toFixed(2)}ms`);
    }

    this.measurements.delete(name);
    return measurement;
  }

  /**
   * Measure a function execution
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
   * Get current Web Vitals
   */
  getWebVitals(): Partial<WebVitals> {
    return { ...this.vitals };
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const vitals = this.getWebVitals();
    return `
📊 Performance Report
===================
FCP: ${vitals.FCP?.toFixed(2) || 'N/A'}ms
LCP: ${vitals.LCP?.toFixed(2) || 'N/A'}ms
FID: ${vitals.FID?.toFixed(2) || 'N/A'}ms
CLS: ${vitals.CLS?.toFixed(3) || 'N/A'}
    `.trim();
  }

  /**
   * Clean up observers
   */
  cleanup(): void {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
    this.measurements.clear();
  }
}

// Global instance
export const advancedPerformanceMonitor = new AdvancedPerformanceMonitor();

/**
 * React hook for performance monitoring
 */
export const useAdvancedPerformanceMonitor = (componentName: string) => {
  React.useEffect(() => {
    advancedPerformanceMonitor.start(`${componentName}-mount`);
    return () => {
      advancedPerformanceMonitor.end(`${componentName}-mount`);
    };
  }, [componentName]);

  const startMeasurement = (name: string) => {
    advancedPerformanceMonitor.start(`${componentName}-${name}`);
  };

  const endMeasurement = (name: string) => {
    return advancedPerformanceMonitor.end(`${componentName}-${name}`);
  };

  const measureFunction = async function<T>(name: string, fn: () => T | Promise<T>): Promise<T> {
    return advancedPerformanceMonitor.measure(`${componentName}-${name}`, fn);
  };

  return {
    startMeasurement,
    endMeasurement,
    measureFunction,
    getReport: () => advancedPerformanceMonitor.generateReport()
  };
};

/**
 * HOC for performance monitoring
 */
export const withPerformanceMonitoring = function<P extends Record<string, any>>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const MonitoredComponent: React.FC<P> = (props) => {
    React.useEffect(() => {
      advancedPerformanceMonitor.start(`${displayName}-render`);
    }, []);

    React.useEffect(() => {
      advancedPerformanceMonitor.end(`${displayName}-render`);
    });

    return React.createElement(WrappedComponent, props);
  };

  MonitoredComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  return MonitoredComponent;
};

/**
 * Debounce utility for performance optimization
 */
export const debounce = function<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): ((...args: Parameters<T>) => void) {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func(...args);
    }, wait);

    if (callNow) func(...args);
  };
};

/**
 * Throttle utility for performance optimization
 */
export const throttle = function<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
  options: { leading?: boolean; trailing?: boolean } = { leading: true, trailing: true }
): ((...args: Parameters<T>) => void) {
  let inThrottle: boolean;
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      if (options.leading !== false) {
        func(...args);
      }
      lastRan = Date.now();
      inThrottle = true;
    } else {
      if (options.trailing !== false) {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
          if (Date.now() - lastRan >= limit) {
            func(...args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    }
  };
};

/**
 * Create lazy-loaded component with performance monitoring
 */
export const createLazyComponent = (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = React.lazy(importFunc);

  const WrappedComponent: React.FC<Record<string, any>> = (props) => (
    React.createElement(React.Suspense, {
      fallback: fallback ? React.createElement(fallback) : React.createElement('div', {}, 'Loading...')
    }, React.createElement(LazyComponent, props))
  );

  return WrappedComponent;
};

/**
 * Log memory usage for debugging
 */
export const logMemoryUsage = (label?: string) => {
  if (process.env.NODE_ENV !== 'development') return;

  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.group(`🧠 Memory Usage${label ? ` - ${label}` : ''}`);
    console.log(`Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`);
    console.groupEnd();
  }
};

/**
 * Virtual scrolling hook for large lists
 */
export const useVirtualScrolling = (
  itemCount: number,
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    itemCount - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = React.useMemo(() => {
    const items = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({
        index: i,
        offsetTop: i * itemHeight
      });
    }
    return items;
  }, [startIndex, endIndex, itemHeight]);

  const totalHeight = itemCount * itemHeight;

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  return {
    visibleItems,
    totalHeight,
    handleScroll
  };
};

/**
 * Intersection Observer hook for lazy loading
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
): [React.RefCallback<Element>, IntersectionObserverEntry | undefined] => {
  const [entry, setEntry] = React.useState<IntersectionObserverEntry>();
  const [element, setElement] = React.useState<Element | null>(null);

  const callbackRef = React.useCallback((node: Element | null) => {
    setElement(node);
  }, []);

  React.useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element, options]);

  return [callbackRef, entry];
};

/**
 * Lazy image loading hook
 */
export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder || '');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const [ref, entry] = useIntersectionObserver({
    threshold: 0.1,
  });

  React.useEffect(() => {
    if (entry?.isIntersecting && src) {
      setIsLoading(true);
      setIsError(false);

      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
      };
      img.onerror = () => {
        setIsError(true);
        setIsLoading(false);
      };
      img.src = src;
    }
  }, [entry?.isIntersecting, src]);

  return { ref, imageSrc, isLoading, isError };
}; 