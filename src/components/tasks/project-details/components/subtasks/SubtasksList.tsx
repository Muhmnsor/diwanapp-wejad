
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { AddSubtaskForm } from "./AddSubtaskForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { SubtaskItem } from "./SubtaskItem";

interface Subtask {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  assigned_to: string | null;
  status: string;
}

interface SubtasksListProps {
  taskId: string;
  projectId: string | undefined;
}

export const SubtasksList = ({ taskId, projectId }: SubtasksListProps) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubtasks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('task_subtasks')
        .select('*')
        .eq('parent_task_id', taskId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setSubtasks(data || []);
    } catch (error) {
      console.error("Error fetching subtasks:", error);
      setError("فشل في جلب المهام الفرعية");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchSubtasks();
    }
  }, [taskId]);

  const handleStatusChange = async (subtaskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('task_subtasks')
        .update({ status: newStatus })
        .eq('id', subtaskId);
      
      if (error) throw error;
      
      // Update locally to avoid refetching
      setSubtasks(prev => prev.map(subtask => 
        subtask.id === subtaskId 
          ? { ...subtask, status: newStatus } 
          : subtask
      ));
    } catch (error) {
      console.error("Error updating subtask status:", error);
    }
  };

  return (
    <div className="mt-4 border rounded-md p-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              <span className="ms-2 font-medium">المهام الفرعية ({subtasks.length})</span>
            </Button>
          </CollapsibleTrigger>
          
          <Button 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>إضافة مهمة فرعية</span>
          </Button>
        </div>
        
        <CollapsibleContent className="mt-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <Alert>{error}</Alert>
          ) : subtasks.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              لا توجد مهام فرعية
            </div>
          ) : (
            <div className="space-y-2">
              {subtasks.map(subtask => (
                <SubtaskItem 
                  key={subtask.id}
                  subtask={subtask}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
      
      <AddSubtaskForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        taskId={taskId}
        onSubtaskAdded={fetchSubtasks}
        projectId={projectId}
      />
    </div>
  );
};
