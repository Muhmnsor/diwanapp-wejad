
import { AlertCircle, Check, X, MessageCircle, Loader2 } from "lucide-react";
import { CurrentStepDisplayProps } from "./types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RequestStatus } from "@/types/meeting";

export const CurrentStepDisplay = ({ 
  currentStep, 
  requestStatus,
  isLoading
}: CurrentStepDisplayProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-2">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400 mr-2" />
        <span className="text-sm text-gray-500">جاري تحميل معلومات الخطوة الحالية...</span>
      </div>
    );
  }
  
  if (requestStatus === "completed") {
    return (
      <Alert className="bg-green-50 border-green-200 text-green-800">
        <Check className="h-4 w-4 text-green-600" />
        <AlertTitle>مكتمل</AlertTitle>
        <AlertDescription>تم إكمال هذا الطلب بنجاح</AlertDescription>
      </Alert>
    );
  }
  
  if (requestStatus === "rejected") {
    return (
      <Alert className="bg-red-50 border-red-200 text-red-800">
        <X className="h-4 w-4 text-red-600" />
        <AlertTitle>مرفوض</AlertTitle>
        <AlertDescription>تم رفض هذا الطلب</AlertDescription>
      </Alert>
    );
  }
  
  if (requestStatus === "cancelled") {
    return (
      <Alert className="bg-gray-50 border-gray-200 text-gray-800">
        <X className="h-4 w-4 text-gray-600" />
        <AlertTitle>ملغي</AlertTitle>
        <AlertDescription>تم إلغاء هذا الطلب</AlertDescription>
      </Alert>
    );
  }
  
  if (!currentStep) {
    return (
      <Alert className="bg-amber-50 border-amber-200 text-amber-800">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle>غير محدد</AlertTitle>
        <AlertDescription>لا توجد خطوة حالية محددة لهذا الطلب</AlertDescription>
      </Alert>
    );
  }
  
  // Handle opinion steps differently
  if (currentStep.step_type === 'opinion') {
    return (
      <Alert className="bg-blue-50 border-blue-200 text-blue-800">
        <MessageCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle>خطوة إبداء رأي: {currentStep.step_name}</AlertTitle>
        <AlertDescription>
          هذه خطوة لجمع الآراء وليست إلزامية لاستمرار سير العمل
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert className="bg-amber-50 border-amber-200 text-amber-800">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle>في انتظار الموافقة</AlertTitle>
      <AlertDescription>
        الخطوة الحالية: {currentStep.step_name || "خطوة غير مسماة"}
      </AlertDescription>
    </Alert>
  );
};
