import { ReportNameField } from "@/components/events/reports/form/ReportNameField";
import { ReportTextField } from "@/components/events/reports/form/ReportTextField";
import { EventMetadataFields } from "@/components/events/reports/form/EventMetadataFields";
import { EventObjectivesField } from "@/components/events/reports/form/EventObjectivesField";
import { ImpactField } from "@/components/events/reports/form/ImpactField";
import { PhotosField } from "@/components/events/reports/form/PhotosField";
import { ProjectActivity } from "@/types/activity";

interface ReportFormFieldsProps {
  reportName: string;
  programName: string;
  reportText: string;
  activityDuration: string;
  attendeesCount: string;
  activityObjectives: string;
  impactOnParticipants: string;
  photos: { url: string; description: string; }[];
  activities: ProjectActivity[];
  onReportNameChange: (value: string) => void;
  onProgramNameChange: (value: string) => void;
  onReportTextChange: (value: string) => void;
  onActivityDurationChange: (value: string) => void;
  onAttendeesCountChange: (value: string) => void;
  onActivityObjectivesChange: (value: string) => void;
  onImpactChange: (value: string) => void;
  onPhotosChange: (photos: { url: string; description: string; }[]) => void;
}

export const ReportFormFields = ({
  reportName,
  programName,
  reportText,
  activityDuration,
  attendeesCount,
  activityObjectives,
  impactOnParticipants,
  photos,
  activities,
  onReportNameChange,
  onProgramNameChange,
  onReportTextChange,
  onActivityDurationChange,
  onAttendeesCountChange,
  onActivityObjectivesChange,
  onImpactChange,
  onPhotosChange,
}: ReportFormFieldsProps) => {
  return (
    <div className="space-y-6">
      <ReportNameField
        value={reportName}
        programName={programName}
        activities={activities}
        onChange={onReportNameChange}
        onProgramNameChange={onProgramNameChange}
      />

      <ReportTextField
        value={reportText}
        onChange={onReportTextChange}
      />

      <EventMetadataFields
        duration={activityDuration}
        attendeesCount={attendeesCount}
        onDurationChange={onActivityDurationChange}
        onAttendeesCountChange={onAttendeesCountChange}
      />

      <EventObjectivesField
        value={activityObjectives}
        onChange={onActivityObjectivesChange}
      />

      <ImpactField
        value={impactOnParticipants}
        onChange={onImpactChange}
      />

      <PhotosField
        photos={photos}
        onPhotosChange={onPhotosChange}
      />
    </div>
  );
};