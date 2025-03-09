
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RequestApproveDialogProps {
  requestId: string;
  stepId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RequestApproveDialog = ({ requestId, stepId, isOpen, onOpenChange }: RequestApproveDialogProps) => {
  const [comments, setComments] = useState("");
  const queryClient = useQueryClient();

  const approveRequest = useMutation({
    mutationFn: async () => {
      const { data: approvalData, error: approvalError } = await supabase
        .from("request_approvals")
        .insert({
          request_id: requestId,
          step_id: stepId,
          approver_id: user?.id,
          status: "approved",
          comments: comments,
          approved_at: new Date().toISOString()
        })
        .select();
      
      if (approvalError) throw approvalError;

      const { error: requestError } = await supabase
        .from("requests")
        .update({
          status: "approved"
        })
        .eq("id", requestId);
      
      if (requestError) throw requestError;

      return approvalData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request-details", requestId] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success("تمت الموافقة على الطلب بنجاح");
      onOpenChange(false);
      setComments("");
    },
    onError: (error) => {
      console.error("Error approving request:", error);
      toast.error("حدث خطأ أثناء الموافقة على الطلب");
    }
  });

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
          <Button onClick={() => approveRequest.mutate()} disabled={approveRequest.isPending} className="bg-green-600 hover:bg-green-700">
            {approveRequest.isPending ? "جاري المعالجة..." : "موافقة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
