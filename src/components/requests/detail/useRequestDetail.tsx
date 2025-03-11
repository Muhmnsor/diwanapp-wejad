
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

  // Simplified function to check if the current user is an approver for the current step
  const isCurrentApprover = () => {
    if (!data || !user) return false;
    
    console.log("التحقق من صلاحية المستخدم للموافقة على الطلب:", requestId);
    console.log("معرف المستخدم:", user.id);
    
    // Admin users are always treated as approvers
    if (user.isAdmin) {
      console.log("المستخدم مدير، لديه دائمًا صلاحية الاعتماد");
      return true;
    }
    
    // Check if the request doesn't have a current step
    if (!data.current_step || !data.current_step.id) {
      console.log("لا توجد خطوة حالية للطلب");
      return false;
    }
    
    // Approvals must exist
    if (!data.approvals || !Array.isArray(data.approvals)) {
      console.log("لا توجد سجلات موافقة للطلب");
      return false;
    }

    // Check for direct approvals where this user is the specific approver
    const isPendingDirectApprover = data.approvals.some(
      (approval: any) => 
        approval.approver?.id === user.id && 
        approval.status === "pending" &&
        approval.step?.id === data.current_step.id
    );
    
    if (isPendingDirectApprover) {
      console.log("المستخدم هو معتمد مباشر لهذا الطلب");
      return true;
    }
    
    // If the user has a role, check for role-based approvals
    if (user.role) {
      console.log("المستخدم له دور:", user.role);
      
      // Admin or app_admin roles always have approval rights
      if (user.role === 'admin' || user.role === 'app_admin') {
        console.log("المستخدم لديه دور إداري يمنحه صلاحية الموافقة");
        return true;
      }
      
      // Look for any role-based approvals that match the current step
      const isPendingRoleApprover = data.approvals.some(
        (approval: any) => 
          approval.assignment_type === 'role' &&
          approval.status === "pending" &&
          approval.step?.id === data.current_step.id
      );
      
      if (isPendingRoleApprover) {
        console.log("يوجد موافقة معلقة معتمدة على الدور الوظيفي");
        return true;
      }
    }
    
    console.log("المستخدم ليس له صلاحية للموافقة على هذا الطلب");
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
