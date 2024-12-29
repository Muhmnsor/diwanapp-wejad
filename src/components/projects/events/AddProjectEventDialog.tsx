import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EventBasicFields } from "./form/EventBasicFields";
import { EventDateTimeFields } from "./form/EventDateTimeFields";
import { EventLocationFields } from "./form/EventLocationFields";
import { ProjectEventFormData } from "./types";

interface AddProjectEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess: () => void;
}

export const AddProjectEventDialog = ({
  open,
  onOpenChange,
  projectId,
  onSuccess
}: AddProjectEventDialogProps) => {
  const form = useForm<ProjectEventFormData>({
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      location_url: "",
      special_requirements: "",
      attendees: 0,
      max_attendees: 0,
      event_type: "in-person",
      eventType: "in-person",
      price: null,
      beneficiary_type: "both",
      beneficiaryType: "both",
      certificate_type: "none",
      certificateType: "none",
      event_path: "environment",
      eventPath: "environment",
      event_category: "social",
      eventCategory: "social",
      event_hours: 0,
      eventHours: 0,
      image_url: "/placeholder.svg",
      imageUrl: "/placeholder.svg"
    }
  });

  const onSubmit = async (data: ProjectEventFormData) => {
    try {
      console.log('Creating new project event:', data);
      
      // First, create the event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert([{
          title: data.title,
          description: data.description,
          date: data.date,
          time: data.time,
          location: data.location,
          location_url: data.location_url,
          special_requirements: data.special_requirements,
          event_type: data.event_type,
          max_attendees: data.max_attendees,
          attendees: data.attendees,
          image_url: data.image_url,
          beneficiary_type: data.beneficiary_type,
          event_path: data.event_path,
          event_category: data.event_category,
          price: data.price,
          event_hours: data.event_hours
        }])
        .select()
        .single();

      if (eventError) throw eventError;

      // Then, link it to the project
      const { error: linkError } = await supabase
        .from('project_events')
        .insert([{
          project_id: projectId,
          event_id: eventData.id,
          event_order: 0
        }]);

      if (linkError) throw linkError;

      toast.success('تم إضافة الفعالية بنجاح');
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error creating project event:', error);
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