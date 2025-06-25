import React from 'react';

interface TextAreaProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
  className = '',
  disabled = false,
  required = false,
  onFocus,
  onBlur,
}) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      disabled={disabled}
      required={required}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`w-full p-2 border border-gray-300 rounded-md resize-none disabled:bg-gray-100 transition-all duration-200 ${className}`}
      style={{
        focusOutline: 'none',
        focusBorderColor: '#FF7E5F',
        focusRingColor: 'rgba(255, 126, 95, 0.2)',
        focusRingShadow: '0 0 0 3px rgba(255, 126, 95, 0.1)',
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#FF7E5F';
        e.target.style.boxShadow = '0 0 0 3px rgba(255, 126, 95, 0.1)';
        e.target.style.outline = 'none';
        if (onFocus) onFocus();
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#D1D5DB';
        e.target.style.boxShadow = 'none';
        if (onBlur) onBlur();
      }}
    />
  );
};

export default TextArea; 