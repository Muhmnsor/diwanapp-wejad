
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { CalendarIcon, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TaskFormProps {
  onSubmit: (formData: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    stageId: string;
    assignedTo: string | null;
  }) => Promise<void>;
  isSubmitting: boolean;
  projectStages: { id: string; name: string }[];
  projectId: string | undefined;
}

interface ProjectMember {
  id: string;
  user_id: string;
  workspace_id: string;
  user_display_name: string;
  user_email: string;
}

export const TaskForm = ({ 
  onSubmit, 
  isSubmitting, 
  projectStages,
  projectId
}: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [stageId, setStageId] = useState("");
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  
  useEffect(() => {
    if (projectStages.length > 0 && !stageId) {
      setStageId(projectStages[0].id);
    }
  }, [projectStages, stageId]);
  
  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (!projectId) return;
      
      try {
        // First get the workspace associated with this project
        const { data: projectData, error: projectError } = await supabase
          .from('project_tasks')
          .select('workspace_id')
          .eq('id', projectId)
          .single();
        
        if (projectError || !projectData) {
          console.error("Error fetching project workspace:", projectError);
          return;
        }
        
        // Then get all members of this workspace
        const { data: membersData, error: membersError } = await supabase
          .from('workspace_members')
          .select('*')
          .eq('workspace_id', projectData.workspace_id);
        
        if (membersError) {
          console.error("Error fetching workspace members:", membersError);
          return;
        }
        
        setProjectMembers(membersData || []);
      } catch (error) {
        console.error("Error fetching project members:", error);
      }
    };
    
    fetchProjectMembers();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ 
      title, 
      description, 
      dueDate, 
      priority, 
      stageId,
      assignedTo 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">عنوان المهمة</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="أدخل عنوان المهمة"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">وصف المهمة</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="أدخل وصف المهمة"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
          <div className="flex items-center">
            <CalendarIcon className="w-4 h-4 me-2 text-gray-500" />
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="priority">الأولوية</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger id="priority">
              <SelectValue placeholder="اختر الأولوية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">منخفضة</SelectItem>
              <SelectItem value="medium">متوسطة</SelectItem>
              <SelectItem value="high">عالية</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stage">المرحلة</Label>
          <Select value={stageId} onValueChange={setStageId}>
            <SelectTrigger id="stage">
              <SelectValue placeholder="اختر المرحلة" />
            </SelectTrigger>
            <SelectContent>
              {projectStages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="assignedTo">الشخص المسؤول</Label>
          <Select 
            value={assignedTo || ""} 
            onValueChange={setAssignedTo}
          >
            <SelectTrigger id="assignedTo" className="flex items-center">
              <Users className="w-4 h-4 me-2" />
              <SelectValue placeholder="اختر الشخص المسؤول" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">غير محدد</SelectItem>
              {projectMembers.map((member) => (
                <SelectItem key={member.id} value={member.user_id}>
                  {member.user_display_name || member.user_email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => onSubmit({ title: "", description: "", dueDate: "", priority: "medium", stageId: "", assignedTo: null })}
          disabled={isSubmitting}
        >
          إلغاء
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "جاري الإضافة..." : "إضافة المهمة"}
        </Button>
      </div>
    </form>
  );
};
