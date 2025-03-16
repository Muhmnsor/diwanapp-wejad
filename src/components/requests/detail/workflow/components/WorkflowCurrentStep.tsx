
import React from 'react';
import { Clock, MessageSquareQuote, CheckCircle2, XCircle } from "lucide-react";
import { WorkflowStep } from '../../../types';

interface WorkflowCurrentStepProps {
  currentStep: WorkflowStep | null;
  requestStatus: string;
  isLoading: boolean;
}

export const WorkflowCurrentStep: React.FC<WorkflowCurrentStepProps> = ({
  currentStep,
  requestStatus,
  isLoading
}) => {
  if (isLoading || !currentStep) {
    return (
      <div className="text-sm text-muted-foreground">
        {isLoading ? 'جاري تحميل مرحلة العمل الحالية...' : 'لا توجد مرحلة حالية'}
      </div>
    );
  }

  // Determine if this is an opinion step
  const isOpinionStep = currentStep.step_type === 'opinion';
  
  // Set the status icon and color based on request status and step type
  let StatusIcon = Clock;
  let statusColor = "text-blue-500";
  let statusText = isOpinionStep ? 'إبداء رأي مطلوب' : 'موافقة مطلوبة';
  
  if (requestStatus === 'completed') {
    StatusIcon = CheckCircle2;
    statusColor = "text-green-500";
    statusText = isOpinionStep ? 'تم إبداء الرأي' : 'تمت الموافقة';
  } else if (requestStatus === 'rejected') {
    StatusIcon = XCircle;
    statusColor = "text-red-500";
    statusText = 'تم رفض الطلب';
  } else if (isOpinionStep) {
    StatusIcon = MessageSquareQuote;
  }

  return (
    <div className="p-3 bg-muted/30 rounded-md flex items-start">
      <StatusIcon className={`h-5 w-5 mt-0.5 ml-2 ${statusColor}`} />
      <div>
        <p className="text-sm font-medium">
          {currentStep.step_name || 'الخطوة الحالية'}
        </p>
        <p className="text-xs text-muted-foreground">
          {statusText}
          {currentStep.approver_name && requestStatus === 'completed' && (
            <span className={isOpinionStep ? "text-blue-600" : "text-green-600"}>
              {isOpinionStep ? ' تم إبداء الرأي بواسطة: ' : ' تمت الموافقة بواسطة: '}
              {currentStep.approver_name}
            </span>
          )}
        </p>
        {currentStep.instructions && (
          <p className="text-xs mt-1 text-muted-foreground">
            {currentStep.instructions}
          </p>
        )}
      </div>
    </div>
  );
}
