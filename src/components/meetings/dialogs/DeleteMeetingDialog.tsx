
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
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteMeetingDialogProps {
  meetingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteMeetingDialog = ({ meetingId, open, onOpenChange }: DeleteMeetingDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!meetingId) return;

    setIsDeleting(true);
    try {
      // First delete related tasks
      const { error: tasksError } = await supabase
        .from('meeting_tasks')
        .delete()
        .eq('meeting_id', meetingId);

      if (tasksError) {
        console.error("Error deleting meeting tasks:", tasksError);
        toast.error("حدث خطأ أثناء حذف مهام الاجتماع");
        return;
      }

      // Then delete the meeting itself
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);

      if (error) {
        console.error("Error deleting meeting:", error);
        toast.error("حدث خطأ أثناء حذف الاجتماع");
        return;
      }

      toast.success("تم حذف الاجتماع بنجاح");
      
      // Navigate back to meetings list
      navigate('/meetings');
    } catch (error) {
      console.error("Error in delete meeting process:", error);
      toast.error("حدث خطأ أثناء حذف الاجتماع");
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>حذف الاجتماع</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من رغبتك في حذف هذا الاجتماع؟ سيتم حذف كافة المهام والمعلومات المرتبطة به. هذا الإجراء لا يمكن التراجع عنه.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <div className="flex space-x-2 space-x-reverse justify-start">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  حذف الاجتماع
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
