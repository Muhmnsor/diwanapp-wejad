import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhotosSection } from "@/components/events/reports/PhotosSection";
import { handleImageUpload } from "@/components/events/form/EventImageUpload";
import { toast } from "sonner";

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
  activities: any[];
}

export const EditReportDialogContent = ({
  formValues,
  setFormValues,
  activities,
}: EditReportDialogContentProps) => {
  const handleChange = (field: string, value: any) => {
    setFormValues({ ...formValues, [field]: value });
  };

  const handlePhotoUpload = async (file: File) => {
    try {
      const { publicUrl, error } = await handleImageUpload(file, 'project');
      if (error) throw error;
      
      const newPhoto = { url: publicUrl, description: '' };
      handleChange('photos', [...formValues.photos, newPhoto]);
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error("حدث خطأ أثناء رفع الصورة");
    }
  };

  const handlePhotoDelete = (index: number) => {
    const newPhotos = formValues.photos.filter((_, i) => i !== index);
    handleChange('photos', newPhotos);
  };

  const handlePhotoDescriptionChange = (index: number, description: string) => {
    const newPhotos = formValues.photos.map((photo, i) => 
      i === index ? { ...photo, description } : photo
    );
    handleChange('photos', newPhotos);
  };

  return (
    <div className="space-y-4 my-4">
      <div>
        <Label htmlFor="report_name">اسم التقرير</Label>
        <Input
          id="report_name"
          value={formValues.report_name}
          onChange={(e) => handleChange('report_name', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="program_name">اسم البرنامج</Label>
        <Input
          id="program_name"
          value={formValues.program_name || ''}
          onChange={(e) => handleChange('program_name', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="report_text">نص التقرير</Label>
        <Textarea
          id="report_text"
          value={formValues.report_text}
          onChange={(e) => handleChange('report_text', e.target.value)}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="detailed_description">التفاصيل</Label>
        <Textarea
          id="detailed_description"
          value={formValues.detailed_description || ''}
          onChange={(e) => handleChange('detailed_description', e.target.value)}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="activity_duration">مدة النشاط</Label>
        <Input
          id="activity_duration"
          value={formValues.activity_duration}
          onChange={(e) => handleChange('activity_duration', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="attendees_count">عدد المشاركين</Label>
        <Input
          id="attendees_count"
          value={formValues.attendees_count}
          onChange={(e) => handleChange('attendees_count', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="activity_objectives">أهداف النشاط</Label>
        <Textarea
          id="activity_objectives"
          value={formValues.activity_objectives}
          onChange={(e) => handleChange('activity_objectives', e.target.value)}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="impact_on_participants">الأثر على المشاركين</Label>
        <Textarea
          id="impact_on_participants"
          value={formValues.impact_on_participants}
          onChange={(e) => handleChange('impact_on_participants', e.target.value)}
          rows={4}
        />
      </div>

      <div>
        <Label>الصور</Label>
        <PhotosSection
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
    </div>
  );
};