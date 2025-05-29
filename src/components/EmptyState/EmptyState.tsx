import React from 'react';
import { InboxIcon } from '@heroicons/react/24/outline'; // Or any other suitable icon

interface EmptyStateProps {
  description: string;
  icon?: React.ElementType;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  description,
  icon: IconComponent = InboxIcon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <IconComponent className="h-12 w-12 text-gray-400 mb-4" aria-hidden="true" />
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
};

export default EmptyState; 