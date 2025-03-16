
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { toast } from "sonner";
import { fixRequestWorkflow, debugWorkflowStatus } from "./services/requestService";

// Define an interface for the return type of the hook
export interface RequestDetailHookResult {
  data: any;
  isLoading: boolean;
  error: Error | null;
  isApproveDialogOpen: boolean;
  setIsApproveDialogOpen: (open: boolean) => void;
  isRejectDialogOpen: boolean;
  setIsRejectDialogOpen: (open: boolean) => void;
  handleApproveClick: () => void;
  handleRejectClick: () => void;
  isCurrentApprover: () => boolean;
  hasSubmittedOpinion: () => boolean;
  isRequester: () => boolean;
  user: any;
  queryClient: any;
  refetch: () => Promise<any>;
  isDiagnosing: boolean;
  diagnosticResult: any;
  handleDiagnoseWorkflow: () => Promise<any>;
  handleFixWorkflow: () => Promise<any>;
}

export const useRequestDetail = (requestId: string): RequestDetailHookResult => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);

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
          
          if (error.code === 'PGRST301') {
            console.error("خطأ في سياسة RLS: ليس لديك صلاحية للوصول إلى هذا الطلب");
          }
          
          throw error;
        }
        
        console.log("تم جلب تفاصيل الطلب بنجاح:", data);
        
        if (!data.workflow || !data.workflow.id) {
          console.warn("بيانات سير العمل مفقودة أو غير مكتملة:", data.workflow);
        }
        
        if (!data.current_step || !data.current_step.id) {
          console.warn("بيانات الخطوة الحالية مفقودة أو غير مكتملة:", data.current_step);
        }
        
        if (!data.requester || !data.requester.display_name) {
          console.warn("بيانات مقدم الطلب مفقودة أو غير مكتملة:", data.requester);
        }

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

  const isRequester = () => {
    if (!data || !user || !data.request) return false;
    
    console.log("التحقق من كون المستخدم هو مقدم الطلب");
    console.log("معرف المستخدم:", user.id);
    console.log("معرف مقدم الطلب:", data.request.requester_id);
    
    return user.id === data.request.requester_id;
  };
  
  const isCurrentApprover = () => {
    if (!data || !user || !data.current_step) return false;
    
    console.log("التحقق من كون المستخدم هو المعتمد الحالي للطلب");
    console.log("معرف المستخدم:", user.id);
    
    const currentStep = data.current_step;
    if (!currentStep || !currentStep.id) {
      console.log("لا توجد خطوة حالية للطلب");
      return false;
    }
    
    console.log("معلومات الخطوة الحالية:", currentStep);
    
    const stepType = currentStep.step_type || 'decision';
    console.log("نوع الخطوة:", stepType);
    
    if (stepType === 'opinion') {
      console.log("هذه خطوة رأي ويمكن لأي مستخدم إبداء رأيه");
      
      const hasAlreadySubmitted = data.approvals?.some(
        (approval: any) => 
          approval.step_id === currentStep.id && 
          approval.approver_id === user.id
      );
      
      if (hasAlreadySubmitted) {
        console.log("المستخدم قام بالفعل بإبداء رأيه على هذه الخطوة");
        return false;
      }
      
      return true;
    }
    
    if (data.current_step.id && user.id === data.current_step.approver_id) {
      console.log("المستخدم هو المعتمد المباشر للخطوة الحالية");
      return true;
    }
    
    if (user.isAdmin) {
      console.log("المستخدم مدير ويمكنه الموافقة على الطلب");
      return true;
    }
    
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

  const hasSubmittedOpinion = () => {
    if (!data || !user || !data.current_step) return false;
    
    const currentStep = data.current_step;
    if (!currentStep || !currentStep.id) return false;
    
    const stepType = currentStep.step_type || 'decision';
    
    if (stepType !== 'opinion') return false;
    
    const approvals = data.approvals || [];
    console.log("Checking if user has submitted opinion:", {
      userId: user.id,
      stepId: currentStep.id,
      approvals: approvals.filter(a => a.step_id === currentStep.id)
    });
    
    const hasSubmitted = approvals.some(
      (approval: any) => 
        approval.step_id === currentStep.id && 
        approval.approver_id === user.id
    );
    
    console.log("User has submitted opinion:", hasSubmitted);
    return hasSubmitted;
  };

  const handleApproveClick = () => {
    if (!isCurrentApprover() && data?.current_step?.step_type !== 'opinion') {
      toast.error("ليس لديك الصلاحية للموافقة على هذا الطلب");
      return;
    }
    
    if (data?.current_step?.step_type === 'opinion') {
      if (hasSubmittedOpinion()) {
        toast.error("لقد قمت بالفعل بإبداء رأيك على هذه الخطوة");
        return;
      }
      
      if (isRequester()) {
        toast.error("لا يمكنك إبداء رأي على طلبك الخاص");
        return;
      }
    }
    
    setIsApproveDialogOpen(true);
  };

  const handleRejectClick = () => {
    if (!isCurrentApprover() && data?.current_step?.step_type !== 'opinion') {
      toast.error("ليس لديك الصلاحية لرفض هذا الطلب");
      return;
    }
    
    if (data?.current_step?.step_type === 'opinion') {
      if (hasSubmittedOpinion()) {
        toast.error("لقد قمت بالفعل بإبداء رأيك على هذه الخطوة");
        return;
      }
      
      if (isRequester()) {
        toast.error("لا يمكنك إبداء رأي على طلبك الخاص");
        return;
      }
    }
    
    setIsRejectDialogOpen(true);
  };
  
  const handleDiagnoseWorkflow = async () => {
    if (!requestId) return;
    
    setIsDiagnosing(true);
    try {
      const result = await debugWorkflowStatus(requestId);
      setDiagnosticResult(result);
      console.log("Workflow diagnosis result:", result);
      
      if (!result.success) {
        toast.error("فشل تشخيص سير العمل: " + result.error);
      } else if (result.issues?.length === 0) {
        toast.success("لا توجد مشاكل في سير العمل");
      }
    } catch (error) {
      console.error("Error diagnosing workflow:", error);
      toast.error("حدث خطأ أثناء تشخيص سير العمل");
    } finally {
      setIsDiagnosing(false);
    }
  };
  
  const handleFixWorkflow = async () => {
    if (!requestId) return;
    
    try {
      const result = await fixRequestWorkflow(requestId);
      console.log("Fix workflow result:", result);
      
      if (result.success) {
        toast.success("تم إصلاح سير العمل بنجاح");
        refetch();
        setDiagnosticResult(null);
      } else {
        toast.error("فشل إصلاح سير العمل: " + result.error);
      }
    } catch (error) {
      console.error("Error fixing workflow:", error);
      toast.error("حدث خطأ أثناء إصلاح سير العمل");
    }
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
    hasSubmittedOpinion,
    isRequester,
    user,
    queryClient,
    refetch,
    isDiagnosing,
    diagnosticResult,
    handleDiagnoseWorkflow,
    handleFixWorkflow
  };
};
