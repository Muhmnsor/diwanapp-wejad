
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { toast } from "sonner";

export const useRequestDetail = (requestId: string) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["request-details", requestId],
    queryFn: async () => {
      console.log("=== بدء جلب تفاصيل الطلب ===");
      console.log("معرف الطلب:", requestId);
      console.log("معلومات المستخدم:", user?.id, user?.email);
      console.log("نوع المستخدم:", user?.role || "غير محدد");
      console.log("هل المستخدم مدير:", user?.isAdmin ? "نعم" : "لا");
      
      try {
        const { data, error } = await supabase
          .rpc('get_request_details', { p_request_id: requestId });
        
        if (error) {
          console.error("خطأ في جلب تفاصيل الطلب:", error);
          console.error("رمز الخطأ:", error.code);
          console.error("رسالة الخطأ:", error.message);
          console.error("تفاصيل الخطأ:", error.details);
          
          // Check if this is an RLS policy issue
          if (error.code === 'PGRST301') {
            console.error("خطأ في سياسة RLS: ليس لديك صلاحية للوصول إلى هذا الطلب");
          }
          
          throw error;
        }
        
        console.log("تم جلب تفاصيل الطلب بنجاح:", data);
        
        // Add additional debug info
        if (!data.workflow || !data.workflow.id) {
          console.warn("بيانات سير العمل مفقودة أو غير مكتملة:", data.workflow);
        }
        
        if (!data.current_step || !data.current_step.id) {
          console.warn("بيانات الخطوة الحالية مفقودة أو غير مكتملة:", data.current_step);
        }
        
        if (!data.requester || !data.requester.display_name) {
          console.warn("بيانات مقدم الطلب مفقودة أو غير مكتملة:", data.requester);
        }

        // Detailed info about approvals
        if (data.approvals && data.approvals.length > 0) {
          console.log("عدد سجلات الموافقة:", data.approvals.length);
          console.log("تفاصيل أول سجل موافقة:", data.approvals[0]);
        } else {
          console.warn("لا توجد موافقات لهذا الطلب");
        }
        
        console.log("=== انتهاء جلب تفاصيل الطلب ===");
        return data;
      } catch (err) {
        console.error("استثناء غير متوقع في جلب تفاصيل الطلب:", err);
        toast.error("حدث خطأ أثناء تحميل تفاصيل الطلب");
        throw err;
      }
    },
    refetchOnWindowFocus: false
  });

  // Check if the current user is the approver for the current step
  const isCurrentApprover = () => {
    if (!data || !user) return false;
    
    console.log("التحقق من كون المستخدم هو المعتمد الحالي للطلب");
    console.log("معرف المستخدم:", user.id);
    
    const currentStep = data.current_step;
    if (!currentStep || !currentStep.id) {
      console.log("لا توجد خطوة حالية للطلب");
      return false;
    }
    
    console.log("معلومات الخطوة الحالية:", currentStep);
    
    // Get step type
    const stepType = currentStep.step_type || 'decision';
    console.log("نوع الخطوة:", stepType);
    
    // For opinion steps, always allow action
    if (stepType === 'opinion') {
      console.log("هذه خطوة رأي ويمكن للمستخدم إبداء رأيه");
      return true;
    }
    
    // Check for direct approval
    if (currentStep.approver_id === user.id) {
      console.log("المستخدم هو المعتمد المباشر للخطوة الحالية");
      return true;
    }
    
    // Check for role-based approval or admin override
    if (user.isAdmin) {
      console.log("المستخدم مدير ويمكنه الموافقة على الطلب");
      return true;
    }
    
    // Check for pending approvals assigned to this user
    const pendingApprovals = data.approvals?.filter(
      (approval: any) => 
        approval.step_id === currentStep.id && 
        approval.approver_id === user.id &&
        approval.status === "pending"
    );
    
    if (pendingApprovals && pendingApprovals.length > 0) {
      console.log("المستخدم لديه موافقات معلقة للخطوة الحالية");
      return true;
    }
    
    console.log("المستخدم ليس هو المعتمد للخطوة الحالية");
    return false;
  };

  const handleApproveClick = () => {
    if (!isCurrentApprover() && data?.current_step?.step_type !== 'opinion') {
      toast.error("ليس لديك الصلاحية للموافقة على هذا الطلب");
      return;
    }
    setIsApproveDialogOpen(true);
  };

  const handleRejectClick = () => {
    if (!isCurrentApprover() && data?.current_step?.step_type !== 'opinion') {
      toast.error("ليس لديك الصلاحية لرفض هذا الطلب");
      return;
    }
    setIsRejectDialogOpen(true);
  };

  return {
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
    user,
    queryClient
  };
};
