
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
import { AlertCircle, InfoIcon, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/refactored-auth";

interface RequestRejectDialogProps {
  requestId: string;
  stepId?: string;
  stepType?: string;
  requesterId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RequestRejectDialog = ({ 
  requestId, 
  stepId, 
  stepType = "decision", 
  requesterId,
  isOpen, 
  onOpenChange 
}: RequestRejectDialogProps) => {
  const [comments, setComments] = useState("");
  const [processingWorkflow, setProcessingWorkflow] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const isSelfRejection = user?.id === requesterId;
  
  // Reset error message when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    setErrorMessage(null);
    if (!open) {
      setComments(""); // Clear comments when closing
    }
    onOpenChange(open);
  };
  
  const rejectMutation = useMutation({
    mutationFn: async () => {
      setErrorMessage(null);
      
      if (!stepId) {
        throw new Error("لا يمكن رفض هذا الطلب لأنه لا يوجد خطوة حالية");
      }
      
      if (!comments || comments.trim() === '') {
        throw new Error(stepType === 'opinion' ? "يجب إدخال رأيك" : "يجب إدخال سبب الرفض");
      }
      
      if (isSelfRejection && stepType !== 'opinion') {
        throw new Error("لا يمكن رفض طلبك الخاص إلا في حالة خطوات الرأي فقط");
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
        throw new Error("حدث خطأ أثناء التحقق من صلاحية الرفض");
      }
      
      if (stepData.approver_id !== user?.id) {
        throw new Error("أنت لست المعتمد المخول لرفض هذه الخطوة");
      }
      
      console.log(`Rejecting request: ${requestId}, step: ${stepId}, type: ${stepType}, comments: "${comments}"`);

      const metadata = {
        isSelfRejection,
        stepType,
        userId: user?.id,
        userRole: user?.role,
        clientInfo: {
          timestamp: new Date().toISOString(),
          browser: navigator.userAgent
        }
      };

      const { data, error } = await supabase
        .rpc('reject_request', { 
          p_request_id: requestId,
          p_step_id: stepId,
          p_comments: comments.trim(),
          p_metadata: metadata
        });
        
      if (error) {
        console.error("Error rejecting request:", error);
        throw error;
      }
      
      console.log("Rejection result:", data);
      
      if (!data || !data.success) {
        const errorMsg = data?.message || "فشلت عملية الرفض لسبب غير معروف";
        console.error("Rejection failed:", errorMsg);
        throw new Error(errorMsg);
      }
      
      // The initial rejection was successful
      // Now update the workflow status using our new edge function
      setProcessingWorkflow(true);
      
      try {
        console.log("Step rejected. Updating workflow using process-workflow-update function...");
        
        const { data: updateResult, error: updateError } = await supabase.functions.invoke('process-workflow-update', {
          body: {
            requestId: requestId,
            currentStepId: stepId,
            action: 'reject',
            metadata: {
              ...metadata,
              comments
            }
          }
        });
        
        if (updateError) {
          console.error("Error updating workflow step:", updateError);
          // Don't throw here - we'll show a warning but still consider the operation successful
          toast.warning("تم تسجيل رفضك ولكن هناك مشكلة في تحديث الخطوة التالية");
        } else {
          console.log("Workflow updated successfully:", updateResult);
        }
      } catch (updateError) {
        console.error("Exception updating workflow step:", updateError);
        // Don't throw - we'll show a warning but the rejection was recorded
        toast.warning("تم تسجيل رفضك ولكن هناك مشكلة في تحديث حالة الطلب");
      } finally {
        setProcessingWorkflow(false);
      }
      
      return data;
    },
    onSuccess: (result) => {
      if (result && !result.success) {
        setErrorMessage(result.message || "فشلت عملية الرفض");
        toast.warning(result.message);
        return;
      }
      
      const successMessage = stepType === 'opinion' 
        ? "تم تسجيل رأيك بنجاح" 
        : "تم رفض الطلب بنجاح";
      
      toast.success(successMessage);
      
      // Only close the dialog after a successful submission
      handleOpenChange(false);
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['requests', 'incoming'] });
      queryClient.invalidateQueries({ queryKey: ['request-details', requestId] });
    },
    onError: (error: Error) => {
      console.error("Error in rejectMutation:", error);
      setErrorMessage(error.message || "حدث خطأ أثناء رفض الطلب");
      toast.error(`حدث خطأ أثناء رفض الطلب: ${error.message}`);
    }
  });

  const handleReject = () => {
    if (!comments.trim()) {
      setErrorMessage(stepType === 'opinion' ? "يجب إدخال رأيك" : "يجب إدخال سبب الرفض");
      toast.error(stepType === 'opinion' ? "يجب إدخال رأيك" : "يجب إدخال سبب الرفض");
      return;
    }
    rejectMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {stepType === 'opinion' ? 'إبداء الرأي على الطلب' : 'رفض الطلب'}
          </DialogTitle>
          <DialogDescription>
            {stepType === 'opinion' 
              ? 'الرجاء إبداء رأيك حول هذا الطلب' 
              : 'يرجى توضيح سبب رفض هذا الطلب'}
          </DialogDescription>
        </DialogHeader>
        
        {isSelfRejection && stepType !== 'opinion' && (
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>تنبيه</AlertTitle>
            <AlertDescription>
              لا يمكن رفض طلبك الخاص إلا في حالة خطوات الرأي فقط.
            </AlertDescription>
          </Alert>
        )}
        
        {stepType === 'opinion' && (
          <Alert variant="default" className="my-2 bg-blue-50 text-blue-700 border-blue-200">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>معلومة</AlertTitle>
            <AlertDescription>
              هذه خطوة لإبداء الرأي فقط ولن تؤثر على سير الطلب.
            </AlertDescription>
          </Alert>
        )}
        
        {errorMessage && (
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>خطأ</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <div className="py-4">
          <label htmlFor="comments" className="block text-sm font-medium mb-2 text-destructive">
            {stepType === 'opinion' ? 'رأيك (مطلوب) *' : 'سبب الرفض (مطلوب) *'}
          </label>
          <Textarea
            id="comments"
            placeholder={stepType === 'opinion' ? 'اكتب رأيك هنا...' : 'اكتب سبب الرفض هنا...'}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            className={!comments.trim() ? "border-destructive" : ""}
            required
          />
          {!comments.trim() && (
            <p className="text-sm text-destructive mt-1">
              {stepType === 'opinion' ? 'يجب إدخال رأيك' : 'يجب إدخال سبب الرفض'}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            إلغاء
          </Button>
          <Button 
            onClick={handleReject} 
            disabled={
              rejectMutation.isPending || 
              processingWorkflow || 
              !comments.trim() || 
              (isSelfRejection && stepType !== 'opinion')
            }
            variant="destructive"
          >
            {rejectMutation.isPending || processingWorkflow ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {processingWorkflow ? 'جاري تحديث الحالة...' : 'جاري المعالجة...'}
              </>
            ) : (
              stepType === 'opinion' ? 'إرسال الرأي' : 'رفض الطلب'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
