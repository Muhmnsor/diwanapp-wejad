import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ProjectActivityFormData } from "@/types/activity";
import { ActivityBasicFields } from "./ActivityBasicFields";
import { ActivityDateTimeFields } from "./ActivityDateTimeFields";
import { ActivityLocationFields } from "./ActivityLocationFields";
import { EditActivityFormActions } from "./EditActivityFormActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditActivityFormProps {
  activity?: {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    location_url?: string;
    special_requirements?: string;
    event_hours: number;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
  projectId: string;
}

export const EditActivityForm = ({ 
  activity,
  onSuccess,
  onCancel,
  projectId
}: EditActivityFormProps) => {
  console.log('EditActivityForm - Initializing with:', { activity, projectId });
  
  const form = useForm<ProjectActivityFormData>({
    defaultValues: activity ? {
      title: activity.title,
      description: activity.description,
      date: activity.date,
      time: activity.time,
      location: activity.location,
      location_url: activity.location_url || "",
      special_requirements: activity.special_requirements || "",
      event_hours: activity.event_hours,
    } : {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      location_url: "",
      special_requirements: "",
      event_hours: 0,
    }
  });

  const handleSubmit = async (data: ProjectActivityFormData) => {
    console.log('EditActivityForm - Submitting form with data:', data);
    try {
      const eventData = {
        ...data,
        project_id: projectId,
        is_project_activity: true,
        event_type: 'in-person',
        image_url: '/placeholder.svg', // Add default image_url
      };

      const { error } = activity 
        ? await supabase
            .from('events')
            .update(eventData)
            .eq('id', activity.id)
        : await supabase
            .from('events')
            .insert([eventData]);

      if (error) throw error;

      toast.success(activity ? 'تم تحديث النشاط بنجاح' : 'تم إضافة النشاط بنجاح');
      onSuccess?.();
    } catch (error) {
      console.error('Error saving activity:', error);
      toast.error('حدث خطأ أثناء حفظ النشاط');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 text-right" dir="rtl">
        <ActivityBasicFields form={form} />
        <ActivityDateTimeFields form={form} />
        <ActivityLocationFields form={form} />
        
        <EditActivityFormActions 
          onCancel={onCancel}
          isLoading={form.formState.isSubmitting}
        />
      </form>
    </Form>
  );
};