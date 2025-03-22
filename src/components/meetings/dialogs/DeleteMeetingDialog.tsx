
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeleteMeetingDialogProps {
  meetingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const DeleteMeetingDialog = ({ 
  meetingId, 
  open, 
  onOpenChange,
  onSuccess 
}: DeleteMeetingDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!meetingId) return;
    
    setIsDeleting(true);
    try {
      console.log("Deleting meeting:", meetingId);
      
      // 1. Delete meeting participants
      const { error: participantsError } = await supabase
        .from('meeting_participants')
        .delete()
        .eq('meeting_id', meetingId);
      
      if (participantsError) {
        console.error("Error deleting meeting participants:", participantsError);
      }
      
      // 2. Delete meeting agenda items
      const { error: agendaError } = await supabase
        .from('meeting_agenda_items')
        .delete()
        .eq('meeting_id', meetingId);
      
      if (agendaError) {
        console.error("Error deleting meeting agenda items:", agendaError);
      }
      
      // 3. Delete meeting objectives
      const { error: objectivesError } = await supabase
        .from('meeting_objectives')
        .delete()
        .eq('meeting_id', meetingId);
      
      if (objectivesError) {
        console.error("Error deleting meeting objectives:", objectivesError);
      }
      
      // 4. Delete meeting tasks
      const { error: tasksError } = await supabase
        .from('meeting_tasks')
        .delete()
        .eq('meeting_id', meetingId);
      
      if (tasksError) {
        console.error("Error deleting meeting tasks:", tasksError);
      }
      
      // 5. Delete the meeting
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);
      
      if (error) throw error;
      
      toast.success("تم حذف الاجتماع بنجاح");
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast.error("حدث خطأ أثناء حذف الاجتماع");
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">حذف الاجتماع</DialogTitle>
          <DialogDescription className="text-right">
            هل أنت متأكد من رغبتك في حذف هذا الاجتماع؟ هذا الإجراء لا يمكن التراجع عنه.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex justify-start gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
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
              'حذف الاجتماع'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
