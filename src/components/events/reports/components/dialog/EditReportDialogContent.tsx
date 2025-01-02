import { ScrollArea } from "@/components/ui/scroll-area";
import { EditReportFormFields } from "../../form/EditReportFormFields";
import { ProjectActivity } from "@/types/activity";

interface EditReportDialogContentProps {
  formValues: {
    report_name: string;
    program_name: string | null;
    report_text: string;
    detailed_description: string | null;
    activity_duration: string;
    attendees_count: string;
    activity_objectives: string;
    impact_on_participants: string;
    photos: { url: string; description: string; }[];
  };
  setFormValues: (values: any) => void;
  activities: ProjectActivity[];
}

export const EditReportDialogContent = ({
  formValues,
  setFormValues,
  activities
}: EditReportDialogContentProps) => {
  return (
    <ScrollArea className="max-h-[80vh]">
      <div className="p-6">
        <EditReportFormFields
          formValues={formValues}
          setValue={(field: string, value: any) => {
            setFormValues({ ...formValues, [field]: value });
          }}
          activities={activities}
        />
      </div>
    </ScrollArea>
  );
};