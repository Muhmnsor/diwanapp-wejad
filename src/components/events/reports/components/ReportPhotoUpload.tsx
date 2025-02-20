
import { useState } from "react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import { FormLabel } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { Photo } from "../types";
import { photoPlaceholders } from "@/utils/reports/constants";

interface ReportPhotoUploadProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
}

export const ReportPhotoUpload = ({ photos, onPhotosChange }: ReportPhotoUploadProps) => {
  const handlePhotoUpload = async (file: File, index: number) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      const newPhotos = [...photos];
      newPhotos[index] = { url: publicUrl, description: photoPlaceholders[index] };
      onPhotosChange(newPhotos);
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('حدث خطأ أثناء رفع الصورة');
    }
  };

  return (
    <div className="space-y-4">
      <FormLabel>صور الفعالية</FormLabel>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photoPlaceholders.map((placeholder, index) => (
          <div key={index} className="space-y-2 bg-muted/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">{placeholder}</p>
            <ImageUpload 
              value={photos[index]?.url}
              onChange={(file) => handlePhotoUpload(file, index)}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
