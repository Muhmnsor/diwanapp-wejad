
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCcw } from "lucide-react";
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
    canApprove,
    refetch
  } = useRequestDetail(requestId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent align-middle" />
          <p className="mt-2">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>حدث خطأ أثناء تحميل تفاصيل الطلب</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>{error.message || "لم نتمكن من تحميل البيانات، يرجى المحاولة مرة أخرى."}</p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              إعادة المحاولة
            </Button>
            <Button variant="default" size="sm" onClick={onClose}>
              العودة
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!data || !data.request) {
    return (
      <Alert>
        <AlertTitle>لم يتم العثور على الطلب</AlertTitle>
        <AlertDescription>
          <p>لم نتمكن من العثور على بيانات الطلب المطلوب.</p>
          <Button className="mt-4" onClick={onClose}>العودة</Button>
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

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">تفاصيل الطلب</h2>
          <RequestActionButtons 
            status={request.status}
            onApprove={handleApproveClick}
            onReject={handleRejectClick}
            onClose={onClose}
            canApprove={canApprove}
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
