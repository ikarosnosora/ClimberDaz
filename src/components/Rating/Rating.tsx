import React, { useState, CSSProperties } from 'react';

interface StarIconProps {
  filled: boolean;
  halfFilled?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  size?: number;
  color?: string;
}

const StarIcon: React.FC<StarIconProps> = ({
  filled,
  halfFilled = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  size = 20,
  color = 'currentColor',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth="1.5"
      style={{ width: size, height: size, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="transition-colors duration-150"
    >
      {halfFilled ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2zM12 17.27L12 2V17.27z"
          style={{ fill: color }}
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.82.61l-4.724-2.885a.563.563 0 00-.652 0l-4.724 2.885a.562.562 0 01-.82-.61l1.285-5.385a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      )}
    </svg>
  );
};

interface RatingProps {
  value?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  label?: string;
  allowHalf?: boolean;
  size?: number; // Corresponds to star size
  count?: number; // Number of stars
  color?: string;
  className?: string;
  style?: CSSProperties;
}

const Rating: React.FC<RatingProps> = ({
  value = 0,
  onChange,
  readonly = false,
  label,
  allowHalf = false,
  size = 20,
  count = 5,
  color = 'var(--rating-color)', // Default color from CSS variable
  className = '',
  style = {},
}) => {
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);

  const handleClick = (index: number) => {
    if (readonly || !onChange) return;
    let newValue = index + 1;
    if (allowHalf) {
      const currentStarValue = index + 1;
      if (value === currentStarValue - 0.5) {
        newValue = currentStarValue;
      } else if (value === currentStarValue) {
        newValue = allowHalf ? currentStarValue - 0.5 : currentStarValue;
      } else {
        newValue = currentStarValue - 0.5;
      }

      if (allowHalf) {
        if (value >= index + 0.5 && value <= index + 1) {
          newValue = value === index + 1 ? index + 0.5 : index + 1;
        } else {
          newValue = index + 0.5;
        }
      } else {
        newValue = index + 1;
      }
    }
    onChange(newValue > count ? count : newValue < 0 ? 0 : newValue);
  };

  const handleMouseEnter = (index: number) => {
    if (readonly) return;
    setHoverValue(index + 1);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverValue(undefined);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`} style={style}>
      {label && <span className="text-sm text-[var(--secondary)] min-w-[40px]">{label}</span>}
      <div className="flex">
        {[...Array(count)].map((_, index) => {
          const starValue = index + 1;
          const displayValue = hoverValue !== undefined ? hoverValue : value;
          
          let filled = displayValue >= starValue;
          let halfFilled = false;

          if (allowHalf && displayValue >= starValue - 0.5 && displayValue < starValue) {
            filled = true; // Container star should look "active"
            halfFilled = true;
          }


          return (
            <StarIcon
              key={index}
              filled={filled}
              halfFilled={halfFilled}
              onClick={() => handleClick(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              size={size}
              color={color}
            />
          );
        })}
      </div>
      {readonly && value > 0 && (
        <span className="text-sm text-[var(--primary)] font-semibold ml-1">
          {value.toFixed(allowHalf ? 1 : 0)}
        </span>
      )}
    </div>
  );
};

export default Rating; 