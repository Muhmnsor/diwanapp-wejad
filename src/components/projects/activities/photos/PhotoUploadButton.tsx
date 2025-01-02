import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus } from "lucide-react";

interface PhotoUploadButtonProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export const PhotoUploadButton = ({ onFileChange, placeholder }: PhotoUploadButtonProps) => {
  return (
    <div className="flex items-center gap-4">
      <Input
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
        id="photo-upload"
      />
      <Label
        htmlFor="photo-upload"
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md cursor-pointer"
      >
        <ImagePlus className="h-4 w-4" />
        إضافة صورة
      </Label>
      {placeholder && (
        <span className="text-sm text-muted-foreground">
          اقتراح: {placeholder}
        </span>
      )}
    </div>
  );
};