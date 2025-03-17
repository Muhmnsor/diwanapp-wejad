
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

type StepType = 'decision' | 'opinion' | 'review' | 'notification';
type Size = 'default' | 'xs' | 'sm' | 'lg';

interface WorkflowStatusBadgeProps {
  status: StepType;
  size?: Size;
  className?: string;
}

export const WorkflowStatusBadge: React.FC<WorkflowStatusBadgeProps> = ({ 
  status, 
  size = 'default',
  className
}) => {
  let icon;
  let label;
  let variant: 'default' | 'secondary' | 'outline' | 'destructive' = 'default';
  
  switch (status) {
    case 'decision':
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
      label = 'قرار';
      variant = 'default';
      break;
    case 'opinion':
      icon = <Eye className="h-3 w-3 mr-1" />;
      label = 'إبداء رأي';
      variant = 'secondary';
      break;
    case 'review':
      icon = <Clock className="h-3 w-3 mr-1" />;
      label = 'مراجعة';
      variant = 'outline';
      break;
    case 'notification':
      icon = <AlertCircle className="h-3 w-3 mr-1" />;
      label = 'إشعار';
      variant = 'destructive';
      break;
    default:
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
      label = 'قرار';
      variant = 'default';
  }

  return (
    <Badge 
      variant={variant}
      className={cn(
        "flex items-center",
        size === 'xs' && "text-[0.65rem] px-1.5 py-0",
        size === 'sm' && "text-xs",
        size === 'lg' && "text-sm px-3 py-1",
        className
      )}
    >
      {icon}
      {label}
    </Badge>
  );
};
