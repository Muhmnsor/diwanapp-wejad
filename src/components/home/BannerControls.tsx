import { ImageUpload } from "@/components/ui/image-upload";
import { Button } from "@/components/ui/button";

interface BannerControlsProps {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  desktopImage: string;
  mobileImage: string;
  onDesktopImageUpload: (file: File) => void;
  onMobileImageUpload: (file: File) => void;
  onSave: () => void;
  isSubmitting: boolean;
}

export const BannerControls = ({
  isEditing,
  setIsEditing,
  desktopImage,
  mobileImage,
  onDesktopImageUpload,
  onMobileImageUpload,
  onSave,
  isSubmitting,
}: BannerControlsProps) => {
  if (!isEditing) {
    return (
      <Button 
        onClick={() => setIsEditing(true)}
        className="w-full md:w-auto"
      >
        تعديل البانر
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">صورة سطح المكتب</label>
          <ImageUpload 
            value={desktopImage} 
            onChange={onDesktopImageUpload}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">صورة الجوال</label>
          <ImageUpload 
            value={mobileImage} 
            onChange={onMobileImageUpload}
          />
        </div>
      </div>
      <Button 
        onClick={onSave}
        disabled={isSubmitting || !desktopImage || !mobileImage}
        className="w-full md:w-auto"
      >
        {isSubmitting ? "جاري الحفظ..." : "حفظ البانر"}
      </Button>
    </div>
  );
};