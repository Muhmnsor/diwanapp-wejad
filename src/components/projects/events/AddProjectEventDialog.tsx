
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EventBasicFields } from "./form/EventBasicFields";
import { EventDateTimeFields } from "./form/EventDateTimeFields";
import { EventLocationFields } from "./form/EventLocationFields";
import { ProjectActivityFormData } from "@/components/projects/activities/types";

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
      console.log('Creating new project event:', data);
      
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
          is_project_activity: false,
          is_visible: true,
          project_id: projectId,
          event_hours: data.activity_duration
        }])
        .select()
        .single();

      if (eventError) throw eventError;

      console.log('Event created successfully:', eventData);

      toast.success('تم إضافة الفعالية بنجاح');
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('حدث خطأ أثناء إضافة الفعالية');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة فعالية جديدة</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <EventBasicFields form={form} />
            <EventDateTimeFields form={form} />
            <EventLocationFields form={form} />

            <div className="flex justify-end gap-2 mt-6">
              <Button type="submit">إضافة الفعالية</Button>
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
