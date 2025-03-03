
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubtaskItem } from "./SubtaskItem";
import { AddSubtaskForm } from "./AddSubtaskForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Subtask } from "../../types/subtask";
import { useProjectMembers } from "../../hooks/useProjectMembers";

interface SubtasksListProps {
  taskId: string;
  projectId: string;
  subtasks?: Subtask[];
  onAddSubtask?: (taskId: string, title: string, dueDate?: string, assignedTo?: string) => Promise<void>;
  onUpdateSubtaskStatus?: (subtaskId: string, newStatus: string) => Promise<void>;
  onDeleteSubtask?: (subtaskId: string) => Promise<void>;
}

export const SubtasksList = ({ 
  taskId, 
  projectId,
  subtasks: externalSubtasks,
  onAddSubtask: externalAddSubtask,
  onUpdateSubtaskStatus: externalUpdateStatus,
  onDeleteSubtask: externalDeleteSubtask
}: SubtasksListProps) => {
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { projectMembers } = useProjectMembers(projectId);
  
  useEffect(() => {
    if (externalSubtasks) {
      setSubtasks(externalSubtasks);
    } else {
      fetchSubtasks();
    }
  }, [taskId, externalSubtasks]);
  
  const fetchSubtasks = async () => {
    if (!taskId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Check if subtasks table exists first
      const { error: tableCheckError } = await supabase
        .from('subtasks')
        .select('count')
        .limit(1)
        .maybeSingle();
      
      if (tableCheckError) {
        console.error("Error fetching subtasks:", tableCheckError);
        // If table doesn't exist, just set empty array and don't show error
        if (tableCheckError.code === '42P01') {  // Table doesn't exist error code
          setSubtasks([]);
          return;
        }
        throw tableCheckError;
      }
      
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Add user names for subtasks with assignees
      const subtasksWithUserData = await Promise.all((data || []).map(async (subtask) => {
        if (subtask.assigned_to) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('id', subtask.assigned_to)
            .single();
          
          if (!userError && userData) {
            return {
              ...subtask,
              assigned_user_name: userData.display_name || userData.email
            };
          }
        }
        
        return subtask;
      }));
      
      setSubtasks(subtasksWithUserData);
    } catch (error) {
      console.error("Error fetching subtasks:", error);
      setError("لا يمكن تحميل المهام الفرعية حالياً");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddSubtask = async (title: string, dueDate?: string, assignedTo?: string) => {
    if (externalAddSubtask) {
      try {
        await externalAddSubtask(taskId, title, dueDate, assignedTo);
        setIsAddingSubtask(false);
      } catch (error) {
        console.error("Error adding subtask:", error);
        toast.error("حدث خطأ أثناء إضافة المهمة الفرعية");
      }
    } else {
      setIsLoading(true);
      try {
        // Check if subtasks table exists
        const { error: tableCheckError } = await supabase
          .from('subtasks')
          .select('count')
          .limit(1)
          .maybeSingle();
        
        if (tableCheckError && tableCheckError.code === '42P01') {
          // Table doesn't exist
          toast.error("خاصية المهام الفرعية غير متوفرة حالياً، يرجى الاتصال بالمسؤول");
          setIsAddingSubtask(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('subtasks')
          .insert([
            {
              task_id: taskId,
              title,
              status: 'pending',
              due_date: dueDate ? new Date(dueDate).toISOString() : null,
              assigned_to: assignedTo || null
            }
          ])
          .select();
        
        if (error) throw error;
        
        toast.success("تمت إضافة المهمة الفرعية");
        await fetchSubtasks();
      } catch (error) {
        console.error("Error adding subtask:", error);
        toast.error("حدث خطأ أثناء إضافة المهمة الفرعية");
      } finally {
        setIsLoading(false);
        setIsAddingSubtask(false);
      }
    }
  };
  
  const handleUpdateStatus = async (subtaskId: string, newStatus: string) => {
    if (externalUpdateStatus) {
      await externalUpdateStatus(subtaskId, newStatus);
    } else {
      try {
        const { error } = await supabase
          .from('subtasks')
          .update({ status: newStatus })
          .eq('id', subtaskId);
        
        if (error) throw error;
        
        setSubtasks(prevSubtasks => 
          prevSubtasks.map(subtask => 
            subtask.id === subtaskId 
              ? { ...subtask, status: newStatus } 
              : subtask
          )
        );
        
        toast.success(newStatus === 'completed' 
          ? "تم إكمال المهمة الفرعية" 
          : "تم تحديث حالة المهمة الفرعية");
      } catch (error) {
        console.error("Error updating subtask status:", error);
        toast.error("حدث خطأ أثناء تحديث حالة المهمة الفرعية");
      }
    }
  };
  
  const handleDeleteSubtask = async (subtaskId: string) => {
    if (externalDeleteSubtask) {
      await externalDeleteSubtask(subtaskId);
    } else {
      try {
        const { error } = await supabase
          .from('subtasks')
          .delete()
          .eq('id', subtaskId);
        
        if (error) throw error;
        
        setSubtasks(prevSubtasks => 
          prevSubtasks.filter(subtask => subtask.id !== subtaskId)
        );
        
        toast.success("تم حذف المهمة الفرعية");
      } catch (error) {
        console.error("Error deleting subtask:", error);
        toast.error("حدث خطأ أثناء حذف المهمة الفرعية");
      }
    }
  };
  
  // If there was an error checking for the subtasks table, show a meaningful message
  if (error) {
    return (
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">المهام الفرعية</h4>
        </div>
        <div className="text-center py-3 text-sm text-red-500 border rounded-md bg-red-50">
          {error}
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">المهام الفرعية</h4>
        
        {!isAddingSubtask && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs"
            onClick={() => setIsAddingSubtask(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            إضافة مهمة فرعية
          </Button>
        )}
      </div>
      
      {isAddingSubtask && (
        <AddSubtaskForm 
          onSubmit={handleAddSubtask}
          onCancel={() => setIsAddingSubtask(false)}
          projectMembers={projectMembers}
          isLoading={isLoading}
        />
      )}
      
      {subtasks.length > 0 ? (
        <div className="border rounded-md bg-white">
          {subtasks.map(subtask => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeleteSubtask}
            />
          ))}
        </div>
      ) : (
        !isAddingSubtask && (
          <div className="text-center py-3 text-sm text-gray-500 border rounded-md bg-gray-50">
            لا توجد مهام فرعية
          </div>
        )
      )}
    </div>
  );
};
