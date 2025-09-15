
import React from 'react';

interface ProgressRingProps {
  percentage: number;
  color: 'primary' | 'secondary' | 'accent-red' | 'accent-yellow' | 'accent-blue';
  size?: number;
  strokeWidth?: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  color,
  size = 120,
  strokeWidth = 10,
}) => {
  const normalizedRadius = (size - strokeWidth) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    'primary': 'text-primary',
    'secondary': 'text-secondary',
    'accent-red': 'text-accent-red',
    'accent-yellow': 'text-accent-yellow',
    'accent-blue': 'text-accent-blue',
  };

  const safePercentage = Math.min(100, Math.max(0, isNaN(percentage) ? 0 : percentage));


  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        height={size}
        width={size}
        className="-rotate-90"
      >
        <circle
          className="text-gray-600"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={colorClasses[color]}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
        {`${Math.round(safePercentage)}%`}
      </span>
    </div>
  );
};

export default ProgressRing;
