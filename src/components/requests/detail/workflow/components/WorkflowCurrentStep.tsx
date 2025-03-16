
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Clock, MessageSquareQuote, XCircle } from "lucide-react";
import { WorkflowStep } from "../../../types";

interface WorkflowCurrentStepProps {
  currentStep: WorkflowStep | null;
  requestStatus: 'pending' | 'in_progress' | 'completed' | 'rejected';
  isLoading: boolean;
}

export const WorkflowCurrentStep: React.FC<WorkflowCurrentStepProps> = ({
  currentStep,
  requestStatus,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium">الخطوة الحالية</h4>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  let statusIcon = <Clock className="h-5 w-5 text-blue-500" />;
  let statusTitle = "قيد الإجراء";
  let statusClass = "text-blue-500";
  
  if (requestStatus === 'completed') {
    statusIcon = <CheckCircle className="h-5 w-5 text-green-500" />;
    statusTitle = "مكتمل";
    statusClass = "text-green-500";
  } else if (requestStatus === 'rejected') {
    statusIcon = <XCircle className="h-5 w-5 text-red-500" />;
    statusTitle = "مرفوض";
    statusClass = "text-red-500";
  } else if (currentStep?.step_type === 'opinion') {
    statusIcon = <MessageSquareQuote className="h-5 w-5 text-blue-500" />;
    statusTitle = "بانتظار إبداء الرأي";
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">الخطوة الحالية</h4>
      {!currentStep && requestStatus !== 'completed' && requestStatus !== 'rejected' ? (
        <div className="text-sm text-muted-foreground py-1">
          لا توجد خطوة حالية محددة
        </div>
      ) : (
        <div className="flex items-start">
          <div className="mr-0 ml-2 pt-0.5">{statusIcon}</div>
          <div>
            <p className={`text-sm font-medium ${statusClass}`}>
              {currentStep?.step_name || statusTitle}
            </p>
            {currentStep && (
              <p className="text-xs text-muted-foreground">
                {currentStep.step_type === 'opinion' 
                  ? 'مرحلة إبداء الرأي' 
                  : currentStep.approver_id 
                    ? 'بانتظار الموافقة' 
                    : 'غير محدد'}
              </p>
            )}
            {currentStep?.instructions && (
              <p className="text-xs mt-1 text-muted-foreground">
                {currentStep.instructions}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
