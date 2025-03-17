
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processingWorkflow, setProcessingWorkflow] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const isSelfApproval = user?.id === requesterId;
  const isOpinionStep = stepType === 'opinion';
  
  // Reset error message when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    setErrorMessage(null);
    if (!open) {
      setComments(""); // Clear comments when closing
    }
    onOpenChange(open);
  };
  
  const approveMutation = useMutation({
    mutationFn: async () => {
      setErrorMessage(null);
      
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
      
      console.log(`Starting approval for request: ${requestId}, step: ${stepId}, type: ${stepType}, comments: "${comments}"`);
      
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
      
      // Use the appropriate RPC call with proper error handling
      try {
        console.log("Calling approve_request RPC...");
        const { data, error } = await supabase
          .rpc('approve_request', { 
            p_request_id: requestId,
            p_step_id: stepId,
            p_comments: comments || null,
            p_metadata: metadata
          });
          
        if (error) {
          console.error("Error from approve_request RPC:", error);
          throw new Error(error.message || "حدث خطأ أثناء محاولة الموافقة على الطلب");
        }
        
        console.log("Approval result:", data);
        
        if (!data || !data.success) {
          const errorMsg = data?.message || "فشلت عملية الموافقة لسبب غير معروف";
          console.error("Approval failed:", errorMsg);
          throw new Error(errorMsg);
        }
        
        // The initial approval was successful
        // Now update the workflow using our new edge function
        setProcessingWorkflow(true);
        
        try {
          console.log("Step completed. Updating workflow to next step using process-workflow-update function...");
          
          const { data: updateResult, error: updateError } = await supabase.functions.invoke('process-workflow-update', {
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
            // Don't throw here - we'll show a warning but still consider the operation successful
            toast.warning("تم تسجيل موافقتك ولكن هناك مشكلة في تحديث الخطوة التالية");
          } else {
            console.log("Workflow updated successfully:", updateResult);
          }
        } catch (updateError) {
          console.error("Exception updating workflow step:", updateError);
          // Don't throw - we'll show a warning but the approval was recorded
          toast.warning("تم تسجيل موافقتك ولكن هناك مشكلة في تحديث الخطوة التالية");
        } finally {
          setProcessingWorkflow(false);
        }
        
        return data;
      } catch (error) {
        console.error("Error in approve_request call:", error);
        throw error;
      }
    },
    onSuccess: (result) => {
      if (result && !result.success) {
        setErrorMessage(result.message || "فشلت عملية الموافقة");
        toast.warning(result.message);
        return;
      }
      
      const successMessage = isOpinionStep 
        ? "تم تسجيل رأيك بنجاح" 
        : "تمت الموافقة على الطلب بنجاح";
      
      toast.success(successMessage);
      
      // Only close the dialog after a successful submission
      handleOpenChange(false);
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['requests', 'incoming'] });
      queryClient.invalidateQueries({ queryKey: ['request-details', requestId] });
    },
    onError: (error: Error) => {
      console.error("Error in approveMutation:", error);
      setErrorMessage(error.message || "حدث خطأ أثناء الموافقة على الطلب");
      toast.error(`حدث خطأ أثناء الموافقة على الطلب: ${error.message}`);
    }
  });

  const handleApprove = () => {
    // For opinion steps, ensure comments are provided
    if (isOpinionStep && (!comments || comments.trim() === '')) {
      setErrorMessage("يجب إدخال رأيك للمتابعة");
      toast.error("يجب إدخال رأيك للمتابعة");
      return;
    }
    
    approveMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
        
        {errorMessage && (
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>خطأ</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
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
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            إلغاء
          </Button>
          <Button 
            onClick={handleApprove} 
            disabled={
              approveMutation.isPending || 
              processingWorkflow || 
              (isSelfApproval && !isOpinionStep) || 
              (isOpinionStep && !comments.trim())
            } 
            className="bg-green-600 hover:bg-green-700"
          >
            {approveMutation.isPending || processingWorkflow ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {processingWorkflow ? 'جاري تحديث الخطوات...' : 'جاري المعالجة...'}
              </>
            ) : (
              isOpinionStep ? 'إرسال الرأي' : 'موافقة'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
