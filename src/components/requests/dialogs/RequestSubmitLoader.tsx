
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RequestSubmitLoaderProps {
  isSubmitting: boolean;
  isUploading: boolean;
  progress?: number;
}

export const RequestSubmitLoader = ({ 
  isSubmitting, 
  isUploading,
  progress = 0
}: RequestSubmitLoaderProps) => {
  if (!isSubmitting && !isUploading) return null;
  
  const showProgress = isUploading && progress > 0;
  
  return (
    <div className="mt-4 text-sm text-muted-foreground">
      <div className="flex items-center mb-2">
        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
        <span className="mr-2">
          {isUploading ? "جاري رفع الملفات..." : "جاري معالجة الطلب..."}
        </span>
      </div>
      
      {showProgress && (
        <div className="w-full">
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-center mt-1">{progress}%</div>
        </div>
      )}
    </div>
  );
};
