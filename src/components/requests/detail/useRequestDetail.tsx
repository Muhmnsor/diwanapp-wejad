
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { toast } from "sonner";

export const useRequestDetail = (requestId: string) => {
  const { user } = useAuthStore();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
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

  // Significantly simplified function to check if the current user is an approver
  const isCurrentApprover = () => {
    if (!data || !user) {
      console.log("لا تتوفر بيانات كافية للتحقق من صلاحية المعتمد");
      return false;
    }
    
    console.log("التحقق من صلاحية الموافقة للمستخدم:", user.id);
    
    // Admin users always have approval rights
    if (user.isAdmin) {
      console.log("المستخدم مدير، لديه صلاحية الاعتماد");
      return true;
    }

    // If the request has no current step, it cannot be approved
    if (!data.current_step || !data.current_step.id) {
      console.log("لا توجد خطوة حالية للطلب");
      return false;
    }
    
    // Direct approach: check if user is the requester (can't approve their own request)
    if (data.request?.requester_id === user.id) {
      console.log("المستخدم هو مقدم الطلب، لا يمكنه الموافقة عليه");
      return false;
    }
    
    // Check if user has a direct approval record for the current step
    const hasDirectApproval = data.approvals?.some(
      (approval: any) => 
        approval.approver?.id === user.id && 
        approval.status === "pending" &&
        approval.step?.id === data.current_step.id
    );
    
    if (hasDirectApproval) {
      console.log("المستخدم له سجل موافقة مباشر للخطوة الحالية");
      return true;
    }
    
    // Check if user has a role-based approval record
    const hasRoleApproval = user.role && data.approvals?.some(
      (approval: any) => 
        approval.assignment_type === 'role' &&
        approval.status === "pending" &&
        approval.step?.id === data.current_step.id
    );
    
    if (hasRoleApproval) {
      console.log("المستخدم له صلاحية موافقة معتمدة على الدور الوظيفي");
      return true;
    }
    
    console.log("المستخدم ليس له صلاحية الموافقة على الطلب");
    return false;
  };

  const handleApproveClick = () => {
    setIsApproveDialogOpen(true);
  };

  const handleRejectClick = () => {
    setIsRejectDialogOpen(true);
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    isApproveDialogOpen,
    setIsApproveDialogOpen,
    isRejectDialogOpen,
    setIsRejectDialogOpen,
    handleApproveClick,
    handleRejectClick,
    isCurrentApprover,
    user
  };
};
