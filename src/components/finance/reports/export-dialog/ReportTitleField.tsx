
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReportTitleFieldProps {
  reportTitle: string;
  onReportTitleChange: (value: string) => void;
}

export const ReportTitleField: React.FC<ReportTitleFieldProps> = ({
  reportTitle,
  onReportTitleChange
}) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="reportTitle" className="text-right col-span-1">
        عنوان التقرير
      </Label>
      <Input
        id="reportTitle"
        className="col-span-3 text-right"
        value={reportTitle}
        onChange={(e) => onReportTitleChange(e.target.value)}
      />
    </div>
  );
};
