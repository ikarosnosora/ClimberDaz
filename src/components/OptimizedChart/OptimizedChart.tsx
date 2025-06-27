import React, { memo, useMemo, lazy, Suspense } from 'react';
import { ResponsiveContainer } from 'recharts';

// Lazy load chart components to reduce initial bundle size
const LineChart = lazy(() => import('recharts').then(module => ({ default: module.LineChart })));
const BarChart = lazy(() => import('recharts').then(module => ({ default: module.BarChart })));
const AreaChart = lazy(() => import('recharts').then(module => ({ default: module.AreaChart })));
const PieChart = lazy(() => import('recharts').then(module => ({ default: module.PieChart })));

interface OptimizedChartProps {
  type: 'line' | 'bar' | 'area' | 'pie';
  data: any[];
  config: any;
  height?: number;
  loading?: boolean;
  className?: string;
}

const ChartSkeleton: React.FC<{ height: number }> = ({ height }) => (
  <div 
    className="bg-gray-100 animate-pulse rounded-lg flex items-center justify-center"
    style={{ height }}
  >
    <div className="text-gray-400 text-sm">Loading chart...</div>
  </div>
);

const OptimizedChart: React.FC<OptimizedChartProps> = memo(({
  type,
  data,
  config,
  height = 300,
  loading = false,
  className = '',
}) => {
  // Memoize processed data to avoid unnecessary recalculations
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Apply any data transformations here
    return data.map(item => ({
      ...item,
      // Ensure numeric values are properly formatted
      ...Object.keys(item).reduce((acc, key) => {
        const value = item[key];
        if (typeof value === 'number') {
          acc[key] = Math.round(value * 100) / 100; // Round to 2 decimal places
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as any)
    }));
  }, [data]);

  // Memoize chart configuration
  const chartConfig = useMemo(() => ({
    ...config,
    // Add performance optimizations
    isAnimationActive: data.length < 100, // Disable animations for large datasets
    animationDuration: data.length < 50 ? 300 : 0,
  }), [config, data.length]);

  if (loading || processedData.length === 0) {
    return <ChartSkeleton height={height} />;
  }

  const renderChart = () => {
    const commonProps = {
      data: processedData,
      ...chartConfig,
    };

    switch (type) {
      case 'line':
        return <LineChart {...commonProps} />;
      case 'bar':
        return <BarChart {...commonProps} />;
      case 'area':
        return <AreaChart {...commonProps} />;
      case 'pie':
        return <PieChart {...commonProps} />;
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <Suspense fallback={<ChartSkeleton height={height} />}>
          {renderChart()}
        </Suspense>
      </ResponsiveContainer>
    </div>
  );
});

OptimizedChart.displayName = 'OptimizedChart';

export default OptimizedChart;