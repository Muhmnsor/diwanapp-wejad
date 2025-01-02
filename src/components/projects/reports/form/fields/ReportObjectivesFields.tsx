import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ActivityReportFormData } from "@/types/activityReport";

interface ReportObjectivesFieldsProps {
  formValues: ActivityReportFormData;
  onChange: (field: keyof ActivityReportFormData, value: any) => void;
}

export const ReportObjectivesFields = ({ formValues, onChange }: ReportObjectivesFieldsProps) => {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">الأهداف والتأثير</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">أهداف النشاط</label>
          <Textarea
            value={formValues.activity_objectives}
            onChange={(e) => onChange('activity_objectives', e.target.value)}
            placeholder="أهداف النشاط"
            className="min-h-[100px]"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">الأثر على المشاركين</label>
          <Textarea
            value={formValues.impact_on_participants}
            onChange={(e) => onChange('impact_on_participants', e.target.value)}
            placeholder="الأثر على المشاركين"
            className="min-h-[100px]"
          />
        </div>
      </div>
    </Card>
  );
};