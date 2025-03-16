
import React from 'react';
import { CircleDashed, Clock, CheckCircle2, MessageSquareQuote } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { WorkflowStatusBadge } from "./WorkflowStatusBadge";

interface CurrentStepDisplayProps {
  currentStep: any;
  requestStatus: string;
  isLoading: boolean;
}

export const CurrentStepDisplay: React.FC<CurrentStepDisplayProps> = ({ 
  currentStep, 
  requestStatus,
  isLoading
}) => {
  if (isLoading) {
    return <Skeleton className="h-16 w-full" />;
  }
  
  if (requestStatus === 'completed') {
    return (
      <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
        <div>
          <p className="text-green-800 font-medium">تم إكمال سير العمل</p>
          <p className="text-sm text-green-700">تمت معالجة الطلب بنجاح</p>
        </div>
      </div>
    );
  }

  if (!currentStep || !currentStep.id) {
    return (
      <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
        <Clock className="h-4 w-4" />
        <span className="mr-2">لا توجد خطوة حالية</span>
      </Alert>
    );
  }
  
  const isOpinionStep = currentStep.step_type === 'opinion';
  
  // Display current step info without approver info
  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-center gap-2">
        {isOpinionStep ? (
          <MessageSquareQuote className="h-5 w-5 text-blue-500 flex-shrink-0" />
        ) : (
          <Clock className="h-5 w-5 text-blue-500 flex-shrink-0" /> 
        )}
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <p className="text-blue-800 font-medium">{currentStep.step_name}</p>
            {currentStep.step_type && (
              <WorkflowStatusBadge status={currentStep.step_type} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
