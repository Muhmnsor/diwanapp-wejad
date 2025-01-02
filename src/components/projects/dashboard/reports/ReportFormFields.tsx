import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ReportPhoto } from "@/types/projectReport";
import { ActivityPhotosSection } from "../../activities/photos/ActivityPhotosSection";
import { supabase } from "@/integrations/supabase/client";

interface ReportFormFieldsProps {
  formData: {
    reportText: string;
    objectives: string;
    impact: string;
  };
  setFormData: (data: any) => void;
  photos: ReportPhoto[];
  setPhotos: (photos: ReportPhoto[]) => void;
}

export const ReportFormFields = ({
  formData,
  setFormData,
  photos,
  setPhotos
}: ReportFormFieldsProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoUpload = async (file: File) => {
    try {
      setIsUploading(true);
      console.log('Starting image upload process');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `project-reports/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      console.log('Image uploaded successfully:', publicUrl);

      setPhotos([...photos, { url: publicUrl, description: '' }]);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoDelete = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handlePhotoDescriptionChange = (index: number, description: string) => {
    const newPhotos = [...photos];
    newPhotos[index].description = description;
    setPhotos(newPhotos);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>نص التقرير</Label>
        <Textarea
          value={formData.reportText}
          onChange={(e) => setFormData({ ...formData, reportText: e.target.value })}
          className="h-32"
          dir="rtl"
        />
      </div>

      <div>
        <Label>أهداف النشاط</Label>
        <Textarea
          value={formData.objectives}
          onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
          className="h-32"
          dir="rtl"
        />
      </div>

      <div>
        <Label>الأثر على المستفيدين</Label>
        <Textarea
          value={formData.impact}
          onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
          className="h-32"
          dir="rtl"
        />
      </div>

      <div>
        <Label>صور النشاط</Label>
        <ActivityPhotosSection
          photos={photos}
          onPhotoUpload={handlePhotoUpload}
          onPhotoDelete={handlePhotoDelete}
          onPhotoDescriptionChange={handlePhotoDescriptionChange}
          maxPhotos={6}
        />
      </div>
    </div>
  );
};