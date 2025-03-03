
import { FormLabel } from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ProjectMember } from "../hooks/useProjectMembers";

interface TaskAssigneeFieldProps {
  assignedTo: string | null;
  setAssignedTo: (value: string | null) => void;
  projectMembers: ProjectMember[];
}

export const TaskAssigneeField = ({ 
  assignedTo, 
  setAssignedTo, 
  projectMembers 
}: TaskAssigneeFieldProps) => {
  return (
    <div className="space-y-2">
      <FormLabel>المسؤول</FormLabel>
      <Select 
        value={assignedTo || ""} 
        onValueChange={(value) => setAssignedTo(value || null)}
      >
        <SelectTrigger>
          <SelectValue placeholder="اختر المسؤول" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">غير معين</SelectItem>
          {projectMembers?.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              {member.name || member.email || 'مستخدم'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
