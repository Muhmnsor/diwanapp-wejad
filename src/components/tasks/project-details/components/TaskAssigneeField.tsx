
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { ProjectMember } from "../hooks/useProjectMembers";

interface TaskAssigneeFieldProps {
  assignedTo: string | null;
  setAssignedTo: (value: string | null) => void;
  projectMembers: ProjectMember[];
}

export const TaskAssigneeField = ({ assignedTo, setAssignedTo, projectMembers }: TaskAssigneeFieldProps) => {
  const [isCustomAssignee, setIsCustomAssignee] = useState(false);
  const [customAssigneeName, setCustomAssigneeName] = useState("");

  const handleCustomAssigneeSubmit = () => {
    if (customAssigneeName.trim()) {
      // استخدام اسم مخصص مع بادئة 'custom:' للتمييز
      setAssignedTo(`custom:${customAssigneeName.trim()}`);
      setIsCustomAssignee(false);
    }
  };

  const handleSelectChange = (value: string) => {
    if (value === "custom") {
      setIsCustomAssignee(true);
      return;
    }
    
    setAssignedTo(value === "unassigned" ? null : value);
  };

  // استخراج الاسم المخصص من قيمة assignedTo إذا كان موجودًا
  const isCurrentlyCustom = assignedTo?.startsWith("custom:");
  const displayValue = isCurrentlyCustom 
    ? assignedTo.replace("custom:", "") 
    : assignedTo || "";

  return (
    <div className="space-y-2">
      <Label htmlFor="assignedTo">الشخص المسؤول</Label>
      
      {isCustomAssignee ? (
        <div className="flex items-center gap-2">
          <Input
            value={customAssigneeName}
            onChange={(e) => setCustomAssigneeName(e.target.value)}
            placeholder="أدخل اسم الشخص المسؤول"
            className="flex-1"
          />
          <Button 
            size="sm" 
            onClick={handleCustomAssigneeSubmit}
            disabled={!customAssigneeName.trim()}
          >
            إضافة
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsCustomAssignee(false)}
          >
            إلغاء
          </Button>
        </div>
      ) : (
        <Select 
          value={isCurrentlyCustom ? "custom" : (assignedTo || "")}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger id="assignedTo" className="flex items-center">
            <Users className="w-4 h-4 me-2" />
            <SelectValue 
              placeholder="اختر الشخص المسؤول" 
            >
              {isCurrentlyCustom ? displayValue : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">غير محدد</SelectItem>
            <SelectItem value="custom" className="text-primary flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة شخص آخر</span>
            </SelectItem>
            {projectMembers.map((member) => (
              <SelectItem key={member.id} value={member.user_id}>
                {member.user_display_name || member.user_email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
