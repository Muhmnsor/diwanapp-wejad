import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ProjectActivityFormData } from "@/types/activity";
import { ActivityFormFields } from "./fields/ActivityFormFields";
import { ActivityFormActions } from "./actions/ActivityFormActions";
import { toast } from "sonner";

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
    event_hours: number;
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
    try {
      const eventData = {
        ...data,
        project_id: projectId,
        is_project_activity: true,
        event_type: 'in-person',
        image_url: '/placeholder.svg',
      };

      console.log('Submitting form with data:', eventData);
      
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
        <ActivityFormFields form={form} />
        <ActivityFormActions 
          onCancel={onCancel}
          isLoading={form.formState.isSubmitting}
        />
      </form>
    </Form>
  );
};