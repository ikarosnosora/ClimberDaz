/**
 * Phase 4: Performance Testing Utilities
 * 
 * Comprehensive testing suite for validating optimization improvements
 */

import { performanceMonitor } from './performance';

interface PerformanceTestResult {
  testName: string;
  duration: number;
  success: boolean;
  metrics?: any;
  error?: string;
}

interface PerformanceTestSuite {
  name: string;
  tests: PerformanceTest[];
  results: PerformanceTestResult[];
}

interface PerformanceTest {
  name: string;
  test: () => Promise<any> | any;
  expectedMaxDuration?: number;
  iterations?: number;
}

class PerformanceTestRunner {
  private suites: Map<string, PerformanceTestSuite> = new Map();

  /**
   * Register a performance test suite
   */
  registerSuite(name: string, tests: PerformanceTest[]): void {
    this.suites.set(name, {
      name,
      tests,
      results: []
    });
  }

  /**
   * Run a specific test suite
   */
  async runSuite(suiteName: string): Promise<PerformanceTestResult[]> {
    const suite = this.suites.get(suiteName);
    if (!suite) {
      throw new Error(`Test suite '${suiteName}' not found`);
    }

    console.group(`🧪 Running Performance Test Suite: ${suiteName}`);
    suite.results = [];

    for (const test of suite.tests) {
      const result = await this.runSingleTest(test);
      suite.results.push(result);
      
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${test.name}: ${result.duration.toFixed(2)}ms`);
      
      if (!result.success && result.error) {
        console.error(`   Error: ${result.error}`);
      }
    }

    console.groupEnd();
    return suite.results;
  }

  /**
   * Run all registered test suites
   */
  async runAllSuites(): Promise<Map<string, PerformanceTestResult[]>> {
    const allResults = new Map<string, PerformanceTestResult[]>();

    for (const [suiteName] of this.suites) {
      const results = await this.runSuite(suiteName);
      allResults.set(suiteName, results);
    }

    this.generateReport(allResults);
    return allResults;
  }

  /**
   * Run a single performance test
   */
  private async runSingleTest(test: PerformanceTest): Promise<PerformanceTestResult> {
    const iterations = test.iterations || 1;
    const durations: number[] = [];
    let lastError: string | undefined;

    for (let i = 0; i < iterations; i++) {
      try {
        const startTime = performance.now();
        await test.test();
        const duration = performance.now() - startTime;
        durations.push(duration);
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
      }
    }

    const avgDuration = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0;

    const success = durations.length === iterations && 
      (test.expectedMaxDuration ? avgDuration <= test.expectedMaxDuration : true);

    return {
      testName: test.name,
      duration: avgDuration,
      success,
      metrics: {
        iterations,
        successfulRuns: durations.length,
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        standardDeviation: this.calculateStandardDeviation(durations)
      },
      error: lastError
    };
  }

  /**
   * Calculate standard deviation of durations
   */
  private calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    
    return Math.sqrt(avgSquaredDiff);
  }

  /**
   * Generate comprehensive performance report
   */
  private generateReport(results: Map<string, PerformanceTestResult[]>): void {
    console.group('📊 Performance Test Report');
    
    let totalTests = 0;
    let passedTests = 0;
    const slowTests: Array<{ suite: string; test: string; duration: number }> = [];

    for (const [suiteName, suiteResults] of results) {
      console.group(`📋 Suite: ${suiteName}`);
      
      for (const result of suiteResults) {
        totalTests++;
        if (result.success) passedTests++;
        
        if (result.duration > 100) { // Consider >100ms as slow
          slowTests.push({
            suite: suiteName,
            test: result.testName,
            duration: result.duration
          });
        }
        
        console.log(`  ${result.testName}: ${result.duration.toFixed(2)}ms`);
        if (result.metrics) {
          console.log(`    Iterations: ${result.metrics.iterations}`);
          console.log(`    Range: ${result.metrics.minDuration.toFixed(2)}ms - ${result.metrics.maxDuration.toFixed(2)}ms`);
          console.log(`    Std Dev: ${result.metrics.standardDeviation.toFixed(2)}ms`);
        }
      }
      
      console.groupEnd();
    }

    console.log(`\n📈 Summary:`);
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${passedTests}`);
    console.log(`  Failed: ${totalTests - passedTests}`);
    console.log(`  Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (slowTests.length > 0) {
      console.warn(`\n⚠️ Slow Tests (>100ms):`);
      slowTests
        .sort((a, b) => b.duration - a.duration)
        .forEach(({ suite, test, duration }) => {
          console.warn(`  ${suite}.${test}: ${duration.toFixed(2)}ms`);
        });
    }

    console.groupEnd();
  }
}

// Global test runner instance
export const performanceTestRunner = new PerformanceTestRunner();

/**
 * Frontend Performance Tests
 */
export function registerFrontendTests(): void {
  performanceTestRunner.registerSuite('Frontend Optimizations', [
    {
      name: 'Component Render Time',
      test: () => {
        // Simulate component rendering
        const start = performance.now();
        const elements = Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          value: Math.random()
        }));
        return performance.now() - start;
      },
      expectedMaxDuration: 10,
      iterations: 5
    },
    {
      name: 'Chart Data Processing',
      test: () => {
        // Simulate chart data processing
        const data = Array.from({ length: 10000 }, (_, i) => ({
          x: i,
          y: Math.sin(i / 100) * 100,
          category: `Category ${i % 10}`
        }));
        
        // Process data (grouping, filtering, sorting)
        const processed = data
          .filter(item => item.y > 0)
          .reduce((acc, item) => {
            const key = item.category;
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
          }, {} as Record<string, any[]>);
        
        return Object.keys(processed).length;
      },
      expectedMaxDuration: 50,
      iterations: 3
    },
    {
      name: 'Virtual List Scrolling',
      test: () => {
        // Simulate virtual list calculations
        const itemHeight = 50;
        const containerHeight = 400;
        const totalItems = 10000;
        const scrollTop = Math.random() * (totalItems * itemHeight);
        
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(
          startIndex + Math.ceil(containerHeight / itemHeight) + 1,
          totalItems
        );
        
        const visibleItems = Array.from(
          { length: endIndex - startIndex },
          (_, i) => startIndex + i
        );
        
        return visibleItems.length;
      },
      expectedMaxDuration: 5,
      iterations: 10
    }
  ]);
}

/**
 * Memory Performance Tests
 */
export function registerMemoryTests(): void {
  performanceTestRunner.registerSuite('Memory Optimization', [
    {
      name: 'Memory Usage Check',
      test: () => {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          return {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit
          };
        }
        return { message: 'Memory API not available' };
      },
      expectedMaxDuration: 1
    },
    {
      name: 'Large Array Processing',
      test: () => {
        // Test memory efficiency with large datasets
        const largeArray = new Array(100000).fill(0).map((_, i) => ({
          id: i,
          data: `Item ${i}`,
          timestamp: Date.now()
        }));
        
        // Process without creating intermediate arrays
        let count = 0;
        for (const item of largeArray) {
          if (item.id % 2 === 0) count++;
        }
        
        return count;
      },
      expectedMaxDuration: 100,
      iterations: 3
    }
  ]);
}

/**
 * Initialize all performance tests
 */
export function initializePerformanceTests(): void {
  registerFrontendTests();
  registerMemoryTests();
  
  console.log('🚀 Performance tests initialized');
  console.log('Run tests with: performanceTestRunner.runAllSuites()');
}

/**
 * Quick performance benchmark
 */
export async function runQuickBenchmark(): Promise<void> {
  console.log('🏃‍♂️ Running quick performance benchmark...');
  
  initializePerformanceTests();
  await performanceTestRunner.runAllSuites();
  
  // Also run performance monitor report
  performanceMonitor.logReport();
}