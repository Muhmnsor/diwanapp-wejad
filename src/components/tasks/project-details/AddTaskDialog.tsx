
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { TaskForm } from "./components/TaskForm";
import { useWorkspace } from "@/providers/workspace-provider";
import { useUser } from "@/providers/user-provider";

const taskSchema = z.object({
  title: z.string().min(3, { message: "عنوان المهمة يجب أن يكون 3 أحرف على الأقل" }),
  description: z.string().optional(),
  status: z.string(),
  priority: z.string(),
  due_date: z.string().optional().nullable(),
  assigned_to: z.string().optional().nullable(),
  stage_id: z.string().optional().nullable(),
  dependencies: z.array(z.string()).optional()
});

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectStages: {id: string; name: string}[];
  projectMembers: {id: string; name: string}[];
  onTaskAdded: () => void;
}

export const AddTaskDialog = ({
  isOpen,
  onClose,
  projectId,
  projectStages,
  projectMembers,
  onTaskAdded
}: AddTaskDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { workspaceId } = useWorkspace();
  const { user } = useUser();

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      due_date: null,
      assigned_to: null,
      stage_id: projectStages.length > 0 ? projectStages[0].id : null,
      dependencies: []
    }
  });

  const handleSubmit = async (data: z.infer<typeof taskSchema>) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Prepare data for insertion
      const taskData = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        due_date: data.due_date || null,
        assigned_to: data.assigned_to || null,
        stage_id: data.stage_id || null,
        project_id: projectId,
        workspace_id: workspaceId,
        created_by: user?.id
      };
      
      // Insert the task
      const { error: insertError } = await supabase
        .from('tasks')
        .insert(taskData);
        
      if (insertError) throw insertError;
      
      // Show success and reset form
      setSuccess("تمت إضافة المهمة بنجاح");
      form.reset();
      
      // Notify parent component
      onTaskAdded();
      
      // Close dialog after a delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error adding task:', err);
      setError("حدث خطأ أثناء إضافة المهمة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rtl sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>إضافة مهمة جديدة</DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <TaskForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          projectStages={projectStages}
          projectMembers={projectMembers}
          projectId={projectId}
        />
      </DialogContent>
    </Dialog>
  );
};
