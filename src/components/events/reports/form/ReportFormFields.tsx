import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { useState } from "react";

interface ReportFormFieldsProps {
  formValues: any;
  setValue: (name: string, value: any) => void;
}

export const ReportFormFields = ({ formValues, setValue }: ReportFormFieldsProps) => {
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const handlePhotoUpload = async (index: number, file: File) => {
    try {
      setUploadingPhotos(true);
      const photos = [...formValues.photos];
      
      // Upload logic here
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('event-images')
        .upload(fileName, file);

      if (error) throw error;

      const photoUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/event-images/${fileName}`;
      
      photos[index] = {
        ...photos[index],
        url: photoUrl
      };
      
      setValue('photos', photos);
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploadingPhotos(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="program_name">اسم البرنامج</Label>
        <Input
          id="program_name"
          value={formValues.program_name}
          onChange={(e) => setValue('program_name', e.target.value)}
          placeholder="اسم البرنامج"
        />
      </div>

      <div>
        <Label htmlFor="report_name">عنوان التقرير</Label>
        <Input
          id="report_name"
          value={formValues.report_name}
          onChange={(e) => setValue('report_name', e.target.value)}
          placeholder="عنوان التقرير"
        />
      </div>

      <div>
        <Label htmlFor="report_text">نص التقرير</Label>
        <Textarea
          id="report_text"
          value={formValues.report_text}
          onChange={(e) => setValue('report_text', e.target.value)}
          placeholder="نص التقرير"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="detailed_description">الوصف التفصيلي</Label>
        <Textarea
          id="detailed_description"
          value={formValues.detailed_description}
          onChange={(e) => setValue('detailed_description', e.target.value)}
          placeholder="الوصف التفصيلي للنشاط"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="activity_duration">مدة النشاط</Label>
        <Input
          id="activity_duration"
          value={formValues.activity_duration}
          onChange={(e) => setValue('activity_duration', e.target.value)}
          placeholder="مدة النشاط"
        />
      </div>

      <div>
        <Label htmlFor="attendees_count">عدد الحضور</Label>
        <Input
          id="attendees_count"
          value={formValues.attendees_count}
          onChange={(e) => setValue('attendees_count', e.target.value)}
          placeholder="عدد الحضور"
        />
      </div>

      <div>
        <Label htmlFor="activity_objectives">أهداف النشاط</Label>
        <Textarea
          id="activity_objectives"
          value={formValues.activity_objectives}
          onChange={(e) => setValue('activity_objectives', e.target.value)}
          placeholder="أهداف النشاط"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="impact_on_participants">الأثر على المشاركين</Label>
        <Textarea
          id="impact_on_participants"
          value={formValues.impact_on_participants}
          onChange={(e) => setValue('impact_on_participants', e.target.value)}
          placeholder="الأثر على المشاركين"
          rows={4}
        />
      </div>

      <div>
        <Label>الصور</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
          {formValues.photos.map((photo: any, index: number) => (
            <div key={index} className="relative">
              <ImageUpload
                value={photo.url}
                onChange={(file) => handlePhotoUpload(index, file)}
                disabled={uploadingPhotos}
              />
              {photo.url && (
                <Input
                  className="mt-2"
                  placeholder="وصف الصورة"
                  value={photo.description}
                  onChange={(e) => {
                    const photos = [...formValues.photos];
                    photos[index] = {
                      ...photos[index],
                      description: e.target.value
                    };
                    setValue('photos', photos);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};