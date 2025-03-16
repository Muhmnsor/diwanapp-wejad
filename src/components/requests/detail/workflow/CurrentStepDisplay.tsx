
import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Flag, 
  AlertCircle,
  Loader2,
  MessageSquareQuote
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CurrentStepDisplayProps {
  currentStep: any;
  requestStatus: string;
  isLoading: boolean;
}

export const CurrentStepDisplay: React.FC<CurrentStepDisplayProps> = ({ 
  currentStep, 
  requestStatus,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <Skeleton className="h-6 w-6 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!currentStep || !currentStep.id) {
    if (requestStatus === 'completed') {
      return (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <div>
            <p className="font-medium">تم اكتمال جميع الخطوات</p>
            <p className="text-sm text-muted-foreground">تم استكمال سير العمل بنجاح</p>
          </div>
        </div>
      );
    }
    
    if (requestStatus === 'rejected') {
      return (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <XCircle className="h-6 w-6 text-red-500" />
          <div>
            <p className="font-medium">تم رفض الطلب</p>
            <p className="text-sm text-muted-foreground">لا يوجد خطوات إضافية</p>
          </div>
        </div>
      );
    }
    
    if (requestStatus === 'canceled') {
      return (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Flag className="h-6 w-6 text-orange-500" />
          <div>
            <p className="font-medium">تم إلغاء الطلب</p>
            <p className="text-sm text-muted-foreground">تم إلغاء سير العمل</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <AlertCircle className="h-6 w-6 text-yellow-500" />
        <div>
          <p className="font-medium">لا توجد خطوة حالية</p>
          <p className="text-sm text-muted-foreground">
            قد يكون هناك خطأ في تكوين سير العمل
          </p>
        </div>
      </div>
    );
  }

  // Check if this is an opinion step
  const isOpinionStep = currentStep.step_type === 'opinion';
  
  return (
    <div className="flex items-center space-x-3 rtl:space-x-reverse">
      {isOpinionStep ? (
        <MessageSquareQuote className="h-6 w-6 text-blue-500" />
      ) : (
        <Clock className="h-6 w-6 text-blue-500" />
      )}
      <div>
        <p className="font-medium">
          {currentStep.step_name}
        </p>
        <p className="text-sm text-muted-foreground">
          {isOpinionStep 
            ? 'مرحلة إبداء الرأي' 
            : 'في انتظار المراجعة'}
        </p>
      </div>
    </div>
  );
};
