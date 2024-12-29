import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ProjectActivityFormData } from "@/types/activity";
import { ActivityBasicFields } from "./ActivityBasicFields";
import { ActivityDateTimeFields } from "./ActivityDateTimeFields";
import { ActivityLocationFields } from "./ActivityLocationFields";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
  handleSubmit
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

  const onSubmit = form.handleSubmit(handleSubmit);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6 pr-4">
        <ActivityBasicFields form={form} />
        <ActivityDateTimeFields form={form} />
        <ActivityLocationFields form={form} />
        
        <FormField
          control={form.control}
          name="event_hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>مدة النشاط (بالساعات)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  min="0"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <EditActivityFormActions 
          onCancel={onCancel}
          isLoading={isLoading}
        />
      </form>
    </Form>
  );
};