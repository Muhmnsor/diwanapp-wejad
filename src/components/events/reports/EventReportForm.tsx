
import React from "react";
import { Form } from "@/components/ui/form";
import { ReportPhotoUpload } from "./components/ReportPhotoUpload";
import { ReportMetricsFields } from "./components/ReportMetricsFields";
import { ReportBasicFields } from "./components/ReportBasicFields";
import { ReportDescriptionFields } from "./components/ReportDescriptionFields";
import { ReportFeedbackComments } from "./components/ReportFeedbackComments";
import { ReportFormActions } from "./components/ReportFormActions";
import { ReportExtraFields } from "./components/ReportExtraFields";
import { EventReportFormProps } from "./types";
import { useReportForm } from "@/hooks/reports/useReportForm";

export const EventReportForm: React.FC<EventReportFormProps> = ({ 
  eventId, 
  onClose,
  initialData,
  mode = 'create'
}) => {
  const {
    form,
    photos,
    setPhotos,
    isSubmitting,
    onSubmit
  } = useReportForm(eventId, initialData, onClose, mode);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <ReportBasicFields form={form} />
        <ReportDescriptionFields form={form} />
        <ReportExtraFields form={form} eventId={eventId} />
        <ReportMetricsFields form={form} eventId={eventId} />
        <ReportPhotoUpload photos={photos} onPhotosChange={setPhotos} />
        <ReportFeedbackComments eventId={eventId} />
        <ReportFormActions 
          isSubmitting={isSubmitting} 
          onClose={onClose}
          mode={mode} 
        />
      </form>
    </Form>
  );
};
