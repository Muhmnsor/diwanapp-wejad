
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, InfoIcon } from "lucide-react";
import { useAuthStore } from "@/store/refactored-auth";

interface RequestApproveDialogProps {
  requestId: string;
  stepId?: string;
  stepType?: string;
  requesterId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RequestApproveDialog = ({ 
  requestId, 
  stepId, 
  stepType = "decision", 
  requesterId,
  isOpen, 
  onOpenChange 
}: RequestApproveDialogProps) => {
  const [comments, setComments] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const isSelfApproval = user?.id === requesterId;
  const isOpinionStep = stepType === 'opinion';
  
  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!stepId) {
        throw new Error("لا يمكن الموافقة على هذا الطلب لأنه لا يوجد خطوة حالية");
      }
      
      // For opinion steps, comments are required
      if (isOpinionStep && (!comments || comments.trim() === '')) {
        throw new Error("يجب إدخال رأيك للمتابعة");
      }
      
      if (isSelfApproval && !isOpinionStep) {
        throw new Error("لا يمكن الموافقة على طلبك الخاص إلا في حالة خطوات الرأي فقط");
      }
      
      // SECURITY ENHANCEMENT: Verify that the current user is authorized approver
      // The server will also verify this, this is a client-side check
      const { data: stepData, error: stepError } = await supabase
        .from('workflow_steps')
        .select('approver_id, step_type')
        .eq('id', stepId)
        .single();
        
      if (stepError) {
        console.error("Error checking step approver:", stepError);
        throw new Error("حدث خطأ أثناء التحقق من صلاحية الموافقة");
      }
      
      if (stepData.approver_id !== user?.id && !isOpinionStep) {
        throw new Error("أنت لست المعتمد المخول للموافقة على هذه الخطوة");
      }
      
      console.log(`Approving request: ${requestId}, step: ${stepId}, type: ${stepType}, comments: "${comments}"`);
      
      const metadata = {
        isSelfApproval,
        stepType,
        userId: user?.id,
        userRole: user?.role,
        clientInfo: {
          timestamp: new Date().toISOString(),
          browser: navigator.userAgent
        }
      };
      
      // Use the appropriate RPC call
      const { data, error } = await supabase
        .rpc('approve_request', { 
          p_request_id: requestId,
          p_step_id: stepId,
          p_comments: comments || null,
          p_metadata: metadata
        });
        
      if (error) {
        console.error("Error approving request:", error);
        throw error;
      }
      
      console.log("Approval result:", data);
      
      try {
        console.log("Step completed. Updating workflow to next step...");
        
        const { data: updateResult, error: updateError } = await supabase.functions.invoke('update-workflow-step', {
          body: {
            requestId: requestId,
            currentStepId: stepId,
            action: 'approve',
            metadata: {
              ...metadata,
              comments
            }
          }
        });
        
        if (updateError) {
          console.error("Error updating workflow step:", updateError);
          toast.warning("تم تسجيل رأيك ولكن هناك مشكلة في تحديث الخطوة التالية");
        } else {
          console.log("Workflow updated successfully:", updateResult);
        }
        
        if (data && data.is_last_step) {
          console.log("This appears to be the last step. Running fix-request-status...");
          try {
            const { data: fixResult, error: fixError } = await supabase.functions.invoke('fix-request-status', {
              body: { requestId }
            });
            
            if (fixError) {
              console.error("Error fixing request status:", fixError);
            } else {
              console.log("Fix request status result:", fixResult);
            }
          } catch (fixError) {
            console.error("Exception fixing request status:", fixError);
          }
        }
      } catch (updateError) {
        console.error("Exception updating workflow step:", updateError);
      }
      
      return data;
    },
    onSuccess: (result) => {
      if (result && !result.success) {
        toast.warning(result.message);
        onOpenChange(false);
        return;
      }
      
      const successMessage = isOpinionStep 
        ? "تم تسجيل رأيك بنجاح" 
        : "تمت الموافقة على الطلب بنجاح";
      
      toast.success(successMessage);
      onOpenChange(false);
      setComments("");
      
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['requests', 'incoming'] });
      queryClient.invalidateQueries({ queryKey: ['request-details', requestId] });
    },
    onError: (error) => {
      console.error("Error approving request:", error);
      toast.error(`حدث خطأ أثناء الموافقة على الطلب: ${error.message}`);
    }
  });

  const handleApprove = () => {
    // For opinion steps, ensure comments are provided
    if (isOpinionStep && (!comments || comments.trim() === '')) {
      toast.error("يجب إدخال رأيك للمتابعة");
      return;
    }
    
    approveMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isOpinionStep ? 'إبداء الرأي على الطلب' : 'الموافقة على الطلب'}
          </DialogTitle>
          <DialogDescription>
            {isOpinionStep 
              ? 'الرجاء إبداء رأيك حول هذا الطلب' 
              : 'هل أنت متأكد من رغبتك في الموافقة على هذا الطلب؟'}
          </DialogDescription>
        </DialogHeader>
        
        {isSelfApproval && !isOpinionStep && (
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>تنبيه</AlertTitle>
            <AlertDescription>
              لا يمكن الموافقة على طلبك الخاص إلا في حالة خطوات الرأي فقط.
            </AlertDescription>
          </Alert>
        )}
        
        {isOpinionStep && (
          <Alert variant="default" className="my-2 bg-blue-50 text-blue-700 border-blue-200">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>معلومة</AlertTitle>
            <AlertDescription>
              هذه خطوة لإبداء الرأي فقط ولن تؤثر على سير الطلب.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="py-4">
          <label htmlFor="comments" className={`block text-sm font-medium mb-2 ${isOpinionStep ? 'text-primary' : ''}`}>
            {isOpinionStep ? 'رأيك (مطلوب) *' : 'التعليقات (اختياري)'}
          </label>
          <Textarea
            id="comments"
            placeholder={isOpinionStep ? 'أضف رأيك هنا...' : 'أضف تعليقًا...'}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            className={isOpinionStep && !comments.trim() ? "border-primary" : ""}
            required={isOpinionStep}
          />
          {isOpinionStep && !comments.trim() && (
            <p className="text-sm text-primary mt-1">
              يجب إدخال رأيك للمتابعة
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button 
            onClick={handleApprove} 
            disabled={approveMutation.isPending || (isSelfApproval && !isOpinionStep) || (isOpinionStep && !comments.trim())} 
            className="bg-green-600 hover:bg-green-700"
          >
            {approveMutation.isPending ? "جاري المعالجة..." : isOpinionStep ? 'إرسال الرأي' : 'موافقة'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
