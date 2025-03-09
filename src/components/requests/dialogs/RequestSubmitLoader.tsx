
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RequestSubmitLoaderProps {
  isSubmitting: boolean;
  isUploading: boolean;
  progress?: number;
  submissionStep?: string;
  hasError?: boolean;
}

export const RequestSubmitLoader = ({ 
  isSubmitting, 
  isUploading,
  progress = 0,
  submissionStep = "",
  hasError = false
}: RequestSubmitLoaderProps) => {
  if (!isSubmitting && !isUploading) return null;
  
  const showProgress = isUploading && progress > 0;
  const progressColor = hasError ? "bg-red-500" : undefined;
  
  return (
    <div className="mt-4 text-sm">
      <div className="flex items-center mb-2">
        <Loader2 className={`ml-2 h-4 w-4 animate-spin ${hasError ? "text-red-500" : ""}`} />
        <span className={`mr-2 ${hasError ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
          {isUploading ? "جاري رفع الملفات..." : "جاري معالجة الطلب..."}
        </span>
        {submissionStep && (
          <span className={`text-xs ${hasError ? "text-red-400" : "text-muted-foreground"}`}>
            ({submissionStep})
          </span>
        )}
      </div>
      
      {showProgress && (
        <div className="w-full">
          <Progress 
            value={progress} 
            className={`h-2 ${hasError ? "bg-red-200" : ""}`} 
            indicatorClassName={progressColor}
          />
          <div className="text-xs text-center mt-1">{progress}%</div>
        </div>
      )}
      
      {hasError && (
        <Alert variant="destructive" className="mt-3 py-2">
          <AlertDescription className="text-xs">
            حدث خطأ أثناء معالجة الطلب. يرجى التحقق من البيانات والمحاولة مرة أخرى.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
