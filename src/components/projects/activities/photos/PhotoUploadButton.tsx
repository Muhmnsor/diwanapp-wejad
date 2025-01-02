import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";

interface PhotoUploadButtonProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export const PhotoUploadButton = ({ onFileChange, placeholder }: PhotoUploadButtonProps) => {
  return (
    <div className="space-y-2">
      <label className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          className="w-full h-32 flex flex-col items-center justify-center gap-2 cursor-pointer"
        >
          <ImagePlus className="h-8 w-8" />
          <span className="text-sm">اضغط لإضافة صورة</span>
        </Button>
      </label>
    </div>
  );
};