import { useState } from "react";
import { Event } from "@/store/eventStore";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { ProjectEventFormData } from "../types";
import { EventBasicFields } from "./EventBasicFields";
import { EventDateTimeFields } from "./EventDateTimeFields";
import { EventLocationFields } from "./EventLocationFields";

interface EditProjectEventFormContainerProps {
  event: Event;
  onSave: (updatedEvent: Event) => void;
  onCancel: () => void;
  projectId: string;
}

export const EditProjectEventFormContainer = ({
  event,
  onSave,
  onCancel,
  projectId
}: EditProjectEventFormContainerProps) => {
  console.log('Form data in EditProjectEventForm:', event, 'Project ID:', projectId);
  
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProjectEventFormData>({
    defaultValues: {
      title: event.title,
      description: event.description || "",
      date: event.date,
      time: event.time,
      location: event.location,
      location_url: event.location_url || "",
      special_requirements: event.special_requirements || "",
    },
  });

  const handleSubmit = async (data: ProjectEventFormData) => {
    setIsLoading(true);
    try {
      const updatedEvent = {
        ...event,
        ...data,
      };
      await onSave(updatedEvent);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <EventBasicFields form={form} />
      <EventDateTimeFields form={form} />
      <EventLocationFields form={form} />
      
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} variant="outline" type="button">
          إلغاء
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري الحفظ...
            </span>
          ) : (
            "حفظ التغييرات"
          )}
        </Button>
      </div>
    </form>
  );
};
