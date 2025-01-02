import { ActivityReportFormData } from "@/types/activityReport";
import { ProjectActivity } from "@/types/activity";
import { ReportBasicFields } from "../../form/fields/ReportBasicFields";
import { ReportDetailsFields } from "../../form/fields/ReportDetailsFields";
import { ReportObjectivesFields } from "../../form/fields/ReportObjectivesFields";
import { ActivityPhotosSection } from "@/components/projects/activities/photos/ActivityPhotosSection";
import { handleImageUpload } from "@/components/events/form/EventImageUpload";
import { toast } from "sonner";

interface EditReportDialogContentProps {
  formValues: ActivityReportFormData;
  setFormValues: (values: ActivityReportFormData) => void;
  activities: ProjectActivity[];
}

export const EditReportDialogContent = ({
  formValues,
  setFormValues,
  activities,
}: EditReportDialogContentProps) => {
  console.log('EditReportDialogContent - Current form values:', formValues);

  const handleChange = (field: keyof ActivityReportFormData, value: any) => {
    setFormValues({ ...formValues, [field]: value });
  };

  const handlePhotoUpload = async (file: File) => {
    try {
      const { publicUrl, error } = await handleImageUpload(file, 'project');
      if (error) throw error;
      
      const currentPhotos = formValues.photos || [];
      const newPhoto = { url: publicUrl, description: '' };
      handleChange('photos', [...currentPhotos, newPhoto]);
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error("حدث خطأ أثناء رفع الصورة");
    }
  };

  const handlePhotoDelete = (index: number) => {
    const currentPhotos = [...formValues.photos];
    currentPhotos.splice(index, 1);
    handleChange('photos', currentPhotos);
  };

  const handlePhotoDescriptionChange = (index: number, description: string) => {
    const currentPhotos = [...formValues.photos];
    currentPhotos[index] = { ...currentPhotos[index], description };
    handleChange('photos', currentPhotos);
  };

  return (
    <div className="space-y-6">
      <ReportBasicFields 
        formValues={formValues}
        onChange={handleChange}
      />
      
      <ReportDetailsFields 
        formValues={formValues}
        onChange={handleChange}
      />
      
      <ReportObjectivesFields 
        formValues={formValues}
        onChange={handleChange}
      />

      <ActivityPhotosSection
        photos={formValues.photos}
        onPhotoUpload={handlePhotoUpload}
        onPhotoDelete={handlePhotoDelete}
        onPhotoDescriptionChange={handlePhotoDescriptionChange}
        maxPhotos={6}
        photoPlaceholders={[
          "صورة تظهر تفاعل المستفيدين والجمهور مع المحتوى",
          "صورة توضح مكان إقامة النشاط",
          "صورة للمتحدثين أو المدربين",
          "صورة للمواد التدريبية أو التعليمية",
          "صورة للأنشطة التفاعلية",
          "صورة ختامية للنشاط"
        ]}
      />
    </div>
  );
};