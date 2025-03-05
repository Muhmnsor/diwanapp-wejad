
import { Skeleton } from "@/components/ui/skeleton";
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
          <span>المستلمات</span>
        </div>
      )}
      
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center bg-gray-50 rounded p-2">
            <Skeleton className="h-4 w-4 ml-2" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
};
