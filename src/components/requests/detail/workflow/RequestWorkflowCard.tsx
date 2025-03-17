
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, CheckCircle, XCircle, HelpCircle, Clock } from "lucide-react";
import { useWorkflowCardData } from "./useWorkflowCardData";
import { WorkflowStepItem } from "./WorkflowStepItem";
import { WorkflowStep } from "../../types";

interface RequestWorkflowCardProps {
  workflow: any;
  currentStep: any;
  requestId: string;
  requestStatus?: string;
  workflowSteps?: WorkflowStep[];
}

export const RequestWorkflowCard = ({ 
  workflow, 
  currentStep, 
  requestId,
  requestStatus = 'pending',
  workflowSteps = []
}: RequestWorkflowCardProps) => {
  const { 
    isLoading, 
    error, 
    progressPercentage, 
    currentStepIndex 
  } = useWorkflowCardData(workflow?.id, requestId, currentStep?.id);

  if (error) {
    return (
      <Card dir="rtl">
        <CardHeader>
          <CardTitle>سير العمل</CardTitle>
          <CardDescription>حدث خطأ أثناء تحميل معلومات سير العمل</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-500">
            {error.message || "خطأ غير معروف"}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort steps by step_order
  const sortedSteps = [...workflowSteps].sort((a, b) => 
    (a.step_order || 0) - (b.step_order || 0)
  );

  // Group steps by step_order for parallel processing visualization
  const stepsGroupedByOrder = sortedSteps.reduce((acc, step) => {
    const order = step.step_order || 0;
    if (!acc[order]) {
      acc[order] = [];
    }
    acc[order].push(step);
    return acc;
  }, {} as Record<number, WorkflowStep[]>);

  // Helper function to determine step status
  const determineStepStatus = (step: WorkflowStep) => {
    // Current step
    if (currentStep && step.id === currentStep.id) {
      return 'current';
    }
    
    // Using step_order for completion logic
    if (currentStep && step.step_order && currentStep.step_order && step.step_order < currentStep.step_order) {
      return 'completed';
    }
    
    // For completed requests, all steps are considered completed
    if (requestStatus === 'completed') {
      return 'completed';
    }
    
    // For rejected requests
    if (requestStatus === 'rejected') {
      // If this was the current step when rejected
      if (currentStep && step.id === currentStep.id) {
        return 'rejected';
      }
      // Steps before the rejection
      if (currentStep && step.step_order && currentStep.step_order && step.step_order < currentStep.step_order) {
        return 'completed';
      }
    }
    
    // Future steps
    return 'pending';
  };

  return (
    <Card dir="rtl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>سير العمل</CardTitle>
            <CardDescription>خطوات الموافقة على الطلب</CardDescription>
          </div>
          
          <StatusBadge status={requestStatus} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary ml-2" />
            <span>جاري تحميل خطوات سير العمل...</span>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>نسبة اكتمال الطلب</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            <div className="space-y-6 mt-6">
              {Object.entries(stepsGroupedByOrder).map(([orderStr, steps]) => {
                const order = parseInt(orderStr);
                return (
                  <div key={`order-${order}`} className="border-b pb-4 last:border-b-0">
                    <div className="font-medium text-sm text-muted-foreground mb-2">
                      {order === 1 ? 'الخطوة الأولى' : `الخطوة رقم ${order}`}
                      {steps.length > 1 && ` (${steps.length} مشاركين)`}
                    </div>
                    
                    <div className="space-y-2">
                      {steps.map((step) => (
                        <WorkflowStepItem
                          key={step.id}
                          step={step}
                          status={determineStepStatus(step)}
                          isCurrent={currentStep?.id === step.id}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {sortedSteps.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  لا توجد خطوات محددة لمسار سير العمل
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper component for status badge
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-500 flex items-center">
          <Clock className="h-3 w-3 ml-1" />
          في انتظار البدء
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-500 flex items-center">
          <HelpCircle className="h-3 w-3 ml-1" />
          قيد المعالجة
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="outline" className="border-green-500 text-green-500 flex items-center">
          <CheckCircle className="h-3 w-3 ml-1" />
          مكتمل
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="outline" className="border-red-500 text-red-500 flex items-center">
          <XCircle className="h-3 w-3 ml-1" />
          مرفوض
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {status}
        </Badge>
      );
  }
};
