import React from "react";
import { cn } from "@/lib/utils";

interface SparklineProps extends React.HTMLAttributes<HTMLDivElement> {
  data: number[];
  color?: string;
  height?: number;
  limit?: number;
  children?: React.ReactNode;
}

// Custom SVG-based sparkline implementation
export function Sparkline({
  data = [],
  color = "#4ade80",
  height = 30,
  limit,
  className,
  ...props
}: SparklineProps) {
  // Ensure we have valid data
  const validData = !data || data.length < 2 ? [0, 0] : data;
  
  // Use the specified limit or all data points
  const limitedData = limit && limit < validData.length 
    ? validData.slice(validData.length - limit) 
    : validData;
  
  // Return early with empty state if we have invalid data
  if (limitedData.length < 2) {
    return (
      <div 
        className={cn("w-full h-full flex items-center justify-center", className)}
        style={{ height: `${height}px` }}
        {...props}
      >
        <div className="text-xs text-muted-foreground">No data</div>
      </div>
    );
  }

  // Find min and max values to scale the chart
  const min = Math.min(...limitedData);
  const max = Math.max(...limitedData);
  const range = max - min || 1; // Prevent division by zero

  // Create the SVG points
  const width = 100; // Use percentage for responsive scaling
  const points = limitedData.map((value, index) => {
    const x = (index / (limitedData.length - 1)) * width;
    // Normalize the value between 0 and chart height
    // Invert the y-coordinate because SVG coordinates start from top-left
    const normalizedValue = (value - min) / range;
    const y = height - (normalizedValue * height);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div 
      className={cn("w-full", className)} 
      style={{ height: `${height}px` }}
      {...props}
    >
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Optional end point */}
        <circle
          cx={width}
          cy={points.split(" ").pop()?.split(",")[1] || 0}
          r="2"
          fill={color}
        />
      </svg>
    </div>
  );
}

// Keep the interface for backward compatibility, but we won't use it anymore
export interface SparklineSpotProps {
  size?: number;
  spotColors?: {
    endSpot?: string;
    spotColor?: string;
  };
}

// This is now just a stub for backward compatibility
export function SparklineSpot(_props: SparklineSpotProps) {
  return null;
}
