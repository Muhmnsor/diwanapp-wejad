
import { useState } from "react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { Photo } from "../types";

interface ReportPhotoUploadProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
}

export const ReportPhotoUpload = ({ photos, onPhotosChange }: ReportPhotoUploadProps) => {
  const handlePhotoUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      onPhotosChange([...photos, { url: publicUrl, description: "" }]);
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('حدث خطأ أثناء رفع الصورة');
    }
  };

  const handlePhotoDescriptionChange = (index: number, description: string) => {
    const newPhotos = [...photos];
    newPhotos[index].description = description;
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-4">
      <FormLabel>صور الفعالية</FormLabel>
      <ImageUpload onChange={handlePhotoUpload} />
      
      {photos.map((photo, index) => (
        <div key={index} className="flex items-start gap-4">
          <img src={photo.url} alt="" className="w-24 h-24 object-cover rounded" />
          <Input
            placeholder="وصف الصورة"
            value={photo.description}
            onChange={(e) => handlePhotoDescriptionChange(index, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};
