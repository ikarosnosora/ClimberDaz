import React, { useEffect } from 'react';
import { useUserSelector } from '../../store/useOptimizedStore';
import { realTimeManager } from '../../utils/realTimeManager';
import { AuthService } from '../../services/api/authService';

const ConnectionManager: React.FC = () => {
  const { user } = useUserSelector();

  useEffect(() => {
    if (user) {
      const token = AuthService.getToken();
      
      if (token) {
        // Initialize real-time connection
        realTimeManager.connect(user.openid, token)
          .then(() => {
            console.log('[ConnectionManager] Real-time connected');
          })
          .catch((error) => {
            console.error('[ConnectionManager] Real-time connection failed:', error);
          });

        // Offline manager is automatically initialized
        console.log('[ConnectionManager] Offline manager ready');
      }

      return () => {
        // Cleanup on unmount or user change
        realTimeManager.disconnect();
        console.log('[ConnectionManager] Disconnected from real-time');
      };
    }
  }, [user]);

  // This component doesn't render anything
  return null;
};

export default ConnectionManager; 