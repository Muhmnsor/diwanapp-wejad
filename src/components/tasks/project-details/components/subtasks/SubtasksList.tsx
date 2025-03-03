
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, ChevronDown, ChevronUp } from "lucide-react";
import { SubtaskItem } from "./SubtaskItem";
import { AddSubtaskForm } from "./AddSubtaskForm";

interface Subtask {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
}

interface SubtasksListProps {
  taskId: string;
  projectId: string;
  subtasks: Subtask[];
  onAddSubtask: (taskId: string, subtaskTitle: string, dueDate: string, assignedTo: string, priority: string) => Promise<void>;
  onUpdateSubtaskStatus: (subtaskId: string, newStatus: string) => Promise<void>;
  onDeleteSubtask: (subtaskId: string) => Promise<void>;
}

export const SubtasksList = ({
  taskId,
  projectId,
  subtasks,
  onAddSubtask,
  onUpdateSubtaskStatus,
  onDeleteSubtask
}: SubtasksListProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const handleAddSubtask = async (dueDate: string, assignedTo: string, priority: string) => {
    if (!newSubtaskTitle.trim()) return;
    
    try {
      console.log("SubtasksList - Adding subtask:", { taskId, newSubtaskTitle, dueDate, assignedTo, priority });
      await onAddSubtask(taskId, newSubtaskTitle, dueDate, assignedTo, priority);
      setNewSubtaskTitle("");
      setIsAddingSubtask(false);
    } catch (error) {
      console.error("Error adding subtask:", error);
    }
  };

  if (subtasks.length === 0 && !isAddingSubtask) {
    return (
      <div className="mt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs font-normal text-muted-foreground"
          onClick={() => setIsAddingSubtask(true)}
        >
          <PlusCircle className="h-3.5 w-3.5 mr-1" />
          إضافة مهمة فرعية
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-3 border-t pt-2">
      <div className="flex items-center justify-between mb-2">
        <button 
          className="flex items-center text-sm font-medium text-muted-foreground"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 mr-1" />
          ) : (
            <ChevronDown className="h-4 w-4 mr-1" />
          )}
          المهام الفرعية ({subtasks.length})
        </button>
        
        {!isAddingSubtask && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-7 px-2"
            onClick={() => setIsAddingSubtask(true)}
          >
            <PlusCircle className="h-3.5 w-3.5 ml-1" />
            إضافة
          </Button>
        )}
      </div>
      
      {isExpanded && (
        <div className="space-y-2">
          {isAddingSubtask && (
            <AddSubtaskForm 
              value={newSubtaskTitle}
              onChange={setNewSubtaskTitle}
              onSubmit={handleAddSubtask}
              onCancel={() => {
                setIsAddingSubtask(false);
                setNewSubtaskTitle("");
              }}
              projectId={projectId}
            />
          )}
          
          {subtasks.map(subtask => (
            <SubtaskItem 
              key={subtask.id}
              subtask={subtask}
              onStatusChange={onUpdateSubtaskStatus}
              onDelete={onDeleteSubtask}
            />
          ))}
        </div>
      )}
    </div>
  );
};
