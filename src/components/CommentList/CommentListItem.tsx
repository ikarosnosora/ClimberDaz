import React from 'react';

interface CommentListItemProps {
  prefix?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
}

const CommentListItem: React.FC<CommentListItemProps> = ({ prefix, description, children }) => {
  return (
    <div className="p-4 bg-white">
      <div className="flex items-start space-x-3">
        {prefix && <div className="flex-shrink-0">{prefix}</div>}
        <div className="flex-1 min-w-0">
          {children}
          {description && <div className="mt-1 text-sm text-gray-500">{description}</div>}
        </div>
      </div>
    </div>
  );
};

export default CommentListItem; 