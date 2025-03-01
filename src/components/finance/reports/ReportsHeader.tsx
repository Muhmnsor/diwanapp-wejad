
import { DownloadIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReportsHeaderProps {
  title?: string;
  onExport?: (reportType: string) => void;
  isExporting?: boolean;
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({
  title = "التقارير المالية",
  onExport,
  isExporting = false
}) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">{title}</h2>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2" disabled={isExporting}>
            <DownloadIcon className="h-4 w-4" />
            <span>{isExporting ? "جاري التصدير..." : "تصدير تقرير"}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => onExport && onExport("summary")}>
            الملخص المالي
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport && onExport("resources")}>
            تقرير الموارد المالية
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport && onExport("expenses")}>
            تقرير المصروفات
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport && onExport("comparison")}>
            تقرير مقارنة المستهدفات
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport && onExport("budget-distribution")}>
            توزيع الإنفاق على البنود
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport && onExport("comprehensive")}>
            التقرير الشامل
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
