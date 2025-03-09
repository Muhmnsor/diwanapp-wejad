
import React from "react";
import { Separator } from "@/components/ui/separator";
import { WorkflowStep } from "../types";
import { WorkflowStepsConfig } from "../WorkflowStepsConfig";

interface WorkflowStepsSectionProps {
  createdRequestTypeId: string | null;
  workflowId: string | null;
  onWorkflowStepsUpdated: (steps: WorkflowStep[], workflowId: string | null) => void;
}

export const WorkflowStepsSection = ({ 
  createdRequestTypeId, 
  workflowId, 
  onWorkflowStepsUpdated 
}: WorkflowStepsSectionProps) => {
  return (
    <div>
      {createdRequestTypeId ? (
        <WorkflowStepsConfig 
          requestTypeId={createdRequestTypeId}
          workflowId={workflowId}
          onWorkflowStepsUpdated={onWorkflowStepsUpdated}
        />
      ) : (
        <div className="border border-dashed rounded-md p-6 text-center">
          <p className="text-muted-foreground">يمكنك إضافة خطوات سير العمل بعد حفظ نوع الطلب أولاً</p>
        </div>
      )}
    </div>
  );
};
