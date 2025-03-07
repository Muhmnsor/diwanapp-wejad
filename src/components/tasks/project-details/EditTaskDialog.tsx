
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Task } from "./types/task";
import { TaskForm } from "./TaskForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProjectMember } from "./hooks/useProjectMembers";
import { TaskDependency } from "./components/TaskDependenciesField";

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  projectStages: { id: string; name: string }[];
  projectMembers: ProjectMember[];
  onTaskUpdated: () => void;
}

export const EditTaskDialog = ({
  open,
  onOpenChange,
  task,
  projectStages,
  projectMembers,
  onTaskUpdated
}: EditTaskDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskDependencies, setTaskDependencies] = useState<TaskDependency[]>([]);
  
  useEffect(() => {
    // Fetch task dependencies when dialog opens and task is selected
    const fetchDependencies = async () => {
      if (!task || !open) return;
      
      try {
        const { data, error } = await supabase
          .from('task_dependencies')
          .select('*')
          .eq('task_id', task.id);
          
        if (error) {
          console.error("Error fetching task dependencies:", error);
          return;
        }
        
        if (data) {
          const formattedDeps: TaskDependency[] = data.map(dep => ({
            taskId: dep.dependency_task_id,
            dependencyType: dep.dependency_type
          }));
          
          setTaskDependencies(formattedDeps);
        }
      } catch (error) {
        console.error("Error in fetchDependencies:", error);
      }
    };
    
    fetchDependencies();
  }, [task, open]);

  const handleUpdateTask = async (formData: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    stageId: string;
    assignedTo: string | null;
    templates?: File[] | null;
    category?: string;
    dependencies?: TaskDependency[];
  }) => {
    if (!task) return;
    
    setIsSubmitting(true);
    try {
      console.log("Updating task with data:", formData);
      
      // Prepare update data
      const updateData = {
        title: formData.title,
        description: formData.description,
        due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        priority: formData.priority,
        stage_id: formData.stageId,
        assigned_to: formData.assignedTo,
        category: task.is_general ? formData.category : undefined
      };
      
      // Update task in database
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', task.id);
      
      if (error) throw error;
      
      // Handle dependencies update
      if (formData.dependencies) {
        // Delete existing dependencies
        await supabase
          .from('task_dependencies')
          .delete()
          .eq('task_id', task.id);
          
        // Add new dependencies if there are any
        if (formData.dependencies.length > 0) {
          const dependenciesData = formData.dependencies.map(dep => ({
            task_id: task.id,
            dependency_task_id: dep.taskId,
            dependency_type: dep.dependencyType,
            created_at: new Date().toISOString()
          }));
          
          const { error: depsError } = await supabase
            .from('task_dependencies')
            .insert(dependenciesData);
            
          if (depsError) {
            console.error("Error updating task dependencies:", depsError);
            toast.warning("تم تحديث المهمة ولكن هناك مشكلة في تحديث الاعتماديات");
          }
        }
      }
      
      // Upload templates if provided
      if (formData.templates && formData.templates.length > 0) {
        for (const file of formData.templates) {
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = `task-templates/${task.id}/${fileName}`;
          
          // Upload file to storage
          const { error: uploadError } = await supabase.storage
            .from('templates')
            .upload(filePath, file);
          
          if (uploadError) {
            console.error("Error uploading template:", uploadError);
            continue;
          }
          
          // Get public URL
          const { data: publicURL } = supabase.storage
            .from('templates')
            .getPublicUrl(filePath);
          
          // Create template record
          const { error: templateError } = await supabase
            .from('task_templates')
            .insert({
              task_id: task.id,
              file_url: publicURL.publicUrl,
              file_name: fileName,
              file_type: file.type,
              created_by: (await supabase.auth.getUser()).data.user?.id
            });
          
          if (templateError) {
            console.error("Error creating template record:", templateError);
          }
        }
      }
      
      toast.success("تم تحديث المهمة بنجاح");
      onTaskUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("حدث خطأ أثناء تحديث المهمة");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>تعديل المهمة</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <TaskForm
            onSubmit={handleUpdateTask}
            isSubmitting={isSubmitting}
            projectStages={projectStages}
            projectMembers={projectMembers}
            isGeneral={!!task.is_general}
            projectId={task.project_id}
            initialValues={{
              title: task.title,
              description: task.description || "",
              dueDate: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : "",
              priority: task.priority || "medium",
              stageId: task.stage_id || "",
              assignedTo: task.assigned_to || null,
              category: task.category || "إدارية",
              dependencies: taskDependencies
            }}
            isEditMode={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
