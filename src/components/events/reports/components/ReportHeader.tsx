import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";

interface ReportHeaderProps {
  createdAt: string;
  onDownload: () => void;
  onDelete: () => void;
  eventTitle?: string;
}

export const ReportHeader = ({ 
  onDownload,
  onDelete,
}: ReportHeaderProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={onDownload}>
        <Download className="h-4 w-4" />
      </Button>
      <Button variant="destructive" size="icon" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};