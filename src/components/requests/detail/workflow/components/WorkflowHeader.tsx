
import React from 'react';
import { CardTitle } from "@/components/ui/card";

interface WorkflowHeaderProps {
  workflowName?: string;
  workflowDescription?: string;
}

export const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({ 
  workflowName, 
  workflowDescription 
}) => {
  return (
    <div>
      <CardTitle className="text-lg font-bold mb-1">مسار سير العمل</CardTitle>
      {workflowName && (
        <div className="text-sm text-muted-foreground">
          {workflowName}
          {workflowDescription && (
            <p className="mt-1 text-xs">{workflowDescription}</p>
          )}
        </div>
      )}
    </div>
  );
};
