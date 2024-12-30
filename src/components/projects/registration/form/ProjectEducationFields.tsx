import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProjectEducationFieldsProps {
  formData: {
    educationLevel: string;
    birthDate: string;
    nationalId: string;
  };
  setFormData: (data: any) => void;
}

export const ProjectEducationFields = ({
  formData,
  setFormData
}: ProjectEducationFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">المستوى التعليمي</label>
        <Select
          value={formData.educationLevel}
          onValueChange={(value) => setFormData(prev => ({ ...prev, educationLevel: value }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="اختر المستوى التعليمي" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high_school">ثانوي</SelectItem>
            <SelectItem value="bachelor">بكالوريوس</SelectItem>
            <SelectItem value="master">ماجستير</SelectItem>
            <SelectItem value="phd">دكتوراه</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">تاريخ الميلاد</label>
        <Input
          type="date"
          value={formData.birthDate}
          onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
          className="w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">رقم الهوية</label>
        <Input
          type="text"
          value={formData.nationalId}
          onChange={(e) => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
          className="w-full"
          required
          pattern="\d{10}"
          title="يجب أن يتكون رقم الهوية من 10 أرقام"
        />
      </div>
    </div>
  );
};