
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Delete Meeting Dialog Component
export interface DeleteMeetingDialogProps {
  meetingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const DeleteMeetingDialog: React.FC<DeleteMeetingDialogProps> = ({
  meetingId,
  open,
  onOpenChange,
  onSuccess
}) => {
  const navigate = useNavigate();
  
  const { mutate: deleteMeeting, isPending } = useMutation({
    mutationFn: async () => {
      // Delete the meeting
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success("تم حذف الاجتماع بنجاح");
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error("Error deleting meeting:", error);
      toast.error("حدث خطأ أثناء حذف الاجتماع");
    }
  });

  const handleDelete = () => {
    deleteMeeting();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>حذف الاجتماع</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من رغبتك في حذف هذا الاجتماع؟ هذا الإجراء لا يمكن التراجع عنه.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-between sm:justify-between mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "جاري الحذف..." : "حذف الاجتماع"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Edit Meeting Dialog Component
export interface EditMeetingDialogProps {
  meeting: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const EditMeetingDialog: React.FC<EditMeetingDialogProps> = ({
  meeting,
  open,
  onOpenChange,
  onSuccess
}) => {
  // This is a simplified version - in a real application you would implement 
  // the full form similar to what's likely in the protected component
  const { mutate: updateMeeting, isPending } = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('meetings')
        .update(data)
        .eq('id', meeting.id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success("تم تحديث الاجتماع بنجاح");
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error("Error updating meeting:", error);
      toast.error("حدث خطأ أثناء تحديث الاجتماع");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تعديل الاجتماع</DialogTitle>
          <DialogDescription>
            تعديل تفاصيل الاجتماع
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-center py-4">واجهة تعديل الاجتماع ستتوفر قريبًا</p>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Add Participant Dialog Component
export interface AddParticipantDialogProps {
  meetingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddParticipantDialog: React.FC<AddParticipantDialogProps> = ({
  meetingId,
  open,
  onOpenChange,
  onSuccess
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة مشاركين</DialogTitle>
          <DialogDescription>
            إضافة مشاركين للاجتماع
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-center py-4">واجهة إضافة المشاركين ستتوفر قريبًا</p>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
