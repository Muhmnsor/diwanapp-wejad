
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
import { useRequestApproval } from "@/features/requests/hooks/useRequestApproval";

interface ApproveDialogProps {
  requestId: string;
  stepId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RequestApproveDialog = ({ requestId, stepId, isOpen, onOpenChange }: ApproveDialogProps) => {
  const [comments, setComments] = useState("");
  const { approveRequest } = useRequestApproval();

  const handleApprove = () => {
    if (!stepId) {
      toast.error("لا يمكن الموافقة على هذا الطلب لأنه لا يوجد خطوة حالية");
      return;
    }
    
    approveRequest.mutate(
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
          <Button onClick={handleApprove} disabled={approveRequest.isPending} className="bg-green-600 hover:bg-green-700">
            {approveRequest.isPending ? "جاري المعالجة..." : "موافقة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
