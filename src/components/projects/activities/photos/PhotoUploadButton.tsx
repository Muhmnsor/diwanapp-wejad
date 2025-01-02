import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus } from "lucide-react";

interface PhotoUploadButtonProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export const PhotoUploadButton = ({ onFileChange, placeholder }: PhotoUploadButtonProps) => {
  return (
    <div className="space-y-2">
      {placeholder && (
        <div className="text-sm text-muted-foreground">
          اقتراح للصورة التالية: {placeholder}
        </div>
      )}
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
          id="photo-upload"
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => document.getElementById('photo-upload')?.click()}
        >
          <ImagePlus className="h-4 w-4 mr-2" />
          إضافة صورة
        </Button>
      </div>
    </div>
  );
};