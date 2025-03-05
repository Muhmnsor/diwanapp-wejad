
import { Calendar, Clock, GitMerge, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BasicMetadataProps {
  dueDate?: string | null;
  projectName?: string | null;
  isSubtask: boolean;
  parentTaskId?: string | null;
  showFileUploadButton?: boolean;
  onFileUpload?: () => void;
}

export const BasicMetadata = ({ 
  dueDate, 
  projectName,
  isSubtask,
  parentTaskId,
  showFileUploadButton,
  onFileUpload
}: BasicMetadataProps) => {
  if (!dueDate && !projectName && !isSubtask) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3">
        {dueDate && (
          <div className="flex items-center text-xs">
            <Clock className="h-3.5 w-3.5 ml-1 text-gray-500" />
            <span className="text-gray-700">{formatDate(dueDate)}</span>
          </div>
        )}
        
        {projectName && (
          <div className="flex items-center text-xs">
            <Calendar className="h-3.5 w-3.5 ml-1 text-gray-500" />
            <span className="text-gray-700">{projectName}</span>
          </div>
        )}
        
        {isSubtask && parentTaskId && (
          <div className="flex items-center text-xs">
            <GitMerge className="h-3.5 w-3.5 ml-1 text-gray-500" />
            <span className="text-gray-700">مهمة فرعية</span>
          </div>
        )}

        {showFileUploadButton && onFileUpload && (
          <div className="flex items-center ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 p-0 h-auto"
              onClick={onFileUpload}
            >
              <Upload className="h-3 w-3 ml-1" />
              رفع ملف
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
