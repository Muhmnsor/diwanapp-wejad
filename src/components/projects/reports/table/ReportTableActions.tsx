import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";

interface ReportTableActionsProps {
  onDelete: () => void;
}

export const ReportTableActions = ({ onDelete }: ReportTableActionsProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
};