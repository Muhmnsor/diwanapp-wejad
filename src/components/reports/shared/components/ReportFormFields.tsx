import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ReportFormData } from "@/types/sharedReport";
import { PhotosField } from "@/components/events/reports/form/PhotosField";

interface ReportFormFieldsProps {
  values: ReportFormData;
  onChange: (field: keyof ReportFormData, value: any) => void;
  disabled?: boolean;
}

export const ReportFormFields = ({
  values,
  onChange,
  disabled = false
}: ReportFormFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>اسم البرنامج</Label>
          <Input
            value={values.program_name}
            onChange={(e) => onChange('program_name', e.target.value)}
            disabled={disabled}
            placeholder="أدخل اسم البرنامج"
          />
        </div>
        
        <div className="space-y-2">
          <Label>اسم التقرير</Label>
          <Input
            value={values.report_name}
            onChange={(e) => onChange('report_name', e.target.value)}
            disabled={disabled}
            placeholder="أدخل اسم التقرير"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>نص التقرير</Label>
        <Textarea
          value={values.report_text}
          onChange={(e) => onChange('report_text', e.target.value)}
          disabled={disabled}
          placeholder="اكتب نص التقرير"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label>الوصف التفصيلي</Label>
        <Textarea
          value={values.detailed_description}
          onChange={(e) => onChange('detailed_description', e.target.value)}
          disabled={disabled}
          placeholder="اكتب الوصف التفصيلي"
          className="min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>المدة</Label>
          <Input
            value={values.activity_duration}
            onChange={(e) => onChange('activity_duration', e.target.value)}
            disabled={disabled}
            placeholder="أدخل مدة النشاط"
          />
        </div>

        <div className="space-y-2">
          <Label>عدد المشاركين</Label>
          <Input
            value={values.attendees_count}
            onChange={(e) => onChange('attendees_count', e.target.value)}
            disabled={disabled}
            placeholder="أدخل عدد المشاركين"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>الأهداف</Label>
        <Textarea
          value={values.activity_objectives}
          onChange={(e) => onChange('activity_objectives', e.target.value)}
          disabled={disabled}
          placeholder="اكتب أهداف النشاط"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label>الأثر على المشاركين</Label>
        <Textarea
          value={values.impact_on_participants}
          onChange={(e) => onChange('impact_on_participants', e.target.value)}
          disabled={disabled}
          placeholder="اكتب الأثر على المشاركين"
          className="min-h-[100px]"
        />
      </div>

      <PhotosField
        photos={values.photos}
        onPhotosChange={(photos) => onChange('photos', photos)}
      />
    </div>
  );
};