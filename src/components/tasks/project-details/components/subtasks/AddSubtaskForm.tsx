
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { ProjectMember } from "../../hooks/useProjectMembers";

interface AddSubtaskFormProps {
  onSubmit: (title: string, dueDate?: string, assignedTo?: string) => Promise<void>;
  onCancel: () => void;
  projectMembers: ProjectMember[];
  isLoading?: boolean;
}

export const AddSubtaskForm = ({ onSubmit, onCancel, projectMembers, isLoading = false }: AddSubtaskFormProps) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    await onSubmit(title, dueDate || undefined, assignedTo || undefined);
    setTitle("");
    setDueDate("");
    setAssignedTo("");
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3 border rounded-md bg-gray-50">
      <div>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان المهمة الفرعية"
          className="w-full"
          required
          autoFocus
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">تاريخ الاستحقاق</Label>
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-gray-500" />
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">المكلف</Label>
          <Select value={assignedTo} onValueChange={setAssignedTo}>
            <SelectTrigger>
              <SelectValue placeholder="اختر المكلف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">غير محدد</SelectItem>
              {projectMembers.map((member) => (
                <SelectItem key={member.user_id} value={member.user_id}>
                  {member.user_display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" size="sm" disabled={isLoading || !title.trim()}>
          {isLoading ? "جاري الإضافة..." : "إضافة"}
        </Button>
      </div>
    </form>
  );
};
