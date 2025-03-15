
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowStatusBadge } from "./WorkflowStatusBadge";
import { CurrentStepDisplayProps } from "./types";
import { AlertCircle, User } from "lucide-react";

export const CurrentStepDisplay: React.FC<CurrentStepDisplayProps> = ({ 
  currentStep,
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

  if (!currentStep) {
    return (
      <div className="text-center p-4 border rounded-md border-dashed">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          لا توجد خطوة حالية أو تم اكتمال سير العمل
        </p>
      </div>
    );
  }

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
          
          <div className="flex items-center text-sm space-x-1 space-x-reverse mt-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">المعتمد:</span>
            <span className="text-muted-foreground">
              {currentStep.approver_type === 'user' 
                ? 'مستخدم محدد' 
                : currentStep.approver_type === 'role' 
                ? 'مجموعة معتمدين' 
                : 'غير محدد'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
