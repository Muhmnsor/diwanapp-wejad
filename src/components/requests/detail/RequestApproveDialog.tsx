
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

interface RequestApproveDialogProps {
  requestId: string;
  stepId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RequestApproveDialog = ({ requestId, stepId, isOpen, onOpenChange }: RequestApproveDialogProps) => {
  const [comments, setComments] = useState("");
  const queryClient = useQueryClient();
  
  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!stepId) {
        throw new Error("لا يمكن الموافقة على هذا الطلب لأنه لا يوجد خطوة حالية");
      }
      
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      
      if (!userId) {
        throw new Error("يجب تسجيل الدخول للموافقة على الطلب");
      }
      
      console.log(`Approving request: ${requestId}, step: ${stepId}, by user: ${userId}, comments: "${comments}"`);
      
      try {
        // Step 1: Add the approval record - explicitly set comments to empty string if null
        const { data: approvalData, error: approvalError } = await supabase
          .from('request_approvals')
          .insert({
            request_id: requestId,
            step_id: stepId,
            approver_id: userId,
            status: 'approved',
            comments: comments || "" // Ensure comments is never null
          })
          .select()
          .single();
          
        if (approvalError) {
          console.error("Error creating approval record:", approvalError);
          throw approvalError;
        }
        
        console.log("Approval record created successfully:", approvalData);
        
        // Step 2: Update the request status if needed
        const { data: requestData, error: requestError } = await supabase
          .rpc('update_request_after_approval', { 
            p_request_id: requestId,
            p_step_id: stepId
          });
          
        if (requestError) {
          console.error("Error updating request status:", requestError);
          throw requestError;
        } else {
          console.log("Request status update result:", requestData);
        }
        
        return approvalData;
      } catch (error) {
        console.error("Error in approval process:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("تمت الموافقة على الطلب بنجاح");
      onOpenChange(false);
      setComments("");
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['request-details', requestId] });
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
          <DialogTitle>الموافقة على الطلب</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من رغبتك في الموافقة على هذا الطلب؟
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label htmlFor="comments" className="block text-sm font-medium mb-2">
            التعليقات (اختياري)
          </label>
          <Textarea
            id="comments"
            placeholder="أضف تعليقًا..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleApprove} disabled={approveMutation.isPending} className="bg-green-600 hover:bg-green-700">
            {approveMutation.isPending ? "جاري المعالجة..." : "موافقة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
