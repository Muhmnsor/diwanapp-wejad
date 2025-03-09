
import { Loader2 } from "lucide-react";

interface RequestSubmitLoaderProps {
  isSubmitting: boolean;
  isUploading: boolean;
}

export const RequestSubmitLoader = ({ isSubmitting, isUploading }: RequestSubmitLoaderProps) => {
  if (!isSubmitting && !isUploading) return null;
  
  return (
    <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
      {isUploading ? "جاري رفع الملفات..." : "جاري معالجة الطلب..."}
    </div>
  );
};
