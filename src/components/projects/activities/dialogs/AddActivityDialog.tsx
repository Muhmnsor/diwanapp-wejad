import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditActivityForm } from "../form/EditActivityForm";
import { EditProjectEventHeader } from "../../events/EditProjectEventHeader";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { ProjectActivityFormData } from "@/types/activity";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => Promise<void>;
  projectId: string;
}

export const AddActivityDialog = ({ 
  open, 
  onOpenChange,
  onSave,
  projectId
}: AddActivityDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ProjectActivityFormData) => {
    console.log('AddActivityDialog - Starting submission with data:', data);
    setIsLoading(true);
    
    try {
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
      
      await onSave();
      toast.success('تم إضافة النشاط بنجاح');
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error in activity operation:', error);
      toast.error('حدث خطأ أثناء إضافة النشاط');
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
            activity={null}
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