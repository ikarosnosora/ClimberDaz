import React from 'react';

interface TextAreaProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  placeholder,
  value,
  onChange,
  rows = 2,
  maxLength,
  disabled,
  className = "",
}) => {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      maxLength={maxLength}
      disabled={disabled}
      className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-100 ${className}`}
    />
  );
};

export default TextArea; 