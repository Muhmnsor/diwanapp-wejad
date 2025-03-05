
import { Paperclip } from "lucide-react";

interface AttachmentListLoadingProps {
  showTitle?: boolean;
  className?: string;
}

export const AttachmentListLoading = ({ 
  showTitle = true, 
  className = '' 
}: AttachmentListLoadingProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {showTitle && (
        <div className="flex items-center text-sm font-medium mb-2">
          <Paperclip className="h-4 w-4 ml-1" />
          <span>المرفقات</span>
        </div>
      )}
      <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
    </div>
  );
};
