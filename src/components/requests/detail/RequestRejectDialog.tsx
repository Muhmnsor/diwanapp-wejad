
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

interface RequestRejectDialogProps {
  requestId: string;
  stepId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RequestRejectDialog = ({ requestId, stepId, isOpen, onOpenChange }: RequestRejectDialogProps) => {
  const [comments, setComments] = useState("");
  const queryClient = useQueryClient();
  
  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!stepId) {
        throw new Error("لا يمكن رفض هذا الطلب لأنه لا يوجد خطوة حالية");
      }
      
      if (!comments || comments.trim() === '') {
        throw new Error("يجب إدخال سبب الرفض");
      }
      
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      
      if (!userId) {
        throw new Error("يجب تسجيل الدخول لرفض الطلب");
      }
      
      console.log(`Rejecting request: ${requestId}, step: ${stepId}, by user: ${userId}, comments: "${comments}"`);

      // First, check if user has already processed this step
      const { data: existingApproval, error: checkError } = await supabase
        .from('request_approvals')
        .select('id, status')
        .eq('request_id', requestId)
        .eq('step_id', stepId)
        .eq('approver_id', userId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking existing approval:", checkError);
      }
      
      if (existingApproval) {
        console.log("User has already processed this request step:", existingApproval);
        return { 
          success: false, 
          message: `لقد قمت بالفعل بـ ${existingApproval.status === 'approved' ? 'الموافقة على' : 'رفض'} هذا الطلب` 
        };
      }

      try {
        // Step 1: Add the rejection record
        const { data: rejectionData, error: rejectionError } = await supabase
          .from('request_approvals')
          .insert({
            request_id: requestId,
            step_id: stepId,
            approver_id: userId,
            status: 'rejected',
            comments: comments.trim() // Ensure comments is not null and trim whitespace
          })
          .select()
          .single();
          
        if (rejectionError) {
          console.error("Error creating rejection record:", rejectionError);
          throw rejectionError;
        }
        
        console.log("Rejection record created successfully:", rejectionData);
        
        // Step 2: Update the request status using RPC
        const { data: requestData, error: requestError } = await supabase
          .rpc('update_request_after_rejection', { 
            p_request_id: requestId,
            p_step_id: stepId
          });
          
        if (requestError) {
          console.error("Error updating request status after rejection:", requestError);
          throw requestError;
        } else {
          console.log("Request status update result:", requestData);
        }
        
        return { success: true, data: rejectionData };
      } catch (error) {
        console.error("Error in rejection process:", error);
        throw error;
      }
    },
    onSuccess: (result) => {
      if (result && !result.success) {
        toast.warning(result.message);
        onOpenChange(false);
        return;
      }
      
      toast.success("تم رفض الطلب بنجاح");
      onOpenChange(false);
      setComments("");
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['request-details', requestId] });
    },
    onError: (error) => {
      console.error("Error rejecting request:", error);
      toast.error(`حدث خطأ أثناء رفض الطلب: ${error.message}`);
    }
  });

  const handleReject = () => {
    if (!comments.trim()) {
      toast.error("يجب إدخال سبب الرفض");
      return;
    }
    rejectMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>رفض الطلب</DialogTitle>
          <DialogDescription>
            يرجى توضيح سبب رفض هذا الطلب
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label htmlFor="comments" className="block text-sm font-medium mb-2 text-destructive">
            سبب الرفض (مطلوب) *
          </label>
          <Textarea
            id="comments"
            placeholder="اكتب سبب الرفض هنا..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            className={!comments.trim() ? "border-destructive" : ""}
            required
          />
          {!comments.trim() && (
            <p className="text-sm text-destructive mt-1">يجب إدخال سبب الرفض</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button 
            onClick={handleReject} 
            disabled={rejectMutation.isPending || !comments.trim()}
            variant="destructive"
          >
            {rejectMutation.isPending ? "جاري المعالجة..." : "رفض الطلب"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
