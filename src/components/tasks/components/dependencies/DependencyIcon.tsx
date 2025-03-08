
import React from 'react';
import { Link2 } from "lucide-react";

interface DependencyIconProps {
  hasDependencies: boolean;
  hasPendingDependencies?: boolean;
  hasDependents?: boolean;
  size?: number;
}

export const DependencyIcon = ({ 
  hasDependencies, 
  hasPendingDependencies, 
  hasDependents, 
  size = 16 
}: DependencyIconProps) => {
  // Determine the icon style based on dependency status
  const getIconColor = () => {
    if (!hasDependencies && !hasDependents) {
      return "text-gray-500"; // Default color when no dependencies exist
    }
    
    if (hasPendingDependencies) {
      return "text-amber-500"; // Amber color for pending dependencies
    }
    
    if (hasDependencies) {
      return "text-green-500"; // Green color for completed dependencies
    }
    
    if (hasDependents) {
      return "text-blue-500"; // Blue color for dependents
    }
    
    return "text-gray-500";
  };

  const getStrokeWidth = () => {
    if (hasDependencies || hasDependents) {
      return 2.5; // Thicker stroke for existing dependencies
    }
    return 2; // Default stroke width
  };

  const iconColor = getIconColor();
  const strokeWidth = getStrokeWidth();

  return (
    <Link2 
      className={`${iconColor} ${hasDependencies || hasDependents ? 'animate-pulse-once' : ''}`} 
      size={size} 
      strokeWidth={strokeWidth}
    />
  );
};
