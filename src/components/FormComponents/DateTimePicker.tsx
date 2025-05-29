import React from 'react';
// import { DatePicker } from 'antd-mobile'; // Removed
import dayjs from 'dayjs';

interface DateTimePickerProps {
  value?: Date;
  onChange?: (value: Date) => void;
  placeholder?: string;
  min?: Date;
  max?: Date;
  className?: string;
  label?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date and time', // Changed placeholder to English
  min,
  max,
  className = '',
  label,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      const dateValue = event.target.value ? new Date(event.target.value) : undefined;
      if (dateValue) {
        onChange(dateValue);
      }
    }
  };

  const formatDateForInput = (date?: Date): string => {
    if (!date) return '';
    // Format: YYYY-MM-DDTHH:mm (required by datetime-local)
    return dayjs(date).format('YYYY-MM-DDTHH:mm');
  };

  const formatMinMaxDate = (date?: Date): string | undefined => {
    if (!date) return undefined;
    return dayjs(date).format('YYYY-MM-DDTHH:mm');
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>}
      <input
        type="datetime-local"
        value={formatDateForInput(value)}
        onChange={handleChange}
        min={formatMinMaxDate(min)}
        max={formatMinMaxDate(max)}
        placeholder={placeholder}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
      />
    </div>
  );
};

export default DateTimePicker; 