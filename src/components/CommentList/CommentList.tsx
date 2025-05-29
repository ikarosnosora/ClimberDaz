import React from 'react';

interface CommentListProps {
  children: React.ReactNode;
}

const CommentList: React.FC<CommentListProps> = ({ children }) => {
  return <div className="divide-y divide-gray-200">{children}</div>;
};

export default CommentList; 