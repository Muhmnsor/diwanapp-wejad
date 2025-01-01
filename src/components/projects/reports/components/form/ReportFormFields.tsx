import { PhotosField } from "@/components/events/reports/form/PhotosField";
import { ReportNameField } from "@/components/events/reports/form/ReportNameField";
import { ReportTextField } from "@/components/events/reports/form/ReportTextField";
import { EventMetadataFields } from "@/components/events/reports/form/EventMetadataFields";
import { EventObjectivesField } from "@/components/events/reports/form/EventObjectivesField";
import { ImpactField } from "@/components/events/reports/form/ImpactField";
import { ReportFormData } from "../../types/reportTypes";

interface ReportFormFieldsProps {
  formData: ReportFormData;
  onChange: (data: ReportFormData) => void;
}

export const ReportFormFields = ({
  formData,
  onChange
}: ReportFormFieldsProps) => {
  const updateField = (field: keyof ReportFormData, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <>
      <ReportNameField
        value={formData.reportName}
        programName={formData.programName}
        onChange={(value) => updateField('reportName', value)}
        onProgramNameChange={(value) => updateField('programName', value)}
      />

      <ReportTextField
        value={formData.reportText}
        onChange={(value) => updateField('reportText', value)}
      />

      <EventMetadataFields
        duration={formData.activityDuration}
        attendeesCount={formData.attendeesCount}
        onDurationChange={(value) => updateField('activityDuration', value)}
        onAttendeesCountChange={(value) => updateField('attendeesCount', value)}
      />

      <EventObjectivesField
        value={formData.activityObjectives}
        onChange={(value) => updateField('activityObjectives', value)}
      />

      <ImpactField
        value={formData.impactOnParticipants}
        onChange={(value) => updateField('impactOnParticipants', value)}
      />

      <PhotosField
        photos={formData.photos}
        onPhotosChange={(value) => updateField('photos', value)}
      />
    </>
  );
};