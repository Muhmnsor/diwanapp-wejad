
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRequestDetails } from "@/features/requests/hooks/useRequestDetails";
import { RequestApproveDialog } from "./ApproveDialog";
import { RequestRejectDialog } from "./RejectDialog";
import { DetailsHeader } from "./DetailsHeader";
import { DetailsContent } from "./DetailsContent";

interface RequestDetailsProps {
  requestId: string;
  onClose: () => void;
}

export const RequestDetails = ({ requestId, onClose }: RequestDetailsProps) => {
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
  } = useRequestDetails(requestId);

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

  // Debug info for workflow data
  console.log("Request workflow data:", data.workflow);
  console.log("Current step data:", data.current_step);
  console.log("Requester data:", data.requester);

  return (
    <>
      <div className="space-y-6">
        <DetailsHeader 
          request={data.request}
          isCurrentApprover={isCurrentApprover()}
          onApprove={handleApproveClick}
          onReject={handleRejectClick}
          onClose={onClose}
        />

        <DetailsContent requestDetails={data} />
      </div>

      <RequestApproveDialog
        requestId={requestId}
        stepId={data.request.current_step_id}
        isOpen={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
      />

      <RequestRejectDialog
        requestId={requestId}
        stepId={data.request.current_step_id}
        isOpen={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
      />
    </>
  );
};
