import { Project } from "@/types/project";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface ProjectCertificateFieldsProps {
  formData: Project;
  setFormData: (data: Project) => void;
}

export const ProjectCertificateFields = ({ formData, setFormData }: ProjectCertificateFieldsProps) => {
  const handleCertificateTypeChange = (value: string) => {
    setFormData({ 
      ...formData, 
      certificate_type: value,
      event_hours: undefined 
    });
  };

  const handleHoursChange = (value: string) => {
    const numValue = value ? Number(value) : undefined;
    if (!isNaN(Number(value)) || value === '') {
      setFormData({ ...formData, event_hours: numValue });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1.5">نوع الشهادة</label>
        <Select
          value={formData.certificate_type}
          onValueChange={handleCertificateTypeChange}
        >
          <SelectTrigger className="text-right">
            <SelectValue placeholder="اختر نوع الشهادة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">بدون شهادة</SelectItem>
            <SelectItem value="attendance">شهادة حضور</SelectItem>
            <SelectItem value="certified">شهادة معتمدة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.certificate_type && formData.certificate_type !== 'none' && (
        <div>
          <label className="text-sm font-medium block mb-1.5">عدد ساعات المشروع</label>
          <Input
            type="number"
            value={formData.event_hours ?? ''}
            onChange={(e) => handleHoursChange(e.target.value)}
            min={0}
            step={0.5}
            className="text-right"
            placeholder="أدخل عدد الساعات"
          />
        </div>
      )}
    </div>
  );
};