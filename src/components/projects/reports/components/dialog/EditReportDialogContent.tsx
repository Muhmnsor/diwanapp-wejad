import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditReportDialogContentProps {
  formValues: {
    report_name: string;
    program_name: string | null;
    report_text: string;
    detailed_description: string | null;
    event_duration: string;
    attendees_count: string;
    event_objectives: string;
    impact_on_participants: string;
    photos: { url: string; description: string; }[];
  };
  setFormValues: (values: any) => void;
  activities: any[];
}

export const EditReportDialogContent = ({
  formValues,
  setFormValues,
  activities,
}: EditReportDialogContentProps) => {
  const handleChange = (field: string, value: any) => {
    setFormValues({ ...formValues, [field]: value });
  };

  return (
    <div className="space-y-4 my-4">
      <div>
        <Label htmlFor="report_name">اسم التقرير</Label>
        <Input
          id="report_name"
          value={formValues.report_name}
          onChange={(e) => handleChange('report_name', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="program_name">اسم البرنامج</Label>
        <Input
          id="program_name"
          value={formValues.program_name || ''}
          onChange={(e) => handleChange('program_name', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="report_text">نص التقرير</Label>
        <Textarea
          id="report_text"
          value={formValues.report_text}
          onChange={(e) => handleChange('report_text', e.target.value)}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="detailed_description">التفاصيل</Label>
        <Textarea
          id="detailed_description"
          value={formValues.detailed_description || ''}
          onChange={(e) => handleChange('detailed_description', e.target.value)}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="event_duration">مدة النشاط</Label>
        <Input
          id="event_duration"
          value={formValues.event_duration}
          onChange={(e) => handleChange('event_duration', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="attendees_count">عدد المشاركين</Label>
        <Input
          id="attendees_count"
          value={formValues.attendees_count}
          onChange={(e) => handleChange('attendees_count', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="event_objectives">أهداف النشاط</Label>
        <Textarea
          id="event_objectives"
          value={formValues.event_objectives}
          onChange={(e) => handleChange('event_objectives', e.target.value)}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="impact_on_participants">الأثر على المشاركين</Label>
        <Textarea
          id="impact_on_participants"
          value={formValues.impact_on_participants}
          onChange={(e) => handleChange('impact_on_participants', e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
};