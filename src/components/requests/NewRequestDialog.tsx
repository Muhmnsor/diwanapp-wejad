
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RequestType } from "./types";
import { DynamicForm } from "./DynamicForm";
import { useAuthStore } from "@/store/authStore";
import { RequestBasicInfoForm, RequestBasicInfo } from "./dialogs/RequestBasicInfoForm";
import { RequestError } from "./dialogs/RequestError";
import { RequestSubmitLoader } from "./dialogs/RequestSubmitLoader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

interface NewRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requestType: RequestType;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
  submissionSuccess?: boolean;
  error?: string | null;
}

export const NewRequestDialog = ({
  isOpen,
  onClose,
  requestType,
  onSubmit,
  isSubmitting = false,
  isUploading = false,
  uploadProgress = 0,
  submissionSuccess = false,
  error = null
}: NewRequestDialogProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<{
    title: string;
    priority: string;
    form_data?: Record<string, any>;
  }>({
    title: "",
    priority: "medium",
  });

  // Clear internal error when external error changes
  useEffect(() => {
    if (error) {
      setInternalError(error);
    }
  }, [error]);

  useEffect(() => {
    // Reset state when dialog opens
    if (isOpen) {
      setStep(1);
      setInternalError(null);
    }
  }, [isOpen]);

  const handleStep1Submit = (data: RequestBasicInfo) => {
    if (!isAuthenticated || !user) {
      setInternalError("يجب تسجيل الدخول لإنشاء طلب جديد");
      return;
    }
    
    setRequestData({
      ...requestData,
      title: data.title,
      priority: data.priority,
    });
    setStep(2);
    setInternalError(null);
  };

  const handleStep2Submit = (formData: Record<string, any>) => {
    try {
      if (!isAuthenticated || !user) {
        setInternalError("يجب تسجيل الدخول لإنشاء طلب جديد");
        return;
      }
      
      setInternalError(null);
      const fullData = {
        request_type_id: requestType.id,
        title: requestData.title,
        priority: requestData.priority,
        form_data: formData,
      };
      
      console.log("Submitting request with data:", fullData);
      onSubmit(fullData);
    } catch (err) {
      console.error("Error submitting request:", err);
      if (err instanceof Error) {
        setInternalError(err.message);
      } else {
        setInternalError("حدث خطأ أثناء إرسال الطلب");
      }
    }
  };

  const handleBack = () => {
    setStep(1);
    setInternalError(null);
  };

  const handleClose = () => {
    // Reset form and state when closing
    setRequestData({
      title: "",
      priority: "medium",
    });
    setStep(1);
    setInternalError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1
              ? "معلومات الطلب الأساسية"
              : `${requestType.name} - تفاصيل الطلب`}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "يرجى تقديم المعلومات الأساسية للطلب"
              : "يرجى تعبئة نموذج الطلب بالتفاصيل المطلوبة"}
          </DialogDescription>
        </DialogHeader>

        <RequestError error={internalError} />

        {submissionSuccess && (
          <Alert variant="success" className="my-4 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription>تم إرسال الطلب بنجاح وحفظه في قاعدة البيانات</AlertDescription>
          </Alert>
        )}

        {step === 1 ? (
          <RequestBasicInfoForm 
            onSubmit={handleStep1Submit} 
            initialValues={requestData}
          />
        ) : (
          <DynamicForm
            schema={requestType.form_schema}
            onSubmit={handleStep2Submit}
            onBack={handleBack}
            isSubmitting={isSubmitting || isUploading}
            showSuccess={submissionSuccess}
          />
        )}

        <RequestSubmitLoader 
          isSubmitting={isSubmitting} 
          isUploading={isUploading}
          progress={uploadProgress}
        />
      </DialogContent>
    </Dialog>
  );
};
