
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { KeyboardEvent, useState } from "react";
import { useProjectMembers } from "../../hooks/useProjectMembers";

interface AddSubtaskFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  dueDate: string | null;
  setDueDate: (value: string | null) => void;
  priority: string | null;
  setPriority: (value: string | null) => void;
  assignedTo: string | null;
  setAssignedTo: (value: string | null) => void;
  projectId?: string;
}

export const AddSubtaskForm = ({ 
  value, 
  onChange, 
  onSubmit, 
  onCancel,
  dueDate,
  setDueDate,
  priority,
  setPriority,
  assignedTo,
  setAssignedTo,
  projectId 
}: AddSubtaskFormProps) => {
  const { members, isLoading } = useProjectMembers(projectId);
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="عنوان المهمة الفرعية"
          className="text-sm"
          autoFocus
        />
      </div>
      
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="assignedTo">المسؤول</Label>
          <Select value={assignedTo || ""} onValueChange={setAssignedTo}>
            <SelectTrigger>
              <SelectValue placeholder="اختر المسؤول" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">غير معين</SelectItem>
              {members?.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name || member.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate || ""}
            onChange={(e) => setDueDate(e.target.value)}
            className="text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="priority">الأولوية</Label>
          <Select value={priority || ""} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder="الأولوية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">غير محدد</SelectItem>
              <SelectItem value="high">عالية</SelectItem>
              <SelectItem value="medium">متوسطة</SelectItem>
              <SelectItem value="low">منخفضة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-1 justify-end">
        <Button 
          type="button" 
          size="sm" 
          className="h-9"
          onClick={onSubmit}
          disabled={!value.trim()}
        >
          إضافة
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="h-9"
          onClick={onCancel}
        >
          إلغاء
        </Button>
      </div>
    </div>
  );
};
