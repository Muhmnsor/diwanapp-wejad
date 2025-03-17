
import { Loader2 } from "lucide-react";
import { RequestDetailsCard } from "./RequestDetailsCard";
import { RequestWorkflowCard } from "./workflow/RequestWorkflowCard";
import { RequestActionButtons } from "./RequestActionButtons";
import { RequestApproveDialog } from "./RequestApproveDialog";
import { RequestRejectDialog } from "./RequestRejectDialog";
import { useRequestDetail } from "./useRequestDetail";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { DiagnoseWorkflowButton } from "./workflow/DiagnoseWorkflowButton";

interface RequestDetailProps {
  requestId: string;
  onClose: () => void;
}

export const RequestDetail = ({ requestId, onClose }: RequestDetailProps) => {
  const {
    data,
    isLoading,
    error,
    isApproveDialogOpen,
    setIsApproveDialogOpen,
    isRejectDialogOpen,
    setIsRejectDialogOpen,
    handleApproveClick,
    handleRejectClick,
    isCurrentApprover,
    hasSubmittedOpinion,
    isRequester, // Now properly included in the component props
    refetch,
    isDiagnosing,
    diagnosticResult,
    handleDiagnoseWorkflow,
    handleFixWorkflow
  } = useRequestDetail(requestId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل تفاصيل الطلب...</span>
      </div>
    );
  }

  if (error) {
    console.error("Error loading request details:", error);
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل تفاصيل الطلب: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data || !data.request) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>لم يتم العثور على الطلب</AlertTitle>
        <AlertDescription>
          لم يتم العثور على تفاصيل الطلب. قد يكون الطلب محذوفاً أو ليس لديك صلاحية الوصول إليه.
        </AlertDescription>
      </Alert>
    );
  }

  const request = data.request;
  const requestType = data.request_type;
  const workflow = data.workflow;
  const currentStep = data.current_step;
  const approvals = data.approvals || [];
  const attachments = data.attachments || [];
  const requester = data.requester;
  const stepType = currentStep?.step_type || "decision";
  const workflowSteps = data.workflow_steps || [];

  const enhancedRequest = {
    ...request,
    requester: requester
  };

  console.log("Request workflow data:", workflow);
  console.log("Current step data:", currentStep);
  console.log("Workflow steps:", workflowSteps);
  console.log("Requester data:", requester);
  console.log("Step type:", stepType);
  console.log("Has submitted opinion:", hasSubmittedOpinion() ? "Yes" : "No");
  console.log("Is requester:", isRequester() ? "Yes" : "No");

  // Helper function to handle async refetch and convert to Promise<void>
  const handleRefetch = async () => {
    await refetch();
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">تفاصيل الطلب</h2>
          <div className="flex gap-2">
            <DiagnoseWorkflowButton 
              requestId={requestId}
              onDiagnose={handleDiagnoseWorkflow}
              onFix={handleFixWorkflow}
              onSuccess={handleRefetch}
              isDiagnosing={isDiagnosing}
              diagnosticResult={diagnosticResult}
              className="ml-2"
            />
            <RequestActionButtons 
              status={data.request.status}
              isCurrentApprover={isCurrentApprover()}
              stepType={data.current_step?.step_type || "decision"}
              hasSubmittedOpinion={hasSubmittedOpinion()}
              isRequester={isRequester()}
              onApprove={handleApproveClick}
              onReject={handleRejectClick}
              onClose={onClose}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RequestDetailsCard 
              request={{...data.request, requester: data.requester}}
              requestType={data.request_type}
              approvals={data.approvals || []}
              attachments={data.attachments || []}
            />
          </div>

          <div className="lg:col-span-1">
            <RequestWorkflowCard 
              workflow={data.workflow}
              currentStep={data.current_step}
              requestId={requestId}
              requestStatus={data.request.status}
              workflowSteps={data.workflow_steps || []}
            />
          </div>
        </div>
      </div>

      <RequestApproveDialog
        requestId={requestId}
        stepId={data.request.current_step_id}
        stepType={data.current_step?.step_type || "decision"}
        requesterId={data.request.requester_id}
        isOpen={isApproveDialogOpen}
        onOpenChange={(open) => {
          setIsApproveDialogOpen(open);
          if (!open) handleRefetch();
        }}
      />

      <RequestRejectDialog
        requestId={requestId}
        stepId={data.request.current_step_id}
        stepType={data.current_step?.step_type || "decision"}
        requesterId={data.request.requester_id}
        isOpen={isRejectDialogOpen}
        onOpenChange={(open) => {
          setIsRejectDialogOpen(open);
          if (!open) handleRefetch();
        }}
      />
    </>
  );
};
