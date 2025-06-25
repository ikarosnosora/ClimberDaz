import React from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';

interface NavBarProps {
  title: string;
  onBack?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ title, onBack }) => {
  return (
    <div 
      className="h-12 flex items-center justify-between px-4 sticky top-0 z-50 backdrop-blur-lg"
      style={{
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 254, 254, 0.90) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(255, 126, 95, 0.08)',
      }}
    >
      {onBack && (
        <button 
          onClick={onBack} 
          className="p-2 -ml-2 rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100"
          style={{
            color: '#FF7E5F',
          }}
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
      )}
      <h1 
        className={`text-lg font-semibold ${onBack ? 'mx-auto' : 'ml-0'}`}
        style={{
          background: 'linear-gradient(135deg, #FF7E5F 0%, #5B86E5 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {title}
      </h1>
      {onBack && <div className="w-6" />}
    </div>
  );
};

export default NavBar; 