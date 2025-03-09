
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
      const { data: rejectionData, error: rejectionError } = await supabase
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
      
      if (rejectionError) throw rejectionError;

      const { error: requestError } = await supabase
        .from("requests")
        .update({
          status: "rejected"
        })
        .eq("id", requestId);
      
      if (requestError) throw requestError;

      return rejectionData;
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
      toast.error("حدث خطأ أثناء رفض الطلب");
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>رفض الطلب</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من رغبتك في رفض هذا الطلب؟
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label htmlFor="reject-comments" className="block text-sm font-medium mb-2">
            سبب الرفض (مطلوب)
          </label>
          <Textarea
            id="reject-comments"
            placeholder="أدخل سبب الرفض..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            className="border-red-200 focus:border-red-300"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={() => rejectRequest.mutate()}
            disabled={rejectRequest.isPending || !comments.trim()}
          >
            {rejectRequest.isPending ? "جاري المعالجة..." : "رفض الطلب"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
