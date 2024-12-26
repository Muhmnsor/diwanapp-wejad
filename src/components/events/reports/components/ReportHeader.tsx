import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ReportHeaderProps {
  createdAt: string;
  onDownload: () => void;
}

export const ReportHeader = ({ createdAt, onDownload }: ReportHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">
        {format(new Date(createdAt), 'PPP', { locale: ar })}
      </span>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={onDownload}
      >
        <Download size={16} />
        تحميل التقرير
      </Button>
    </div>
  );
};