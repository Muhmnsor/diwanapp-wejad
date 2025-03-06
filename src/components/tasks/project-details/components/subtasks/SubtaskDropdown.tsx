
import { useState } from "react";
import { PlusCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "../../types/task";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

interface SubtaskDropdownProps {
  task: Task;
  onSubtaskAdded: () => Promise<void>;
}

export const SubtaskDropdown = ({ task, onSubtaskAdded }: SubtaskDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [subtasks, setSubtasks] = useState<Task[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSubtasks, setIsLoadingSubtasks] = useState(false);
  const { user } = useAuthStore();

  // Fetch subtasks when the dropdown is opened
  const fetchSubtasks = async () => {
    if (!isOpen) return;
    
    setIsLoadingSubtasks(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('parent_task_id', task.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setSubtasks(data || []);
    } catch (error) {
      console.error("Error fetching subtasks:", error);
      toast.error("فشل في تحميل المهام الفرعية");
    } finally {
      setIsLoadingSubtasks(false);
    }
  };

  // Toggle dropdown and fetch subtasks when opening
  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchSubtasks();
    }
  };

  // Add a new subtask
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSubtaskTitle.trim()) {
      toast.error("يرجى إدخال عنوان للمهمة الفرعية");
      return;
    }
    
    setIsLoading(true);
    try {
      // Get project information from the parent task
      const newSubtask = {
        title: newSubtaskTitle,
        description: null,
        status: "pending",
        priority: task.priority || "medium",
        parent_task_id: task.id,
        project_id: task.project_id,
        workspace_id: task.workspace_id,
        stage_id: task.stage_id,
        is_subtask: true,
        created_at: new Date().toISOString(),
        assigned_to: null,
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([newSubtask])
        .select();
        
      if (error) throw error;
      
      setNewSubtaskTitle("");
      setSubtasks([...(data || []), ...subtasks]);
      toast.success("تمت إضافة المهمة الفرعية بنجاح");
      
      // Refresh task list to show the new subtask indicator
      if (onSubtaskAdded) {
        await onSubtaskAdded();
      }
    } catch (error) {
      console.error("Error adding subtask:", error);
      toast.error("فشل في إضافة المهمة الفرعية");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle subtask status change
  const handleSubtaskStatusChange = async (subtaskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', subtaskId);
        
      if (error) throw error;
      
      // Update local state
      setSubtasks(subtasks.map(subtask => 
        subtask.id === subtaskId ? { ...subtask, status: newStatus } : subtask
      ));
      
      toast.success("تم تحديث حالة المهمة الفرعية بنجاح");
    } catch (error) {
      console.error("Error updating subtask status:", error);
      toast.error("فشل في تحديث حالة المهمة الفرعية");
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleToggle}
      className="w-full border-t mt-2 pt-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground mr-2">المهام الفرعية</span>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="space-y-2">
        {/* Form to add new subtask */}
        <form onSubmit={handleAddSubtask} className="flex items-center gap-2 mt-3">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="أضف مهمة فرعية جديدة"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button 
            type="submit" 
            size="sm" 
            disabled={isLoading}
            className="h-9"
          >
            <PlusCircle className="h-4 w-4 ml-1" />
            إضافة
          </Button>
        </form>
        
        {/* List of subtasks */}
        <div className="space-y-2 mt-3">
          {isLoadingSubtasks ? (
            <div className="text-center py-2 text-sm text-muted-foreground">
              جاري تحميل المهام الفرعية...
            </div>
          ) : subtasks.length > 0 ? (
            subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                <span className="text-sm">{subtask.title}</span>
                <div className="flex items-center gap-2">
                  {subtask.status !== "completed" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSubtaskStatusChange(subtask.id, "completed")}
                      className="h-7 px-2 py-0 text-xs"
                    >
                      إكمال
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSubtaskStatusChange(subtask.id, "pending")}
                      className="h-7 px-2 py-0 text-xs"
                    >
                      إعادة فتح
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-2 text-sm text-muted-foreground">
              لا توجد مهام فرعية بعد
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
