import React from 'react';
import './FAB.css';

interface FABProps {
  onClick: () => void;
  isActive?: boolean;
  icon?: string;
  className?: string;
}

/**
 * FAB - Floating Action Button
 * Modern floating action button with gradient design and smooth animations
 */
const FAB: React.FC<FABProps> = ({ 
  onClick, 
  isActive = false, 
  icon = 'fas fa-plus',
  className = '' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`fab ${isActive ? 'fab-active' : ''} ${className}`}
      aria-label={isActive ? 'Close create activity' : 'Create new activity'}
    >
      <i className={`${icon} fab-icon ${isActive ? 'fab-icon-active' : ''}`}></i>
    </button>
  );
};

export default FAB; 