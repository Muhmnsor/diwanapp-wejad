import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProjectCertificateFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const ProjectCertificateFields = ({ formData, setFormData }: ProjectCertificateFieldsProps) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">نوع الشهادة</label>
      <Select
        value={formData.certificate_type || 'none'}
        onValueChange={(value) => 
          setFormData({ ...formData, certificate_type: value })
        }
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
  );
};