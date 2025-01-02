import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";

interface PhotoUploadButtonProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export const PhotoUploadButton = ({ onFileChange, placeholder }: PhotoUploadButtonProps) => {
  console.log('Rendering PhotoUploadButton for placeholder:', placeholder);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input change detected');
    if (e.target.files && e.target.files.length > 0) {
      console.log('File selected:', {
        name: e.target.files[0].name,
        type: e.target.files[0].type,
        size: e.target.files[0].size
      });
      onFileChange(e);
    } else {
      console.log('No file selected in input change handler');
    }
  };

  return (
    <div className="space-y-2">
      <label className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          aria-label={`Upload ${placeholder || 'photo'}`}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full h-32 flex flex-col items-center justify-center gap-2 cursor-pointer"
          onClick={() => {
            console.log('Upload button clicked');
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            fileInput?.click();
          }}
        >
          <ImagePlus className="h-8 w-8" />
          <span className="text-sm">اضغط لإضافة صورة</span>
        </Button>
      </label>
    </div>
  );
};