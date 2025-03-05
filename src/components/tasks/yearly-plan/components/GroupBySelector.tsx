
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GroupBySelectorProps {
  value: 'workspace' | 'status' | 'assignee';
  onChange: (value: 'workspace' | 'status' | 'assignee') => void;
}

export const GroupBySelector = ({ value, onChange }: GroupBySelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">تجميع حسب:</span>
      <Select
        value={value}
        onValueChange={(newValue) => onChange(newValue as 'workspace' | 'status' | 'assignee')}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="workspace">مساحة العمل</SelectItem>
          <SelectItem value="status">الحالة</SelectItem>
          <SelectItem value="assignee">المسؤول</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
