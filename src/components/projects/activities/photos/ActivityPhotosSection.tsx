import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ActivityPhotosSectionProps {
  photos: { url: string; description: string; index?: number }[];
  onPhotoUpload: (file: File, index: number) => Promise<void>;
  onPhotoDelete: (index: number) => void;
  onPhotoDescriptionChange: (index: number, description: string) => void;
  maxPhotos?: number;
}

const photoPlaceholders = [
  "صورة المقدم وخلفه الشاشة او مايدل على النشاط",
  "تفاعل المقدم مع المستفيدين",
  "الضيافة ان وجدت قبل استهلاكها",
  "تفاعل المستفيدين او الجمهور",
  "صورة جماعية",
  "صورة فردية لمستفيد متفاعل"
];

export const ActivityPhotosSection = ({
  photos,
  onPhotoUpload,
  onPhotoDelete,
  onPhotoDescriptionChange,
  maxPhotos = 6
}: ActivityPhotosSectionProps) => {
  console.log('ActivityPhotosSection - Current photos:', photos);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    console.log(`Handling file change for slot ${slotIndex}`);
    const file = e.target.files?.[0];
    if (!file) {
      console.log(`No file selected for slot ${slotIndex}`);
      return;
    }

    try {
      console.log(`Uploading file for slot ${slotIndex}:`, file.name);
      await onPhotoUpload(file, slotIndex);
      console.log(`Successfully uploaded file to slot ${slotIndex}`);
    } catch (error) {
      console.error(`Error uploading file to slot ${slotIndex}:`, error);
    }
  };

  // Create an array of photo slots with proper indexing
  const photoSlots = Array(maxPhotos).fill(null).map((_, index) => {
    // Find photo with matching index, if it exists
    const photo = photos.find(p => p?.index === index) || photos[index];
    const placeholder = photoPlaceholders[index];

    return (
      <Card key={`photo-slot-${index}`} className="p-4 space-y-4">
        <div className="text-sm text-muted-foreground">
          {placeholder}
        </div>

        {photo ? (
          <div className="space-y-4">
            <div className="relative aspect-video">
              <img
                src={photo.url}
                alt={`صورة ${index + 1}`}
                className="rounded-md object-cover w-full h-full"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => {
                console.log(`Deleting photo from slot ${index}`);
                onPhotoDelete(index);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              حذف الصورة
            </Button>
          </div>
        ) : (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, index)}
              className="hidden"
              id={`photo-upload-${index}`}
            />
            <label htmlFor={`photo-upload-${index}`}>
              <Button
                type="button"
                variant="outline"
                className="w-full h-32 flex flex-col items-center justify-center gap-2 cursor-pointer"
                asChild
              >
                <div>
                  <ImagePlus className="h-8 w-8" />
                  <span className="text-sm">اضغط لإضافة صورة</span>
                </div>
              </Button>
            </label>
          </div>
        )}
      </Card>
    );
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photoSlots}
      </div>
    </div>
  );
};