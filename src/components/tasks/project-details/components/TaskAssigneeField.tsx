
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";

interface ProjectMember {
  id: string;
  user_id: string;
  workspace_id: string;
  user_display_name: string;
  user_email: string;
}

interface TaskAssigneeFieldProps {
  assignedTo: string | null;
  setAssignedTo: (value: string | null) => void;
  projectMembers: ProjectMember[];
}

export const TaskAssigneeField = ({ assignedTo, setAssignedTo, projectMembers }: TaskAssigneeFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="assignedTo">الشخص المسؤول</Label>
      <Select 
        value={assignedTo || ""} 
        onValueChange={(value) => setAssignedTo(value === "unassigned" ? null : value)}
      >
        <SelectTrigger id="assignedTo" className="flex items-center">
          <Users className="w-4 h-4 me-2" />
          <SelectValue placeholder="اختر الشخص المسؤول" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">غير محدد</SelectItem>
          {projectMembers.map((member) => (
            <SelectItem key={member.id} value={member.user_id}>
              {member.user_display_name || member.user_email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
