
import { Loader2 } from "lucide-react";
import { RequestDetailsCard } from "./detail/RequestDetailsCard";
import { RequestWorkflowCard } from "./detail/workflow/RequestWorkflowCard";
import { RequestActionButtons } from "./detail/RequestActionButtons";
import { RequestApproveDialog } from "./detail/RequestApproveDialog";
import { RequestRejectDialog } from "./detail/RequestRejectDialog";
import { useRequestDetail } from "./detail/useRequestDetail";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
    hasSubmittedOpinion
  } = useRequestDetail(requestId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin text-primary ml-2" />
        <span>جاري تحميل تفاصيل الطلب...</span>
      </div>
    );
  }

  if (error) {
    console.error("Error loading request details:", error);
    return (
      <Alert variant="destructive" dir="rtl">
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
      <Alert dir="rtl">
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

  // Add requester info to the request object for easier access
  const enhancedRequest = {
    ...request,
    requester: requester
  };

  // Debug info for workflow data
  console.log("Request workflow data:", workflow);
  console.log("Current step data:", currentStep);
  console.log("Requester data:", requester);
  console.log("Step type:", stepType);
  console.log("Has submitted opinion:", hasSubmittedOpinion ? "Yes" : "No");

  return (
    <>
      <div className="space-y-6" dir="rtl">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">تفاصيل الطلب</h2>
          <RequestActionButtons 
            status={request.status}
            isCurrentApprover={isCurrentApprover()}
            stepType={stepType}
            hasSubmittedOpinion={hasSubmittedOpinion()}
            onApprove={handleApproveClick}
            onReject={handleRejectClick}
            onClose={onClose}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RequestDetailsCard 
              request={enhancedRequest}
              requestType={requestType}
              approvals={approvals}
              attachments={attachments}
            />
          </div>

          <div className="lg:col-span-1">
            <RequestWorkflowCard 
              workflow={workflow}
              currentStep={currentStep}
              requestId={requestId}
            />
          </div>
        </div>
      </div>

      <RequestApproveDialog
        requestId={requestId}
        stepId={request.current_step_id}
        stepType={stepType}
        requesterId={request.requester_id}
        isOpen={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
      />

      <RequestRejectDialog
        requestId={requestId}
        stepId={request.current_step_id}
        stepType={stepType}
        requesterId={request.requester_id}
        isOpen={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
      />
    </>
  );
};
