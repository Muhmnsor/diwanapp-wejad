
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TaskTitleField } from "./components/TaskTitleField";
import { TaskDescriptionField } from "./components/TaskDescriptionField";
import { TaskDateField } from "./components/TaskDateField";
import { TaskPriorityField } from "./components/TaskPriorityField";
import { TaskStageField } from "./components/TaskStageField";
import { TaskAssigneeField } from "./components/TaskAssigneeField";
import { TaskFormActions } from "./components/TaskFormActions";

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

  const handleCancel = () => {
    onSubmit({ 
      title: "", 
      description: "", 
      dueDate: "", 
      priority: "medium", 
      stageId: "", 
      assignedTo: null 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TaskTitleField title={title} setTitle={setTitle} />
      <TaskDescriptionField description={description} setDescription={setDescription} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TaskDateField dueDate={dueDate} setDueDate={setDueDate} />
        <TaskPriorityField priority={priority} setPriority={setPriority} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TaskStageField stageId={stageId} setStageId={setStageId} projectStages={projectStages} />
        <TaskAssigneeField 
          assignedTo={assignedTo} 
          setAssignedTo={setAssignedTo} 
          projectMembers={projectMembers} 
        />
      </div>
      
      <TaskFormActions isSubmitting={isSubmitting} onCancel={handleCancel} />
    </form>
  );
};
