import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { WorkflowCardProps } from "./types";
import { useWorkflowCardData } from "./useWorkflowCardData";

// Import the component modules
import { WorkflowHeader } from "./components/WorkflowHeader";
import { WorkflowProgress } from "./components/WorkflowProgress";
import { WorkflowCurrentStep } from "./components/WorkflowCurrentStep";
import { WorkflowStepsListComponent } from "./components/WorkflowStepsList";
import { WorkflowDiagnostics } from "./components/WorkflowDiagnostics";

export const RequestWorkflowCard: React.FC<WorkflowCardProps> = ({ 
  workflow, 
  currentStep,
  requestId,
  requestStatus = 'pending',
  permissions
}) => {
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  
  // Convert requestStatus to the expected type
  const normalizedStatus = (requestStatus || 'pending') as 'pending' | 'in_progress' | 'completed' | 'rejected';
  
  // Extract permission
  const canViewWorkflow = permissions?.canViewWorkflow !== false;
  
  const { 
    isLoading,
    error, 
    workflowSteps, 
    currentStepIndex,
    progressPercentage,
    diagnoseWorkflow,
    fixWorkflow,
    refreshWorkflowData,
    hasPermission
  } = useWorkflowCardData(
    requestId, 
    workflow, 
    currentStep, 
    normalizedStatus,
    { canViewWorkflow }
  );

  const handleDiagnoseWorkflow = async () => {
    setIsDiagnosing(true);
    try {
      const result = await diagnoseWorkflow();
      setDiagnosticResult(result);
      
      if (!result?.success) {
        toast.error("فشل تشخيص سير العمل: " + (result?.error || "خطأ غير معروف"));
      } else if (result.issues?.length === 0) {
        toast.success("لا توجد مشاكل في سير العمل");
      }
    } catch (error) {
      console.error("Error diagnosing workflow:", error);
      toast.error("حدث خطأ أثناء تشخيص سير العمل");
    } finally {
      setIsDiagnosing(false);
    }
  };
  
  const handleFixWorkflow = async () => {
    try {
      const result = await fixWorkflow();
      console.log("Fix workflow result:", result);
      
      if (result?.success) {
        toast.success("تم إصلاح سير العمل بنجاح");
        refreshWorkflowData();
        setDiagnosticResult(null);
      } else {
        toast.error("فشل إصلاح سير العمل: " + (result?.error || "خطأ غير معروف"));
      }
    } catch (error) {
      console.error("Error fixing workflow:", error);
      toast.error("حدث خطأ أثناء إصلاح سير العمل");
    }
  };

  // If there's an error, check if it's a permission issue
  if (error) {
    console.error("Error loading workflow data:", error);
    
    // Check if it's a permission error
    const errorMessage = error.message || '';
    const isPermissionError = errorMessage.includes('permission') || 
                             errorMessage.includes('صلاحية') || 
                             errorMessage.includes('not allowed') ||
                             !hasPermission;
    
    return (
      <Card>
        <CardHeader className="pb-3">
          <WorkflowHeader 
            workflowName="مسار سير العمل"
            workflowDescription={null}
          />
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            {isPermissionError ? <ShieldAlert className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>
              {isPermissionError
                ? "ليس لديك صلاحية الاطلاع على مسار سير العمل لهذا الطلب"
                : "حدث خطأ أثناء تحميل مسار العمل"
              }
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 text-xs opacity-70">{error.message}</div>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Determine if the workflow is completed
  const isWorkflowCompleted = normalizedStatus === 'completed' || (currentStepIndex === -1 && workflowSteps.length > 0);

  // If workflow or steps are missing, show appropriate message
  if (!workflow || !workflow.id) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <WorkflowHeader 
            workflowName="مسار سير العمل"
            workflowDescription={null}
          />
        </CardHeader>
        <CardContent>
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              لا يوجد مسار سير عمل معرف لهذا الطلب
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <WorkflowHeader 
          workflowName={workflow?.name}
          workflowDescription={workflow?.description}
        />
      </CardHeader>
      
      <CardContent className="pb-2 space-y-4">
        {/* Progress indicator with improved styling */}
        {workflowSteps.length > 0 && (
          <WorkflowProgress 
            progressPercentage={progressPercentage}
            isWorkflowCompleted={isWorkflowCompleted}
          />
        )}
        
        <Separator className="my-3" />
        
        {/* Current step display */}
        <WorkflowCurrentStep 
          currentStep={currentStep}
          requestStatus={normalizedStatus}
          isLoading={isLoading}
        />
        
        <Separator className="my-3" />
        
        {/* All workflow steps with clearer visualization */}
        <WorkflowStepsListComponent 
          steps={workflowSteps}
          currentStepIndex={currentStepIndex}
          isLoading={isLoading}
          requestStatus={normalizedStatus}
        />
      </CardContent>
      
      <CardFooter className="pt-0">
        <WorkflowDiagnostics 
          diagnosticResult={diagnosticResult}
          requestId={requestId}
          isDiagnosing={isDiagnosing}
          onDiagnose={handleDiagnoseWorkflow}
          onFix={handleFixWorkflow}
          onSuccess={refreshWorkflowData}
          error={error}
        />
      </CardFooter>
    </Card>
  );
};
