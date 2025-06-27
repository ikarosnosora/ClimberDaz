import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Phase 4: Database Optimization Configuration
 * 
 * Provides optimized database settings for improved performance
 */
export const databaseOptimizationConfig: Partial<TypeOrmModuleOptions> = {
  // Connection pooling optimization
  extra: {
    // Maximum number of connections in pool
    max: 20,
    // Minimum number of connections in pool
    min: 5,
    // Maximum time a connection can be idle before being released
    idleTimeoutMillis: 30000,
    // Maximum time to wait for a connection
    connectionTimeoutMillis: 2000,
    // Enable connection validation
    testOnBorrow: true,
    // SQLite specific optimizations
    pragma: {
      journal_mode: 'WAL', // Write-Ahead Logging for better concurrency
      synchronous: 'NORMAL', // Balance between safety and performance
      cache_size: -64000, // 64MB cache
      temp_store: 'MEMORY', // Store temporary tables in memory
      mmap_size: 268435456, // 256MB memory-mapped I/O
      optimize: true, // Enable query optimizer
    }
  },
  
  // Query optimization
  maxQueryExecutionTime: 1000, // Log slow queries (>1s)
  
  // Logging configuration for performance monitoring
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  
  // Enable query result caching
  cache: {
    type: 'database',
    duration: 30000, // 30 seconds default cache
    options: {
      max: 100, // Maximum number of cached queries
    }
  },
};

/**
 * Index optimization recommendations for analytics tables
 */
export const analyticsIndexes = {
  // AnalyticsEvent table indexes
  analyticsEvent: [
    'CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_event(eventType)',
    'CREATE INDEX IF NOT EXISTS idx_analytics_event_user_id ON analytics_event(userId)',
    'CREATE INDEX IF NOT EXISTS idx_analytics_event_timestamp ON analytics_event(timestamp)',
    'CREATE INDEX IF NOT EXISTS idx_analytics_event_page_path ON analytics_event(pagePath)',
    'CREATE INDEX IF NOT EXISTS idx_analytics_event_composite ON analytics_event(eventType, userId, timestamp)',
  ],
  
  // UserSession table indexes
  userSession: [
    'CREATE INDEX IF NOT EXISTS idx_user_session_user_id ON user_session(userId)',
    'CREATE INDEX IF NOT EXISTS idx_user_session_start_time ON user_session(startTime)',
    'CREATE INDEX IF NOT EXISTS idx_user_session_end_time ON user_session(endTime)',
    'CREATE INDEX IF NOT EXISTS idx_user_session_active ON user_session(userId, startTime, endTime)',
  ]
};

/**
 * Query optimization utilities
 */
export class QueryOptimizer {
  /**
   * Optimize date range queries with proper indexing
   */
  static optimizeDateRangeQuery(startDate: Date, endDate: Date) {
    return {
      timestamp: {
        $gte: startDate,
        $lte: endDate
      }
    };
  }
  
  /**
   * Optimize pagination with cursor-based approach
   */
  static optimizePagination(lastId?: string, limit: number = 50) {
    const query: any = {};
    
    if (lastId) {
      query.id = { $gt: lastId };
    }
    
    return {
      where: query,
      take: Math.min(limit, 100), // Cap at 100 items
      order: { id: 'ASC' }
    };
  }
  
  /**
   * Optimize aggregation queries with proper grouping
   */
  static optimizeAggregation(groupBy: string[], selectFields: string[]) {
    return {
      select: selectFields,
      groupBy,
      // Add indexes hint for better performance
      cache: true,
      cacheDuration: 60000 // 1 minute cache for aggregations
    };
  }
}

/**
 * Performance monitoring for database operations
 */
export class DatabasePerformanceMonitor {
  private static queryTimes: Map<string, number[]> = new Map();
  
  static startQuery(queryName: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      
      if (!this.queryTimes.has(queryName)) {
        this.queryTimes.set(queryName, []);
      }
      
      const times = this.queryTimes.get(queryName)!;
      times.push(duration);
      
      // Keep only last 100 measurements
      if (times.length > 100) {
        times.shift();
      }
      
      // Log slow queries
      if (duration > 1000) {
        console.warn(`🐌 Slow query detected: ${queryName} took ${duration}ms`);
      }
    };
  }
  
  static getAverageQueryTime(queryName: string): number {
    const times = this.queryTimes.get(queryName);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }
  
  static getSlowQueries(threshold: number = 500): Array<{ name: string; avgTime: number }> {
    const slowQueries: Array<{ name: string; avgTime: number }> = [];
    
    for (const [name, times] of this.queryTimes.entries()) {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      if (avgTime > threshold) {
        slowQueries.push({ name, avgTime });
      }
    }
    
    return slowQueries.sort((a, b) => b.avgTime - a.avgTime);
  }
  
  static logPerformanceReport(): void {
    console.group('📊 Database Performance Report');
    
    const slowQueries = this.getSlowQueries();
    if (slowQueries.length > 0) {
      console.warn('⚠️ Slow queries detected:');
      slowQueries.forEach(({ name, avgTime }) => {
        console.warn(`  ${name}: ${avgTime.toFixed(2)}ms average`);
      });
    } else {
      console.log('✅ All queries performing well');
    }
    
    console.groupEnd();
  }
}