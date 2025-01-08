import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EducationLevelFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const EducationLevelField = ({ value, onChange }: EducationLevelFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>المستوى التعليمي</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="اختر المستوى التعليمي" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="primary">ابتدائي</SelectItem>
          <SelectItem value="intermediate">متوسط</SelectItem>
          <SelectItem value="high_school">ثانوي</SelectItem>
          <SelectItem value="diploma">دبلوم</SelectItem>
          <SelectItem value="bachelors">بكالوريوس</SelectItem>
          <SelectItem value="masters">ماجستير</SelectItem>
          <SelectItem value="doctorate">دكتوراه</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};