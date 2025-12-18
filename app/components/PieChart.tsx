"use client";

interface PieChartProps {
  percentage: number;
  size?: number;
}

export function PieChart({ percentage, size = 80 }: PieChartProps) {
  const radius = size / 2 - 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  // Determine color based on percentage
  const getColor = (percent: number) => {
    if (percent >= 80) return '#10b981'; // green
    if (percent >= 60) return '#f59e0b'; // yellow
    if (percent > 0) return '#f97316'; // orange
    return '#9ca3af'; // gray
  };

  const color = getColor(percentage);

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
    </div>
  );
}

