
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { WorkflowStatusBadgeProps } from "./types";

export const WorkflowStatusBadge: React.FC<WorkflowStatusBadgeProps> = ({ status }) => {
  const getStatusBadgeVariant = () => {
    switch (status) {
      case 'decision':
        return 'default';
      case 'opinion':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'decision':
        return 'قرار';
      case 'opinion':
        return 'رأي';
      default:
        return status;
    }
  };

  return (
    <Badge variant={getStatusBadgeVariant()}>
      {getStatusLabel()}
    </Badge>
  );
};
