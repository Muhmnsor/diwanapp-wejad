import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";

interface PhotoUploadButtonProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export const PhotoUploadButton = ({ onFileChange, placeholder }: PhotoUploadButtonProps) => {
  console.log('Rendering PhotoUploadButton with placeholder:', placeholder);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File selected:', e.target.files?.[0]);
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e);
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
            // Trigger the hidden file input when the button is clicked
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            fileInput?.click();
          }}
        >
          <ImagePlus className="h-8 w-8" />
          <span className="text-sm">اضغط لإضافة صورة</span>
          {placeholder && (
            <span className="text-xs text-muted-foreground text-center px-2">
              {placeholder}
            </span>
          )}
        </Button>
      </label>
    </div>
  );
};