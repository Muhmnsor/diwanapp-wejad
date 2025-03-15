
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";

interface OpinionDialogProps {
  requestId: string;
  stepId: string;
  requesterId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OpinionDialog = ({
  requestId,
  stepId,
  requesterId,
  isOpen,
  onOpenChange,
}: OpinionDialogProps) => {
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!comments.trim()) {
      toast.error("الرجاء إدخال رأيك قبل المتابعة");
      return;
    }

    setIsSubmitting(true);

    try {
      // استخدام دالة approve_request ولكن مع نوع الخطوة رأي
      const { data, error } = await supabase.rpc("approve_request", {
        p_request_id: requestId,
        p_step_id: stepId,
        p_comments: comments,
        p_metadata: { opinion: true }
      });

      if (error) {
        throw error;
      }

      toast.success("تم تسجيل رأيك بنجاح");
      
      // إعادة تحميل بيانات الطلب
      queryClient.invalidateQueries({ queryKey: ["request-details", requestId] });
      
      // إغلاق النافذة
      onOpenChange(false);
      
      // إعادة تعيين النموذج
      setComments("");
    } catch (error: any) {
      console.error("Error submitting opinion:", error);
      toast.error(`حدث خطأ أثناء إرسال الرأي: ${error.message || error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            إبداء الرأي حول الطلب
          </DialogTitle>
          <DialogDescription>
            يرجى إدخال رأيك حول هذا الطلب. ملاحظاتك ستساعد في اتخاذ القرار النهائي.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Textarea
            placeholder="أدخل رأيك هنا..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !comments.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "جاري الإرسال..." : "إرسال الرأي"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
