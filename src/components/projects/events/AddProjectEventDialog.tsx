import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      event_hours: 0
    }
  });

  const onSubmit = async (data: ProjectActivityFormData) => {
    try {
      console.log('Creating new project activity:', data);
      
      // First, create the event with is_project_activity flag
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert([{
          ...data,
          event_path: project.event_path,
          event_category: project.event_category,
          event_type: 'in-person',
          max_attendees: 0,
          price: 0,
          beneficiary_type: 'both',
          certificate_type: 'none',
          image_url: "/placeholder.svg",
          is_project_activity: true, // This ensures it's marked as a project activity
          is_visible: true
        }])
        .select()
        .single();

      if (eventError) throw eventError;

      console.log('Event created successfully:', eventData);

      // Then, link it to the project
      const { error: linkError } = await supabase
        .from('project_events')
        .insert([{
          project_id: projectId,
          event_id: eventData.id,
          event_order: 0
        }]);

      if (linkError) throw linkError;

      console.log('Project event link created successfully');

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