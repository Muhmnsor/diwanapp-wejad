import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ProjectActivity } from "@/types/activity";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditProjectEventHeader } from "../../events/EditProjectEventHeader";
import { EditActivityForm } from "../form/EditActivityForm";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";

interface EditActivityDialogProps {
  activity: ProjectActivity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => Promise<void>;
  projectId: string;
}

export const EditActivityDialog = ({ 
  activity, 
  open, 
  onOpenChange,
  onSave,
  projectId
}: EditActivityDialogProps) => {
  console.log('EditActivityDialog - Received activity:', activity);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  
  const formData = activity ? {
    id: activity.id,
    title: activity.title,
    description: activity.description,
    date: activity.date,
    time: activity.time,
    location: activity.location,
    location_url: activity.location_url,
    special_requirements: activity.special_requirements,
    event_hours: activity.event_hours
  } : null;

  const handleSubmit = async (data: any) => {
    console.log('EditActivityDialog - Starting submission with data:', data);
    setIsLoading(true);
    
    try {
      if (activity) {
        // Update existing activity
        console.log('EditActivityDialog - Updating Supabase');
        const { error } = await supabase
          .from('events')
          .update({
            title: data.title,
            description: data.description,
            date: data.date,
            time: data.time,
            location: data.location,
            location_url: data.location_url,
            special_requirements: data.special_requirements,
            event_hours: data.event_hours
          })
          .eq('id', activity.id);

        if (error) throw error;
      } else {
        // Create new activity
        console.log('EditActivityDialog - Creating new activity');
        const { error } = await supabase
          .from('events')
          .insert([{
            ...data,
            project_id: projectId,
            is_project_activity: true,
            event_type: 'in-person',
            image_url: '/placeholder.svg'
          }]);

        if (error) throw error;
      }

      console.log('EditActivityDialog - Supabase operation successful');
      
      await queryClient.invalidateQueries({ 
        queryKey: ['project-activities', projectId]
      });
      
      await onSave();
      
      toast.success(activity ? 'تم تحديث النشاط بنجاح' : 'تم إضافة النشاط بنجاح');
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error in activity operation:', error);
      toast.error(activity ? 'حدث خطأ أثناء تحديث النشاط' : 'حدث خطأ أثناء إضافة النشاط');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] space-y-4 text-right" dir="rtl">
        <EditProjectEventHeader />
        <Separator className="my-4" />
        <ScrollArea className="h-[calc(90vh-120px)] pl-4">
          <EditActivityForm
            activity={formData}
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