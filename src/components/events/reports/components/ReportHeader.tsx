import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, FileDown } from "lucide-react";

interface ReportHeaderProps {
  createdAt: string;
  onDelete: () => void;
  onDownload: () => void;
  onEdit: () => void;
  isDeleting?: boolean;
  eventTitle?: string;
}

export const ReportHeader = ({
  onDelete,
  onDownload,
  onEdit,
  isDeleting,
}: ReportHeaderProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onDownload}>
          <FileDown className="h-4 w-4 ml-2" />
          تحميل التقرير مع الصور
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          تعديل التقرير
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          disabled={isDeleting}
          className="text-red-600"
        >
          {isDeleting ? "جاري الحذف..." : "حذف التقرير"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};