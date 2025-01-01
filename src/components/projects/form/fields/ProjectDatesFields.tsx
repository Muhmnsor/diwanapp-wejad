import { Project } from "@/types/project";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ProjectDatesFieldsProps {
  formData: Project;
  setFormData: (data: Project) => void;
}

export const ProjectDatesFields = ({ formData, setFormData }: ProjectDatesFieldsProps) => {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">التواريخ والتسجيل</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">تاريخ البداية</label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="text-right"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">تاريخ النهاية</label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            className="text-right"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">تاريخ بداية التسجيل</label>
          <Input
            type="date"
            value={formData.registration_start_date || ''}
            onChange={(e) => setFormData({ ...formData, registration_start_date: e.target.value })}
            className="text-right"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">تاريخ نهاية التسجيل</label>
          <Input
            type="date"
            value={formData.registration_end_date || ''}
            onChange={(e) => setFormData({ ...formData, registration_end_date: e.target.value })}
            className="text-right"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">عدد المقاعد</label>
          <Input
            type="number"
            value={formData.max_attendees}
            onChange={(e) => setFormData({ ...formData, max_attendees: Number(e.target.value) })}
            className="text-right"
          />
        </div>
      </div>
    </Card>
  );
};