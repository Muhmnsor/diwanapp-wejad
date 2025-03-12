
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
      
      const { data, error } = await supabase
        .from('request_approvals')
        .insert({
          request_id: requestId,
          step_id: stepId,
          approver_id: userId,
          status: 'rejected',
          comments: comments
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
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
