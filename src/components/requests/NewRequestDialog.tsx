
import { useState } from "react";
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
import { RequestBasicInfoForm, RequestBasicInfo, formSchema } from "./dialogs/RequestBasicInfoForm";
import { RequestError } from "./dialogs/RequestError";
import { RequestSubmitLoader } from "./dialogs/RequestSubmitLoader";

interface NewRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requestType: RequestType;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  isUploading?: boolean;
  submissionSuccess?: boolean;
}

export const NewRequestDialog = ({
  isOpen,
  onClose,
  requestType,
  onSubmit,
  isSubmitting = false,
  isUploading = false,
  submissionSuccess = false
}: NewRequestDialogProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<{
    title: string;
    priority: string;
    form_data?: Record<string, any>;
  }>({
    title: "",
    priority: "medium",
  });

  const handleStep1Submit = (data: RequestBasicInfo) => {
    if (!isAuthenticated || !user) {
      setError("يجب تسجيل الدخول لإنشاء طلب جديد");
      return;
    }
    
    setRequestData({
      ...requestData,
      title: data.title,
      priority: data.priority,
    });
    setStep(2);
  };

  const handleStep2Submit = (formData: Record<string, any>) => {
    try {
      if (!isAuthenticated || !user) {
        setError("يجب تسجيل الدخول لإنشاء طلب جديد");
        return;
      }
      
      setError(null);
      const fullData = {
        request_type_id: requestType.id,
        title: requestData.title,
        priority: requestData.priority,
        form_data: formData,
      };
      onSubmit(fullData);
    } catch (err) {
      console.error("Error submitting request:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("حدث خطأ أثناء إرسال الطلب");
      }
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleClose = () => {
    // Reset form and state when closing
    setRequestData({
      title: "",
      priority: "medium",
    });
    setStep(1);
    setError(null);
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

        <RequestError error={error} />

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
        />
      </DialogContent>
    </Dialog>
  );
};
