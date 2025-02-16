
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
    event_id?: string;
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
      
      const updateData = {
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        location_url: data.location_url,
        special_requirements: data.special_requirements,
        activity_duration: Number(data.activity_duration),
        project_id: projectId,
      };

      if (activity?.id) {
        // تحديث النشاط الموجود
        const { data: updatedActivity, error: updateError } = await supabase
          .from('project_activities')
          .update(updateData)
          .eq('id', activity.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating activity:', updateError);
          throw updateError;
        }

        console.log('Activity updated successfully:', updatedActivity);
        
        // تنفيذ onSuccess فقط بعد نجاح التحديث
        if (onSuccess) {
          await onSuccess();
          toast.success('تم تحديث النشاط بنجاح');
          onCancel?.();
        }
      } else {
        // إنشاء نشاط جديد
        const { data: newActivity, error: insertError } = await supabase
          .from('project_activities')
          .insert([{
            ...updateData,
            is_visible: true
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating activity:', insertError);
          throw insertError;
        }

        console.log('Activity created successfully:', newActivity);
        
        // تنفيذ onSuccess فقط بعد نجاح الإضافة
        if (onSuccess) {
          await onSuccess();
          toast.success('تم إضافة النشاط بنجاح');
          onCancel?.();
        }
      }
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
