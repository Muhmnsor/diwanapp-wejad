import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ProjectActivityFormData } from "@/types/activity";
import { ActivityBasicFields } from "./ActivityBasicFields";
import { ActivityDateTimeFields } from "./ActivityDateTimeFields";
import { ActivityLocationFields } from "./ActivityLocationFields";
import { EditActivityFormActions } from "./EditActivityFormActions";

interface EditActivityFormProps {
  activity: {
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
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  handleSubmit: (data: ProjectActivityFormData) => Promise<void>;
}

export const EditActivityForm = ({ 
  activity,
  onSave,
  onCancel,
  isLoading,
  handleSubmit: onSubmit
}: EditActivityFormProps) => {
  const form = useForm<ProjectActivityFormData>({
    defaultValues: {
      title: activity.title || "",
      description: activity.description || "",
      date: activity.date || "",
      time: activity.time || "",
      location: activity.location || "",
      location_url: activity.location_url || "",
      special_requirements: activity.special_requirements || "",
      event_hours: activity.event_hours || 0,
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pr-4">
        <ActivityBasicFields form={form} />
        <ActivityDateTimeFields form={form} />
        <ActivityLocationFields form={form} />
        
        <EditActivityFormActions 
          onCancel={onCancel}
          isLoading={isLoading}
        />
      </form>
    </Form>
  );
};