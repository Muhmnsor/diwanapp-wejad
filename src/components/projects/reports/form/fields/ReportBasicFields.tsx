import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ActivityReportFormData } from "@/types/activityReport";

interface ReportBasicFieldsProps {
  formValues: ActivityReportFormData;
  onChange: (field: keyof ActivityReportFormData, value: any) => void;
}

export const ReportBasicFields = ({ formValues, onChange }: ReportBasicFieldsProps) => {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">معلومات التقرير الأساسية</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">اسم البرنامج</label>
          <Input
            value={formValues.program_name}
            onChange={(e) => onChange('program_name', e.target.value)}
            placeholder="اسم البرنامج"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium block mb-1.5">اسم التقرير</label>
          <Input
            value={formValues.report_name}
            onChange={(e) => onChange('report_name', e.target.value)}
            placeholder="اسم التقرير"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">نص التقرير</label>
          <Textarea
            value={formValues.report_text}
            onChange={(e) => onChange('report_text', e.target.value)}
            placeholder="نص التقرير"
            className="min-h-[100px]"
          />
        </div>
      </div>
    </Card>
  );
};