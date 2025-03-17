
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkflowCardData } from "./useWorkflowCardData";
import { WorkflowCardProps } from "./types";
import { WorkflowStepItem } from "./WorkflowStepItem";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CurrentStepDisplay } from "./CurrentStepDisplay";

export const RequestWorkflowCard = ({ workflow, currentStep, requestId, requestStatus }: WorkflowCardProps) => {
  const { 
    isLoading, 
    error, 
    workflowSteps, 
    currentStepIndex, 
    progressPercentage, 
    diagnoseWorkflow, 
    fixWorkflow,
    refreshWorkflowData
  } = useWorkflowCardData(workflow?.id, requestId, currentStep?.id);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>سير العمل</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }
  
  if (!workflow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>سير العمل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            لا يوجد مسار سير عمل مرتبط بهذا الطلب
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>سير العمل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 text-red-700 p-3 rounded-md">
            حدث خطأ أثناء تحميل بيانات سير العمل: {error.message}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="mt-2"
            onClick={() => refreshWorkflowData()}
          >
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">سير العمل</CardTitle>
          {workflow.name && (
            <span className="text-sm text-gray-500">{workflow.name}</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {currentStep && (
          <CurrentStepDisplay 
            currentStep={currentStep} 
            requestStatus={requestStatus}
            isLoading={isLoading}
          />
        )}
        
        <div className="mt-4 mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>التقدم</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} />
        </div>
        
        <div className="mt-6">
          <div className="text-sm font-medium mb-2">خطوات سير العمل:</div>
          <div className="mt-3">
            {workflowSteps.map((step, index) => (
              <WorkflowStepItem
                key={step.id}
                step={step}
                isCurrent={index === currentStepIndex}
                isCompleted={index < currentStepIndex || (requestStatus === 'completed')}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
