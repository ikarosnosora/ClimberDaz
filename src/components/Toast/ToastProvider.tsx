import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

interface ToastMessage {
  id: number;
  content: string;
  icon?: 'success' | 'fail' | 'info';
  position?: 'center' | 'top' | 'bottom';
}

interface ToastContextType {
  show: (options: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const show = useCallback((options: Omit<ToastMessage, 'id'>) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { ...options, id }]);
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 3000); // Auto-dismiss after 3 seconds
  }, []);

  const getIcon = (iconType?: 'success' | 'fail' | 'info') => {
    switch (iconType) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />;
      case 'fail':
        return <XCircleIcon className="w-6 h-6 text-red-500 mr-2" />;
      case 'info':
        return <InformationCircleIcon className="w-6 h-6 text-blue-500 mr-2" />;
      default:
        return null;
    }
  };

  const getPositionClass = (position?: 'center' | 'top' | 'bottom') => {
    switch (position) {
      case 'top':
        return 'top-5 left-1/2 -translate-x-1/2';
      case 'bottom':
        return 'bottom-5 left-1/2 -translate-x-1/2';
      case 'center':
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed z-[1000]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-md shadow-lg bg-gray-800 text-white flex items-center max-w-sm ${getPositionClass(toast.position)}`}
          >
            {getIcon(toast.icon)}
            <span>{toast.content}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}; 