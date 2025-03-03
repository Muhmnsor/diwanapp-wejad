
import { useState } from "react";
import { AddSubtaskForm } from "./AddSubtaskForm";
import { SubtaskItem } from "./SubtaskItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Subtask } from "../../types/task";

interface SubtasksListProps {
  taskId: string;
  subtasks: Subtask[];
  projectId?: string;
  onAddSubtask: (taskId: string, title: string, dueDate?: string | null, assignedTo?: string | null) => Promise<void>;
  onUpdateSubtaskStatus: (subtaskId: string, newStatus: string) => Promise<void>;
  onDeleteSubtask: (subtaskId: string) => Promise<void>;
}

export const SubtasksList = ({
  taskId,
  subtasks,
  projectId,
  onAddSubtask,
  onUpdateSubtaskStatus,
  onDeleteSubtask
}: SubtasksListProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [priority, setPriority] = useState<string | null>(null);

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    
    try {
      console.log("Adding subtask with assigned to:", assignedTo);
      await onAddSubtask(taskId, newSubtaskTitle, dueDate, assignedTo);
      setNewSubtaskTitle("");
      setDueDate(null);
      setAssignedTo(null);
      setPriority(null);
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding subtask:", error);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">المهام الفرعية</h4>
        {!showAddForm && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 ml-1" />
            إضافة مهمة فرعية
          </Button>
        )}
      </div>

      {subtasks.length > 0 && (
        <ul className="space-y-2">
          {subtasks.map((subtask) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              onStatusChange={onUpdateSubtaskStatus}
              onDelete={onDeleteSubtask}
            />
          ))}
        </ul>
      )}

      {showAddForm && (
        <AddSubtaskForm
          value={newSubtaskTitle}
          onChange={setNewSubtaskTitle}
          onSubmit={handleAddSubtask}
          onCancel={() => setShowAddForm(false)}
          dueDate={dueDate}
          setDueDate={setDueDate}
          priority={priority}
          setPriority={setPriority}
          assignedTo={assignedTo}
          setAssignedTo={setAssignedTo}
          projectId={projectId}
        />
      )}

      {subtasks.length === 0 && !showAddForm && (
        <p className="text-sm text-gray-500">لا توجد مهام فرعية بعد.</p>
      )}
    </div>
  );
};
