import { Button } from "@/components/ui/button";
import { Eye, Download, RefreshCw } from "lucide-react";

interface PreviewActionsProps {
  onPreview: () => Promise<void>;
  onDownload: () => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export const PreviewActions = ({ 
  onPreview, 
  onDownload, 
  onClose,
  isLoading 
}: PreviewActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
      >
        إغلاق
      </Button>
      <Button
        variant="outline"
        onClick={onPreview}
        disabled={isLoading}
      >
        {isLoading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Eye className="h-4 w-4 ml-2" />
        )}
        معاينة
      </Button>
      <Button
        onClick={onDownload}
        disabled={isLoading}
      >
        {isLoading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4 ml-2" />
        )}
        تحميل
      </Button>
    </div>
  );
};