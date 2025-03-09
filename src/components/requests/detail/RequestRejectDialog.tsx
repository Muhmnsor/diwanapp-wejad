
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
import { useAuthStore } from "@/store/authStore";

interface RequestRejectDialogProps {
  requestId: string;
  stepId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RequestRejectDialog = ({ requestId, stepId, isOpen, onOpenChange }: RequestRejectDialogProps) => {
  const [comments, setComments] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const rejectRequest = useMutation({
    mutationFn: async () => {
      if (!comments.trim()) {
        throw new Error("يجب إدخال سبب الرفض");
      }

      const { data: approvalData, error: approvalError } = await supabase
        .from("request_approvals")
        .insert({
          request_id: requestId,
          step_id: stepId,
          approver_id: user?.id,
          status: "rejected",
          comments: comments,
          approved_at: new Date().toISOString()
        })
        .select();
      
      if (approvalError) throw approvalError;

      const { error: requestError } = await supabase
        .from("requests")
        .update({
          status: "rejected"
        })
        .eq("id", requestId);
      
      if (requestError) throw requestError;

      return approvalData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request-details", requestId] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success("تم رفض الطلب بنجاح");
      onOpenChange(false);
      setComments("");
    },
    onError: (error) => {
      console.error("Error rejecting request:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("حدث خطأ أثناء رفض الطلب");
      }
    }
  });

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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button 
            onClick={() => rejectRequest.mutate()} 
            disabled={rejectRequest.isPending || !comments.trim()}
            variant="destructive"
          >
            {rejectRequest.isPending ? "جاري المعالجة..." : "رفض الطلب"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
