
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Task } from "../../../types/task";

interface DependencySelectorProps {
  availableTasks: Task[];
  isLoadingTasks: boolean;
  selectedTaskId: string;
  onSelectedTaskChange: (taskId: string) => void;
  onAddDependency: () => void;
  isAdding: boolean;
}

export const DependencySelector = ({
  availableTasks,
  isLoadingTasks,
  selectedTaskId,
  onSelectedTaskChange,
  onAddDependency,
  isAdding
}: DependencySelectorProps) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">إضافة اعتمادية جديدة</h3>
      
      {isLoadingTasks ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : availableTasks.length === 0 ? (
        <div className="text-sm text-muted-foreground py-2 italic">
          لا توجد مهام متاحة لإضافتها كاعتمادية
        </div>
      ) : (
        <div className="flex gap-2">
          <Select value={selectedTaskId} onValueChange={onSelectedTaskChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="اختر مهمة" />
            </SelectTrigger>
            <SelectContent>
              {availableTasks.map(task => (
                <SelectItem key={task.id} value={task.id}>
                  {task.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={onAddDependency} 
            disabled={!selectedTaskId || isAdding}
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            إضافة
          </Button>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-1">
        هذه المهمة ستعتمد على المهام المختارة (لا يمكن إكمالها حتى تكتمل المهمة المختارة)
      </p>
    </div>
  );
};
