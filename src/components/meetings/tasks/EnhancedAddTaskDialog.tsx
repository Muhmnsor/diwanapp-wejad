
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MeetingTaskForm } from "./MeetingTaskForm";

interface EnhancedAddTaskDialogProps {
  meetingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const EnhancedAddTaskDialog = ({ 
  meetingId, 
  open, 
  onOpenChange,
  onSuccess 
}: EnhancedAddTaskDialogProps) => {
  
  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة مهمة جديدة للاجتماع</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <MeetingTaskForm 
            meetingId={meetingId}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
