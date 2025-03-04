import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: string;
  display_name?: string;
  email?: string;
}

interface TaskAssigneeFieldProps {
  assignedTo: string;
  onAssignedToChange: (assignedTo: string) => void;
  projectMembers: User[];
}

export const TaskAssigneeField = ({ assignedTo, onAssignedToChange, projectMembers }: TaskAssigneeFieldProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="assignee">المسؤول</Label>
      <Select onValueChange={onAssignedToChange} defaultValue={assignedTo}>
        <SelectTrigger>
          <SelectValue placeholder="اختر المسؤول" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">غير محدد</SelectItem>
          {projectMembers.map(member => (
            <SelectItem key={member.id} value={member.id}>{member.display_name || member.email}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
