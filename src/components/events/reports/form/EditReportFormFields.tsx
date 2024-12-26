import { ReportNameField } from "./ReportNameField";
import { ReportTextField } from "./ReportTextField";
import { EventMetadataFields } from "./EventMetadataFields";
import { EventObjectivesField } from "./EventObjectivesField";
import { ImpactField } from "./ImpactField";
import { PhotosField } from "./PhotosField";
import { PhotosGallery } from "../PhotosGallery";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EditReportFormFieldsProps {
  formValues: {
    program_name: string;
    report_name: string;
    report_text: string;
    detailed_description: string;
    event_duration: string;
    attendees_count: string;
    event_objectives: string;
    impact_on_participants: string;
    photos: { url: string; description: string; }[];
  };
  setValue: (field: string, value: any) => void;
}

export const EditReportFormFields = ({ formValues, setValue }: EditReportFormFieldsProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `event-reports/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(fileName);

      const newPhotos = [...formValues.photos];
      const nextIndex = newPhotos.length;
      const photoDescriptions = [
        "صورة للمشاركين في الفعالية",
        "صورة لتفاعل المقدم مع الحضور",
        "صورة للمواد التدريبية والأدوات المستخدمة",
        "صورة لأنشطة المجموعات",
        "صورة للعرض التقديمي",
        "صورة للحظات المميزة في الفعالية"
      ];

      newPhotos.push({
        url: publicUrl,
        description: photoDescriptions[nextIndex] || `صورة ${nextIndex + 1}`
      });

      setValue('photos', newPhotos);
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error("حدث خطأ أثناء رفع الصورة");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoDelete = (index: number) => {
    const newPhotos = formValues.photos.filter((_, i) => i !== index);
    setValue('photos', newPhotos);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <ReportNameField
        value={formValues.report_name}
        programName={formValues.program_name}
        onChange={(value) => setValue('report_name', value)}
        onProgramNameChange={(value) => setValue('program_name', value)}
      />

      <ReportTextField
        value={formValues.report_text}
        onChange={(value) => setValue('report_text', value)}
      />

      <EventMetadataFields
        duration={formValues.event_duration}
        attendeesCount={formValues.attendees_count}
        onDurationChange={(value) => setValue('event_duration', value)}
        onAttendeesCountChange={(value) => setValue('attendees_count', value)}
      />

      <EventObjectivesField
        value={formValues.event_objectives}
        onChange={(value) => setValue('event_objectives', value)}
      />

      <ImpactField
        value={formValues.impact_on_participants}
        onChange={(value) => setValue('impact_on_participants', value)}
      />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">صور التقرير</h3>
        <PhotosField
          photos={formValues.photos}
          onPhotosChange={(photos) => setValue('photos', photos)}
        />
        {formValues.photos && formValues.photos.length > 0 && (
          <PhotosGallery
            photos={formValues.photos}
            onDelete={handlePhotoDelete}
          />
        )}
      </div>
    </div>
  );
};