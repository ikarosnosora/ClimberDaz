import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '../utils/analyticsManager';
import { EventType } from '../types/analytics';
import { useAuth } from './useAuth';

/**
 * Analytics Hook - 提供简化的分析事件追踪功能
 */
export const useAnalytics = () => {
  const location = useLocation();
  const { user } = useAuth();
  const previousLocation = useRef(location.pathname);

  // 设置用户ID
  useEffect(() => {
    if (user?.id) {
      analytics.setUserId(user.id);
    } else {
      analytics.clearUserId();
    }
  }, [user?.id]);

  // 自动跟踪页面浏览
  useEffect(() => {
    if (location.pathname !== previousLocation.current) {
      analytics.trackPageView(location.pathname);
      previousLocation.current = location.pathname;
    }
  }, [location.pathname]);

  // 跟踪用户操作
  const trackUserAction = useCallback((action: string, properties?: Record<string, any>) => {
    analytics.trackUserAction(action, properties);
  }, []);

  // 跟踪按钮点击
  const trackButtonClick = useCallback((buttonName: string, properties?: Record<string, any>) => {
    analytics.trackButtonClick(buttonName, properties);
  }, []);

  // 跟踪表单提交
  const trackFormSubmit = useCallback((formName: string, properties?: Record<string, any>) => {
    analytics.trackFormSubmit(formName, properties);
  }, []);

  // 跟踪搜索
  const trackSearch = useCallback((query: string, results?: number, properties?: Record<string, any>) => {
    analytics.trackSearch(query, results, properties);
  }, []);

  // 跟踪错误
  const trackError = useCallback((error: Error, properties?: Record<string, any>) => {
    analytics.trackError(error, properties);
  }, []);

  // 跟踪性能指标
  const trackPerformance = useCallback((metric: string, value: number, properties?: Record<string, any>) => {
    analytics.trackPerformance(metric, value, properties);
  }, []);

  // 跟踪活动相关操作
  const trackActivityAction = useCallback((
    action: 'create' | 'join' | 'leave' | 'view',
    activityId: string,
    properties?: Record<string, any>
  ) => {
    analytics.trackActivityAction(action, activityId, properties);
  }, []);

  // 跟踪自定义事件
  const track = useCallback((eventType: EventType, properties?: Record<string, any>) => {
    analytics.track(eventType, properties);
  }, []);

  return {
    track,
    trackUserAction,
    trackButtonClick,
    trackFormSubmit,
    trackSearch,
    trackError,
    trackPerformance,
    trackActivityAction,
  };
};

/**
 * 页面性能追踪Hook
 */
export const usePagePerformance = () => {
  const { trackPerformance } = useAnalytics();
  const startTime = useRef(Date.now());

  useEffect(() => {
    // 页面加载完成时记录加载时间
    const handleLoad = () => {
      const loadTime = Date.now() - startTime.current;
      trackPerformance('page_load_time', loadTime, {
        page: window.location.pathname,
      });
    };

    // 如果页面已经加载完成
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [trackPerformance]);

  // 记录组件渲染性能
  const trackRenderTime = useCallback((componentName: string, renderTime: number) => {
    trackPerformance('component_render_time', renderTime, {
      component: componentName,
      page: window.location.pathname,
    });
  }, [trackPerformance]);

  return {
    trackRenderTime,
  };
};

/**
 * 表单分析Hook
 */
export const useFormAnalytics = (formName: string) => {
  const { trackFormSubmit, trackUserAction } = useAnalytics();
  const formStartTime = useRef<number>();
  const fieldInteractions = useRef<Record<string, number>>({});

  // 表单开始填写
  const onFormStart = useCallback(() => {
    formStartTime.current = Date.now();
    trackUserAction('form_start', { formName });
  }, [formName, trackUserAction]);

  // 字段交互
  const onFieldInteraction = useCallback((fieldName: string) => {
    fieldInteractions.current[fieldName] = (fieldInteractions.current[fieldName] || 0) + 1;
    trackUserAction('field_interaction', {
      formName,
      fieldName,
      interactionCount: fieldInteractions.current[fieldName],
    });
  }, [formName, trackUserAction]);

  // 表单提交
  const onFormSubmit = useCallback((success: boolean, errors?: string[]) => {
    const duration = formStartTime.current ? Date.now() - formStartTime.current : undefined;
    trackFormSubmit(formName, {
      success,
      errors,
      duration,
      fieldInteractions: fieldInteractions.current,
    });
  }, [formName, trackFormSubmit]);

  // 表单放弃
  const onFormAbandon = useCallback((reason?: string) => {
    const duration = formStartTime.current ? Date.now() - formStartTime.current : undefined;
    trackUserAction('form_abandon', {
      formName,
      reason,
      duration,
      fieldInteractions: fieldInteractions.current,
    });
  }, [formName, trackUserAction]);

  return {
    onFormStart,
    onFieldInteraction,
    onFormSubmit,
    onFormAbandon,
  };
};

/**
 * 错误边界分析Hook
 */
export const useErrorAnalytics = () => {
  const { trackError } = useAnalytics();

  const reportError = useCallback((error: Error, errorInfo?: any) => {
    trackError(error, {
      errorInfo,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  }, [trackError]);

  return {
    reportError,
  };
};

/**
 * 搜索分析Hook
 */
export const useSearchAnalytics = () => {
  const { trackSearch, trackUserAction } = useAnalytics();
  const searchStartTime = useRef<number>();

  const onSearchStart = useCallback((query: string) => {
    searchStartTime.current = Date.now();
    trackUserAction('search_start', { query });
  }, [trackUserAction]);

  const onSearchComplete = useCallback((query: string, results: number, filters?: Record<string, any>) => {
    const duration = searchStartTime.current ? Date.now() - searchStartTime.current : undefined;
    trackSearch(query, results, {
      duration,
      filters,
      page: window.location.pathname,
    });
  }, [trackSearch]);

  const onSearchResultClick = useCallback((query: string, resultIndex: number, resultId: string) => {
    trackUserAction('search_result_click', {
      query,
      resultIndex,
      resultId,
      page: window.location.pathname,
    });
  }, [trackUserAction]);

  return {
    onSearchStart,
    onSearchComplete,
    onSearchResultClick,
  };
};