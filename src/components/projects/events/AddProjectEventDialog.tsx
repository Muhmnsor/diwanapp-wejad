
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EventBasicFields } from "./form/EventBasicFields";
import { EventDateTimeFields } from "./form/EventDateTimeFields";
import { EventLocationFields } from "./form/EventLocationFields";
import { ProjectActivityFormData } from "@/types/activity";

interface AddProjectEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess: () => void;
  project: {
    event_path: string;
    event_category: string;
  };
}

export const AddProjectEventDialog = ({
  open,
  onOpenChange,
  projectId,
  onSuccess,
  project
}: AddProjectEventDialogProps) => {
  const form = useForm<ProjectActivityFormData>({
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      location_url: "",
      special_requirements: "",
      activity_duration: 0
    }
  });

  const onSubmit = async (data: ProjectActivityFormData) => {
    try {
      console.log('Creating new project activity:', data);
      
      // Create the activity directly with project_id
      const { data: activityData, error: activityError } = await supabase
        .from('project_activities')
        .insert([{
          ...data,
          project_id: projectId,
          is_visible: true,
        }])
        .select()
        .single();

      if (activityError) throw activityError;

      console.log('Activity created successfully:', activityData);

      toast.success('تم إضافة النشاط بنجاح');
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error creating project activity:', error);
      toast.error('حدث خطأ أثناء إضافة النشاط');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة نشاط جديد</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <EventBasicFields form={form} />
            <EventDateTimeFields form={form} />
            <EventLocationFields form={form} />

            <div className="flex justify-end gap-2 mt-6">
              <Button type="submit">إضافة النشاط</Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
