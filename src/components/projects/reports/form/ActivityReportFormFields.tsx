import { UseFormReturn } from "react-hook-form";
import { ReportBasicInfoFields } from "./fields/ReportBasicInfoFields";
import { ActivityDetailsFields } from "./fields/ActivityDetailsFields";
import { ObjectivesImpactFields } from "./fields/ObjectivesImpactFields";
import { ReportPhotosSection } from "./fields/ReportPhotosSection";

interface ActivityReportFormFieldsProps {
  form: UseFormReturn<any>;
}

export const ActivityReportFormFields = ({ form }: ActivityReportFormFieldsProps) => {
  console.log("ActivityReportFormFields - form values:", form.getValues());

  return (
    <div className="space-y-6">
      <ReportBasicInfoFields form={form} />
      <ActivityDetailsFields form={form} />
      <ObjectivesImpactFields form={form} />
      <ReportPhotosSection form={form} />
    </div>
  );
};