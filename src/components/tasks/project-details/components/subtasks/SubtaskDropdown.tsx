
import { useState, useEffect } from "react";
import { PlusCircle, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "../../types/task";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { TaskAssigneeField } from "../TaskAssigneeField";
import { useProjectMembers } from "../../hooks/useProjectMembers";
import { cn } from "@/lib/utils";

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
  const { projectMembers } = useProjectMembers(task.project_id);
  
  // New state variables for the enhanced form
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);

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
      // Format the due date to ISO string if it exists
      const formattedDueDate = dueDate ? dueDate.toISOString() : null;
      
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
        assigned_to: assignedTo,
        due_date: formattedDueDate
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([newSubtask])
        .select();
        
      if (error) throw error;
      
      // Reset form
      setNewSubtaskTitle("");
      setDueDate(undefined);
      setAssignedTo(null);
      
      // Update the list
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
        {/* Enhanced form to add new subtask */}
        <form onSubmit={handleAddSubtask} className="space-y-3 mt-3">
          <div className="space-y-2">
            <Label htmlFor="subtask-title">عنوان المهمة الفرعية</Label>
            <Input
              id="subtask-title"
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="أضف مهمة فرعية جديدة"
              className="flex h-9 w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subtask-due-date">تاريخ الاستحقاق</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="subtask-due-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-right font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="ml-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "yyyy/MM/dd") : <span>اختر تاريخ</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <TaskAssigneeField
            assignedTo={assignedTo}
            setAssignedTo={setAssignedTo}
            projectMembers={projectMembers}
          />
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "جاري الإضافة..." : "إضافة المهمة الفرعية"}
          </Button>
        </form>
        
        {/* List of subtasks */}
        <div className="space-y-2 mt-3">
          <Label>المهام الفرعية الحالية</Label>
          {isLoadingSubtasks ? (
            <div className="text-center py-2 text-sm text-muted-foreground">
              جاري تحميل المهام الفرعية...
            </div>
          ) : subtasks.length > 0 ? (
            subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{subtask.title}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    {subtask.due_date && (
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(subtask.due_date), "yyyy/MM/dd")}
                      </span>
                    )}
                    {subtask.assigned_user_name && (
                      <span className="mr-2">المكلف: {subtask.assigned_user_name}</span>
                    )}
                  </div>
                </div>
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
