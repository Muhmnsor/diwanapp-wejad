
import { RequestDetailsCard } from "./detail/RequestDetailsCard";
import { RequestWorkflowCard } from "./detail/RequestWorkflowCard";
import { RequestActionButtons } from "./detail/RequestActionButtons";
import { RequestApproveDialog } from "./detail/RequestApproveDialog";
import { RequestRejectDialog } from "./detail/RequestRejectDialog";
import { useRequestDetail } from "./detail/useRequestDetail";

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
    isCurrentApprover
  } = useRequestDetail(requestId);

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  if (error) {
    console.error("Error loading request details:", error);
    return <div>حدث خطأ أثناء تحميل تفاصيل الطلب: {error.message}</div>;
  }

  if (!data || !data.request) {
    return <div>لم يتم العثور على الطلب</div>;
  }

  const request = data.request;
  const requestType = data.request_type;
  const workflow = data.workflow;
  const currentStep = data.current_step;
  const approvals = data.approvals || [];
  const attachments = data.attachments || [];

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">تفاصيل الطلب</h2>
          <RequestActionButtons 
            status={request.status}
            isCurrentApprover={isCurrentApprover()}
            onApprove={handleApproveClick}
            onReject={handleRejectClick}
            onClose={onClose}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RequestDetailsCard 
              request={request}
              requestType={requestType}
              approvals={approvals}
              attachments={attachments}
            />
          </div>

          <div className="lg:col-span-1">
            <RequestWorkflowCard 
              workflow={workflow}
              currentStep={currentStep}
            />
          </div>
        </div>
      </div>

      <RequestApproveDialog
        requestId={requestId}
        stepId={request.current_step_id}
        isOpen={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
      />

      <RequestRejectDialog
        requestId={requestId}
        stepId={request.current_step_id}
        isOpen={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
      />
    </>
  );
};
