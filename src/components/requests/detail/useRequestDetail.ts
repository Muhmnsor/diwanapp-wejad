import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRequestDetails, diagnoseRequestWorkflow, fixRequestWorkflow } from "./services/requestService";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { toast } from "sonner";

export const useRequestDetail = (requestId: string) => {
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

  const isCurrentApprover = () => {
    if (!data || !user || !data.current_step) return false;
    
    // For completed requests, no approver is needed
    if (data.request?.status === 'completed') return false;
    
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
    
    // For opinion steps, always allow any authenticated user to participate
    if (stepType === 'opinion') {
      console.log("هذه خطوة رأي ويمكن لأي مستخدم إبداء رأيه");
      // Check if the user has already submitted their opinion
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
    
    // For decision steps, direct approver check
    if (data.current_step.id && user.id === data.current_step.approver_id) {
      console.log("المستخدم هو المعتمد المباشر للخطوة الحالية");
      return true;
    }
    
    // Admin users can approve any request
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

  const hasSubmittedOpinion = () => {
    if (!data || !user || !data.current_step) return false;
    
    const currentStep = data.current_step;
    const stepType = currentStep.step_type || 'decision';
    
    // Only applicable for opinion steps
    if (stepType !== 'opinion') return false;
    
    return data.approvals?.some(
      (approval: any) => 
        approval.step_id === currentStep.id && 
        approval.approver_id === user.id
    ) || false;
  };

  const handleApproveClick = () => {
    if (!isCurrentApprover() && data?.current_step?.step_type !== 'opinion') {
      toast.error("ليس لديك الصلاحية للموافقة على هذا الطلب");
      return;
    }
    
    // For opinion steps, check if user has already submitted
    if (data?.current_step?.step_type === 'opinion' && hasSubmittedOpinion()) {
      toast.error("لقد قمت بالفعل بإبداء رأيك على هذه الخطوة");
      return;
    }
    
    setIsApproveDialogOpen(true);
  };

  const handleRejectClick = () => {
    if (!isCurrentApprover() && data?.current_step?.step_type !== 'opinion') {
      toast.error("ليس لديك الصلاحية لرفض هذا الطلب");
      return;
    }
    
    // For opinion steps, check if user has already submitted
    if (data?.current_step?.step_type === 'opinion' && hasSubmittedOpinion()) {
      toast.error("لقد قمت بالفعل بإبداء رأيك على هذه الخطوة");
      return;
    }
    
    setIsRejectDialogOpen(true);
  };
  
  const handleDiagnoseWorkflow = async () => {
    if (!requestId) return;
    
    setIsDiagnosing(true);
    try {
      const result = await diagnoseRequestWorkflow(requestId);
      setDiagnosticResult(result);
      
      // Check for workflow issues specifically related to completion state
      const needsFixing = result?.diagnose?.needs_fixing || 
                         (result?.analysis?.issues && result.analysis.issues.length > 0);
                         
      const completionIssue = 
        (result?.analysis?.issues || []).some((issue: string) => 
          issue.includes('completed') || 
          issue.includes('All required steps are approved')
        );
      
      if (needsFixing) {
        if (completionIssue) {
          toast.warning("تم اكتشاف مشكلة في حالة اكتمال الطلب");
        } else {
          toast.warning("تم اكتشاف مشاكل في مسار العمل");
        }
      } else {
        toast.success("تم فحص مسار العمل، لم يتم العثور على مشاكل");
      }
      
      return result;
    } catch (error) {
      console.error("Error diagnosing workflow:", error);
      toast.error("حدث خطأ أثناء تشخيص مسار العمل");
    } finally {
      setIsDiagnosing(false);
    }
  };
  
  const handleFixWorkflow = async () => {
    if (!requestId) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('fix-request-status', {
        body: { requestId }
      });
      
      if (error) throw error;
      
      // Check if any modifications were made
      if (data.was_modified) {
        toast.success(data.result.message || "تم إصلاح مسار العمل بنجاح");
        queryClient.invalidateQueries({ queryKey: ["request-details", requestId] });
      } else {
        toast.info(data.result.message || "لا توجد تغييرات مطلوبة");
      }
      
      return data;
    } catch (error) {
      console.error("Error fixing workflow:", error);
      toast.error("حدث خطأ أثناء محاولة إصلاح مسار العمل");
      throw error;
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
    refetch,
    isDiagnosing,
    diagnosticResult,
    handleDiagnoseWorkflow,
    handleFixWorkflow
  };
};
