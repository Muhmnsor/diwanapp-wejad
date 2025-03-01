
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ReportsHeaderProps {
  title?: string;
  onExport?: () => void;
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({
  title = "التقارير المالية",
  onExport
}) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">{title}</h2>
      <Button className="flex items-center gap-2" onClick={onExport}>
        <Download className="h-4 w-4" />
        <span>تصدير التقرير</span>
      </Button>
    </div>
  );
};
