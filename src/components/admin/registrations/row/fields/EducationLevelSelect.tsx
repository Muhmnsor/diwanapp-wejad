import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EducationLevelSelectProps {
  value: string;
  onChange: (value: string) => void;
  isEditing?: boolean;
}

export const EducationLevelSelect = ({ value, onChange, isEditing = false }: EducationLevelSelectProps) => {
  const educationLevels = {
    primary: "ابتدائي",
    intermediate: "متوسط",
    high_school: "ثانوي",
    bachelor: "بكالوريوس",
    master: "ماجستير",
    phd: "دكتوراه"
  };

  if (!isEditing) {
    return <span>{value ? educationLevels[value as keyof typeof educationLevels] : '-'}</span>;
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="اختر المستوى التعليمي" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="primary">ابتدائي</SelectItem>
        <SelectItem value="intermediate">متوسط</SelectItem>
        <SelectItem value="high_school">ثانوي</SelectItem>
        <SelectItem value="bachelor">بكالوريوس</SelectItem>
        <SelectItem value="master">ماجستير</SelectItem>
        <SelectItem value="phd">دكتوراه</SelectItem>
      </SelectContent>
    </Select>
  );
};