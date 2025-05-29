import React from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';

interface NavBarProps {
  title: string;
  onBack?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ title, onBack }) => {
  return (
    <div className="bg-white shadow-md h-12 flex items-center justify-between px-4 sticky top-0 z-50">
      {onBack && (
        <button onClick={onBack} className="p-2 -ml-2">
          <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
        </button>
      )}
      <h1 className={`text-lg font-semibold text-gray-800 ${onBack ? 'mx-auto' : 'ml-0'}`}>
        {title}
      </h1>
      {onBack && <div className="w-6" /> /* Placeholder to balance the back button */}
    </div>
  );
};

export default NavBar; 