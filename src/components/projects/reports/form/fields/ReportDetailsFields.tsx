import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ActivityReportFormData } from "@/types/activityReport";

interface ReportDetailsFieldsProps {
  formValues: ActivityReportFormData;
  onChange: (field: keyof ActivityReportFormData, value: any) => void;
}

export const ReportDetailsFields = ({ formValues, onChange }: ReportDetailsFieldsProps) => {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">تفاصيل النشاط</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">الوصف التفصيلي</label>
          <Textarea
            value={formValues.detailed_description}
            onChange={(e) => onChange('detailed_description', e.target.value)}
            placeholder="الوصف التفصيلي"
            className="min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">مدة النشاط</label>
            <Input
              value={formValues.activity_duration}
              onChange={(e) => onChange('activity_duration', e.target.value)}
              placeholder="مدة النشاط"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">عدد المشاركين</label>
            <Input
              value={formValues.attendees_count}
              onChange={(e) => onChange('attendees_count', e.target.value)}
              placeholder="عدد المشاركين"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};