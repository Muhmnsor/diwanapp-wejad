import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProjectActivity, ProjectActivityFormData } from "@/types/activity";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EditActivityForm } from "./form/EditActivityForm";

interface EditProjectActivityDialogProps {
  activity: {
    id: string;
    project_id: string;
    event: ProjectActivity;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  projectId: string;
}

export const EditProjectActivityDialog = ({
  activity,
  open,
  onOpenChange,
  onSave,
  projectId
}: EditProjectActivityDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  console.log('Activity data in EditProjectActivityDialog:', activity);

  const handleSubmit = async (data: ProjectActivityFormData) => {
    console.log('Submitting form with data:', data);
    setIsLoading(true);
    
    try {
      // Update the events table
      const { error: updateError } = await supabase
        .from('events')
        .update({
          title: data.title,
          description: data.description,
          date: data.date,
          time: data.time,
          location: data.location,
          location_url: data.location_url,
          special_requirements: data.special_requirements,
          event_hours: Number(data.event_hours),
        })
        .eq('id', activity.event.id);

      if (updateError) {
        console.error('Error updating activity:', updateError);
        throw updateError;
      }

      toast.success("تم تحديث النشاط بنجاح");
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error("حدث خطأ أثناء تحديث النشاط");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]" dir="rtl">
        <DialogTitle>تعديل النشاط</DialogTitle>
        <ScrollArea className="h-[calc(90vh-120px)]">
          <EditActivityForm
            activity={activity.event}
            onSave={onSave}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
            handleSubmit={handleSubmit}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};