
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowStatusBadge } from "./WorkflowStatusBadge";
import { CurrentStepDisplayProps } from "./types";
import { CheckCircle, AlertCircle, User, Clock } from "lucide-react";

export const CurrentStepDisplay: React.FC<CurrentStepDisplayProps> = ({ 
  currentStep,
  requestStatus,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  // For completed requests, show a completion message regardless of currentStep
  if (requestStatus === 'completed' || !currentStep) {
    return (
      <div className="text-center p-4 border rounded-md border-dashed">
        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
        <p className="text-green-600 font-medium">
          تم اكتمال جميع خطوات سير العمل
        </p>
      </div>
    );
  }

  // Determine the appropriate label based on step_type
  const getResponsibilityLabel = (stepType: string | undefined) => {
    switch (stepType) {
      case 'opinion':
        return 'المسؤول عن إبداء الرأي';
      case 'review':
        return 'المسؤول عن المراجعة';
      case 'decision':
        return 'المسؤول عن القرار';
      default:
        return 'المسؤول عن الموافقة';
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">الخطوة الحالية</h4>
          {currentStep.step_type && (
            <WorkflowStatusBadge status={currentStep.step_type} />
          )}
        </div>

        <div className="bg-muted/50 p-3 rounded-md">
          <h3 className="font-semibold mb-1">{currentStep.step_name}</h3>
          
          {currentStep.instructions && (
            <p className="text-sm text-muted-foreground mb-2">
              {currentStep.instructions}
            </p>
          )}
          
          <div className="flex flex-col space-y-1 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>
                {getResponsibilityLabel(currentStep.step_type)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
