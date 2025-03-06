
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectMember } from "../../../hooks/useProjectMembers";

interface SubtaskAssigneeFieldProps {
  assignedTo: string;
  setAssignedTo: (value: string) => void;
  projectMembers: ProjectMember[];
}

export const SubtaskAssigneeField = ({ assignedTo, setAssignedTo, projectMembers }: SubtaskAssigneeFieldProps) => {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-gray-500">المكلف</Label>
      <Select value={assignedTo} onValueChange={setAssignedTo}>
        <SelectTrigger>
          <SelectValue placeholder="اختر المكلف" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">غير محدد</SelectItem>
          {projectMembers.map((member) => (
            <SelectItem key={member.user_id} value={member.user_id}>
              {member.display_name || member.email || 'مستخدم بلا اسم'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
