
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubtaskItem } from "./SubtaskItem";
import { AddSubtaskForm } from "./AddSubtaskForm";
import { toast } from "sonner";
import { Subtask } from "../../types/subtask";
import { useProjectMembers } from "../../hooks/useProjectMembers";
import { 
  fetchSubtasks, 
  addSubtask, 
  updateSubtaskStatus, 
  deleteSubtask 
} from "../../services/subtasksService";

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
      fetchSubtasksData();
    }
  }, [taskId, externalSubtasks]);
  
  const fetchSubtasksData = async () => {
    if (!taskId) return;
    
    setIsLoading(true);
    const { data, error } = await fetchSubtasks(taskId);
    setSubtasks(data);
    setError(error);
    setIsLoading(false);
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
      const { success, error } = await addSubtask(taskId, title, dueDate, assignedTo);
      
      if (success) {
        toast.success("تمت إضافة المهمة الفرعية");
        await fetchSubtasksData();
      } else if (error) {
        toast.error(error);
      }
      
      setIsLoading(false);
      setIsAddingSubtask(false);
    }
  };
  
  const handleUpdateStatus = async (subtaskId: string, newStatus: string) => {
    if (externalUpdateStatus) {
      await externalUpdateStatus(subtaskId, newStatus);
    } else {
      const { success, error } = await updateSubtaskStatus(subtaskId, newStatus);
      
      if (success) {
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
      } else if (error) {
        toast.error(error);
      }
    }
  };
  
  const handleDeleteSubtask = async (subtaskId: string) => {
    if (externalDeleteSubtask) {
      await externalDeleteSubtask(subtaskId);
    } else {
      const { success, error } = await deleteSubtask(subtaskId);
      
      if (success) {
        setSubtasks(prevSubtasks => 
          prevSubtasks.filter(subtask => subtask.id !== subtaskId)
        );
        
        toast.success("تم حذف المهمة الفرعية");
      } else if (error) {
        toast.error(error);
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
