import { ScrollArea } from "@/components/ui/scroll-area";
import { EditReportFormFields } from "../../form/EditReportFormFields";
import { Report } from "@/types/report";
import { ProjectActivity } from "@/types/activity";

interface EditReportDialogContentProps {
  formValues: any;
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