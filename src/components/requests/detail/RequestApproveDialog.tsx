
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
  
  // Check if this is a self-approval (user is approving their own request)
  const isSelfApproval = user?.id === requesterId;
  
  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!stepId) {
        throw new Error("لا يمكن الموافقة على هذا الطلب لأنه لا يوجد خطوة حالية");
      }
      
      // Self-approval warning for non-opinion steps
      if (isSelfApproval && stepType !== 'opinion') {
        throw new Error("لا يمكن الموافقة على طلبك الخاص إلا في حالة خطوات الرأي فقط");
      }
      
      console.log(`Approving request: ${requestId}, step: ${stepId}, type: ${stepType}, comments: "${comments}"`);
      
      // Add more metadata to help with debugging
      const metadata = {
        isSelfApproval,
        stepType,
        userId: user?.id,
        userRole: user?.role,
        userIsAdmin: user?.isAdmin,
        clientInfo: {
          timestamp: new Date().toISOString(),
          browser: navigator.userAgent
        }
      };
      
      // Use the RPC function that handles everything in a single transaction
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
      
      // For opinion steps, we need to manually progress the workflow 
      // to the next step since the RPC function doesn't do this
      if (stepType === 'opinion') {
        try {
          console.log("Opinion step completed. Updating workflow to next step...");
          
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
            // Don't throw here, as the opinion was still recorded successfully
            toast.warning("تم تسجيل رأيك ولكن هناك مشكلة في تحديث الخطوة التالية");
          } else {
            console.log("Workflow updated successfully:", updateResult);
          }
        } catch (updateError) {
          console.error("Exception updating workflow step:", updateError);
          // Don't throw here, as the opinion was still recorded successfully
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
        : "تمت الموافقة على الطلب بنجاح";
      
      toast.success(successMessage);
      onOpenChange(false);
      setComments("");
      
      // Invalidate all relevant queries to ensure UI is updated
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['requests', 'incoming'] });
      queryClient.invalidateQueries({ queryKey: ['request-details', requestId] });
      
      // For opinion steps, make sure the request is immediately removed from the incoming list
      if (stepType === 'opinion') {
        // Force refetch rather than just invalidate
        queryClient.invalidateQueries({ queryKey: ['requests', 'incoming'] });
      }
    },
    onError: (error) => {
      console.error("Error approving request:", error);
      toast.error(`حدث خطأ أثناء الموافقة على الطلب: ${error.message}`);
    }
  });

  const handleApprove = () => {
    approveMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {stepType === 'opinion' ? 'إبداء الرأي على الطلب' : 'الموافقة على الطلب'}
          </DialogTitle>
          <DialogDescription>
            {stepType === 'opinion' 
              ? 'الرجاء إبداء رأيك حول هذا الطلب' 
              : 'هل أنت متأكد من رغبتك في الموافقة على هذا الطلب؟'}
          </DialogDescription>
        </DialogHeader>
        
        {isSelfApproval && stepType !== 'opinion' && (
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>تنبيه</AlertTitle>
            <AlertDescription>
              لا يمكن الموافقة على طلبك الخاص إلا في حالة خطوات الرأي فقط.
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
          <label htmlFor="comments" className="block text-sm font-medium mb-2">
            {stepType === 'opinion' ? 'رأيك (اختياري)' : 'التعليقات (اختياري)'}
          </label>
          <Textarea
            id="comments"
            placeholder={stepType === 'opinion' ? 'أضف رأيك هنا...' : 'أضف تعليقًا...'}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button 
            onClick={handleApprove} 
            disabled={approveMutation.isPending || (isSelfApproval && stepType !== 'opinion')} 
            className="bg-green-600 hover:bg-green-700"
          >
            {approveMutation.isPending ? "جاري المعالجة..." : stepType === 'opinion' ? 'إرسال الرأي' : 'موافقة'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
