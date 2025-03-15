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
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const isSelfRejection = user?.id === requesterId;
  
  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!stepId) {
        throw new Error("لا يمكن رفض هذا الطلب لأنه لا يوجد خطوة حالية");
      }
      
      if (!comments || comments.trim() === '') {
        throw new Error(stepType === 'opinion' ? "يجب إدخال رأيك" : "يجب إدخال سبب الرفض");
      }
      
      if (isSelfRejection && stepType !== 'opinion') {
        throw new Error("لا يمكن رفض طلبك الخاص إلا في حالة خطوات الرأي فقط");
      }
      
      console.log(`Rejecting request: ${requestId}, step: ${stepId}, type: ${stepType}, comments: "${comments}"`);

      const metadata = {
        isSelfRejection,
        stepType,
        userId: user?.id,
        userRole: user?.role,
        userIsAdmin: user?.isAdmin,
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
      
      if (stepType === 'opinion') {
        try {
          console.log("Opinion step completed with negative opinion. Updating workflow to next step...");
          
          const { data: updateResult, error: updateError } = await supabase.functions.invoke('update-workflow-step', {
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
            toast.warning("تم تسجيل رأيك ولكن هناك مشكلة في تحديث الخطوة التالية");
          } else {
            console.log("Workflow updated successfully:", updateResult);
          }
        } catch (updateError) {
          console.error("Exception updating workflow step:", updateError);
        }
      } else {
        try {
          console.log("Decision step rejected. Running fix-request-status...");
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
      
      return data;
    },
    onSuccess: (result) => {
      if (result && !result.success) {
        toast.warning(result.message);
        onOpenChange(false);
        return;
      }
      
      const successMessage = stepType === 'opinion' 
        ? "تم تسجيل رأيك بنجاح" 
        : "تم رفض الطلب بنجاح";
      
      toast.success(successMessage);
      onOpenChange(false);
      setComments("");
      
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['requests', 'incoming'] });
      queryClient.invalidateQueries({ queryKey: ['request-details', requestId] });
      
      if (stepType === 'opinion') {
        queryClient.invalidateQueries({ queryKey: ['requests', 'incoming'] });
      }
    },
    onError: (error) => {
      console.error("Error rejecting request:", error);
      toast.error(`حدث خطأ أثناء رفض الطلب: ${error.message}`);
    }
  });

  const handleReject = () => {
    if (!comments.trim()) {
      toast.error(stepType === 'opinion' ? "يجب إدخال رأيك" : "يجب إدخال سبب الرفض");
      return;
    }
    rejectMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button 
            onClick={handleReject} 
            disabled={rejectMutation.isPending || !comments.trim() || (isSelfRejection && stepType !== 'opinion')}
            variant="destructive"
          >
            {rejectMutation.isPending ? "جاري المعالجة..." : stepType === 'opinion' ? 'إرسال الرأي' : 'رفض الطلب'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
