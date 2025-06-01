import React from 'react';

interface ServiceWorkerManager {
  register: () => Promise<ServiceWorkerRegistration | null>;
  unregister: () => Promise<boolean>;
  update: () => Promise<void>;
  getRegistration: () => Promise<ServiceWorkerRegistration | null>;
  sendMessage: (message: any) => Promise<any>;
  requestPushPermission: () => Promise<NotificationPermission>;
  subscribeToPush: () => Promise<PushSubscription | null>;
  clearCache: () => Promise<void>;
}

class ClimberServiceWorkerManager implements ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailableCallback?: () => void;
  private offlineCallback?: () => void;
  private onlineCallback?: () => void;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[SW Manager] Service Worker not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // Always check for updates
      });

      this.registration = registration;

      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW Manager] New content available');
              this.updateAvailableCallback?.();
            }
          });
        }
      });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));

      console.log('[SW Manager] Service Worker registered successfully');
      return registration;
    } catch (error) {
      console.error('[SW Manager] Service Worker registration failed:', error);
      return null;
    }
  }

  async unregister(): Promise<boolean> {
    const registration = await this.getRegistration();
    if (registration) {
      return registration.unregister();
    }
    return false;
  }

  async update(): Promise<void> {
    const registration = await this.getRegistration();
    if (registration) {
      await registration.update();
    }
  }

  async getRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (this.registration) {
      return this.registration;
    }

    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      return reg ?? null;
    }

    return null;
  }

  async sendMessage(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!navigator.serviceWorker.controller) {
        reject(new Error('No service worker controller'));
        return;
      }

      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
    });
  }

  async requestPushPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('[SW Manager] Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    return Notification.requestPermission();
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    try {
      const registration = await this.getRegistration();
      if (!registration) {
        throw new Error('Service Worker not registered');
      }

      const permission = await this.requestPushPermission();
      if (permission !== 'granted') {
        console.log('[SW Manager] Push notification permission denied');
        return null;
      }

      // In a real app, this would be your VAPID public key
      const applicationServerKey = urlBase64ToUint8Array(
        'YOUR_VAPID_PUBLIC_KEY_HERE' // Replace with actual VAPID key
      );

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      console.log('[SW Manager] Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('[SW Manager] Push subscription failed:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    try {
      await this.sendMessage({ type: 'CLEAR_CACHE' });
      console.log('[SW Manager] Cache cleared');
    } catch (error) {
      console.error('[SW Manager] Failed to clear cache:', error);
    }
  }

  // Event handlers
  private handleMessage(event: MessageEvent) {
    console.log('[SW Manager] Message from service worker:', event.data);
    
    switch (event.data.type) {
      case 'CACHE_UPDATED':
        // Handle cache updates
        break;
      case 'OFFLINE_FALLBACK':
        // Handle offline responses
        break;
      default:
        console.log('[SW Manager] Unknown message type:', event.data.type);
    }
  }

  private handleOnline() {
    console.log('[SW Manager] App is online');
    this.onlineCallback?.();
    
    // Trigger background sync for any failed requests
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'BACKGROUND_SYNC',
        tag: 'background-sync',
      });
    }
  }

  private handleOffline() {
    console.log('[SW Manager] App is offline');
    this.offlineCallback?.();
  }

  // Callback setters
  setUpdateAvailableCallback(callback: () => void) {
    this.updateAvailableCallback = callback;
  }

  setOfflineCallback(callback: () => void) {
    this.offlineCallback = callback;
  }

  setOnlineCallback(callback: () => void) {
    this.onlineCallback = callback;
  }

  // Utility methods
  isOnline(): boolean {
    return navigator.onLine;
  }

  async getCacheSize(): Promise<number> {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return 0;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    } catch (error) {
      console.error('[SW Manager] Failed to get cache size:', error);
      return 0;
    }
  }

  async getNetworkType(): Promise<string> {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }
}

// Utility function for VAPID key conversion
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// React hooks for service worker management
export const useServiceWorker = () => {
  const [registration, setRegistration] = React.useState<ServiceWorkerRegistration | null>(null);
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = React.useState(false);
  const [cacheSize, setCacheSize] = React.useState(0);
  
  const swManager = React.useMemo(() => new ClimberServiceWorkerManager(), []);

  React.useEffect(() => {
    // Register service worker
    swManager.register().then(setRegistration);

    // Set up callbacks
    swManager.setOnlineCallback(() => setIsOffline(false));
    swManager.setOfflineCallback(() => setIsOffline(true));
    swManager.setUpdateAvailableCallback(() => setUpdateAvailable(true));

    // Get initial cache size
    swManager.getCacheSize().then(setCacheSize);

    return () => {
      // Cleanup if needed
    };
  }, [swManager]);

  const updateApp = React.useCallback(async () => {
    await swManager.update();
    window.location.reload();
  }, [swManager]);

  const clearCache = React.useCallback(async () => {
    await swManager.clearCache();
    const newSize = await swManager.getCacheSize();
    setCacheSize(newSize);
  }, [swManager]);

  const subscribeToPush = React.useCallback(async () => {
    return swManager.subscribeToPush();
  }, [swManager]);

  return {
    registration,
    isOffline,
    updateAvailable,
    cacheSize,
    updateApp,
    clearCache,
    subscribeToPush,
    isOnline: swManager.isOnline(),
  };
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = React.useState<{
    loadTime: number;
    ttfb: number;
    fcp: number;
    lcp: number;
    cls: number;
    fid: number;
  }>({
    loadTime: 0,
    ttfb: 0,
    fcp: 0,
    lcp: 0,
    cls: 0,
    fid: 0,
  });

  React.useEffect(() => {
    // Measure performance metrics
    const measurePerformance = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        setMetrics(prev => ({
          ...prev,
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          ttfb: navigation.responseStart - navigation.requestStart,
        }));

        // Web Vitals (simplified implementation)
        if ('PerformanceObserver' in window) {
          // First Contentful Paint
          const fcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              setMetrics(prev => ({ ...prev, fcp: entries[0].startTime }));
            }
          });
          fcpObserver.observe({ entryTypes: ['paint'] });

          // Largest Contentful Paint
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
            }
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // Cumulative Layout Shift
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            setMetrics(prev => ({ ...prev, cls: clsValue }));
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
      }
    };

    // Measure on page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    return () => {
      window.removeEventListener('load', measurePerformance);
    };
  }, []);

  return metrics;
};

// Network status hook
export const useNetworkStatus = () => {
  const [networkInfo, setNetworkInfo] = React.useState({
    isOnline: navigator.onLine,
    type: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
  });

  React.useEffect(() => {
    const updateNetworkInfo = () => {
      const info = {
        isOnline: navigator.onLine,
        type: 'unknown',
        effectiveType: 'unknown',
        downlink: 0,
      };

      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        info.type = connection.type || 'unknown';
        info.effectiveType = connection.effectiveType || 'unknown';
        info.downlink = connection.downlink || 0;
      }

      setNetworkInfo(info);
    };

    updateNetworkInfo();

    window.addEventListener('online', updateNetworkInfo);
    window.addEventListener('offline', updateNetworkInfo);

    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', updateNetworkInfo);
    }

    return () => {
      window.removeEventListener('online', updateNetworkInfo);
      window.removeEventListener('offline', updateNetworkInfo);
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, []);

  return networkInfo;
};

export default ClimberServiceWorkerManager; 