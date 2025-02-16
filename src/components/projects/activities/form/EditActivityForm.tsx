
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ProjectActivityFormData } from "@/types/activity";
import { ActivityFormFields } from "./fields/ActivityFormFields";
import { ActivityFormActions } from "./actions/ActivityFormActions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EditActivityFormProps {
  activity?: {
    id?: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    location_url?: string;
    special_requirements?: string;
    activity_duration: number;
  } | null;
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
      activity_duration: activity.activity_duration,
    } : {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      location_url: "",
      special_requirements: "",
      activity_duration: 0,
    }
  });

  const handleSubmit = async (data: ProjectActivityFormData) => {
    try {
      console.log('Submitting form with data:', { ...data, projectId, activityId: activity?.id });
      
      if (activity?.id) {
        // تحديث النشاط الموجود في جدول project_activities
        const { error: updateError } = await supabase
          .from('project_activities')
          .update({
            title: data.title,
            description: data.description,
            date: data.date,
            time: data.time,
            location: data.location,
            location_url: data.location_url,
            special_requirements: data.special_requirements,
            activity_duration: data.activity_duration
          })
          .eq('id', activity.id);

        if (updateError) {
          console.error('Error updating activity:', updateError);
          throw updateError;
        }

        // تحديث النشاط في جدول events أيضاً إذا كان موجوداً
        if (activity.event_id) {
          const { error: eventUpdateError } = await supabase
            .from('events')
            .update({
              title: data.title,
              description: data.description,
              date: data.date,
              time: data.time,
              location: data.location,
              location_url: data.location_url,
              special_requirements: data.special_requirements,
              event_hours: data.activity_duration
            })
            .eq('id', activity.event_id);

          if (eventUpdateError) {
            console.error('Error updating event:', eventUpdateError);
            throw eventUpdateError;
          }
        }

        toast.success('تم تحديث النشاط بنجاح');
      } else {
        // إنشاء نشاط جديد
        const { error: insertError } = await supabase
          .from('project_activities')
          .insert([{
            ...data,
            project_id: projectId,
            is_visible: true
          }]);

        if (insertError) {
          console.error('Error creating activity:', insertError);
          throw insertError;
        }
        toast.success('تم إضافة النشاط بنجاح');
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving activity:', error);
      toast.error('حدث خطأ أثناء حفظ النشاط');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 text-right" dir="rtl">
        <ActivityFormFields form={form} />
        <ActivityFormActions 
          onCancel={onCancel}
          isLoading={form.formState.isSubmitting}
        />
      </form>
    </Form>
  );
};
