
import { Button } from "@/components/ui/button";
import { Edit, Download, Trash } from "lucide-react";

interface ProjectReportActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  onDownload: () => void;
  isDeleting: boolean;
}

export const ProjectReportActions = ({
  onEdit,
  onDelete,
  onDownload,
  isDeleting,
}: ProjectReportActionsProps) => {
  return (
    <div className="flex justify-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
        className="h-8 w-8"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDownload}
        className="h-8 w-8"
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        disabled={isDeleting}
        className="h-8 w-8 text-destructive"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};
