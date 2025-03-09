
import { useState } from "react";
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
import { useRequests } from "../hooks/useRequests";

interface RequestRejectDialogProps {
  requestId: string;
  stepId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RequestRejectDialog = ({ requestId, stepId, isOpen, onOpenChange }: RequestRejectDialogProps) => {
  const [comments, setComments] = useState("");
  const { rejectRequest } = useRequests();

  const handleReject = () => {
    if (!comments.trim()) {
      toast.error("يجب إدخال سبب الرفض");
      return;
    }
    
    if (!stepId) {
      toast.error("لا يمكن رفض هذا الطلب لأنه لا يوجد خطوة حالية");
      return;
    }
    
    rejectRequest.mutate(
      { requestId, stepId, comments },
      {
        onSuccess: () => {
          onOpenChange(false);
          setComments("");
        }
      }
    );
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
