
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
      
      console.log(`Approving request: ${requestId}, step: ${stepId}, comments: "${comments}"`);
      
      // Use the RPC function to handle approval in a single transaction
      const { data, error } = await supabase.rpc(
        'approve_request', 
        { 
          p_request_id: requestId,
          p_step_id: stepId,
          p_comments: comments || null
        }
      );
        
      if (error) {
        console.error("Error approving request:", error);
        throw error;
      }
      
      console.log("Approval result:", data);
      return data;
    },
    onSuccess: (result) => {
      if (result && !result.success) {
        toast.warning(result.message);
        onOpenChange(false);
        return;
      }
      
      // Handle different messages based on step type
      const message = result.step_type === 'opinion' 
        ? "تم تسجيل رأيك بنجاح" 
        : "تمت الموافقة على الطلب بنجاح";
      
      toast.success(message);
      onOpenChange(false);
      setComments("");
      
      // Invalidate queries to refresh data
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
