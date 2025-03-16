
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { WorkflowStatusBadgeProps } from "./types";

export const WorkflowStatusBadge: React.FC<WorkflowStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status.toLowerCase()) {
      case 'decision':
        return { variant: 'default', label: 'قرار' };
      case 'opinion':
        return { variant: 'secondary', label: 'رأي' };
      case 'approval':
        return { variant: 'success', label: 'اعتماد' };
      case 'review':
        return { variant: 'outline', label: 'مراجعة' };
      case 'completed':
        return { variant: 'success', label: 'مكتمل' };
      case 'pending':
        return { variant: 'outline', label: 'قيد الانتظار' };
      default:
        return { variant: 'outline', label: status };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant as any}>
      {config.label}
    </Badge>
  );
};
