
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, X } from "lucide-react";
import { Task } from "@/types/workspace";
import { useProjectTasks } from "../hooks/useProjectTasks";

export type DependencyType = 'blocks' | 'blocked_by' | 'relates_to';

export interface TaskDependency {
  taskId: string;
  dependencyType: DependencyType;
}

interface TaskDependenciesFieldProps {
  projectId?: string;
  selectedDependencies: TaskDependency[];
  setSelectedDependencies: (dependencies: TaskDependency[]) => void;
  currentTaskId?: string; // For edit mode to exclude current task
}

export const TaskDependenciesField = ({
  projectId,
  selectedDependencies,
  setSelectedDependencies,
  currentTaskId
}: TaskDependenciesFieldProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [selectedDependencyType, setSelectedDependencyType] = useState<DependencyType>("blocks");
  
  const { tasks, isLoading, error } = useProjectTasks(projectId);
  
  // Filter out tasks that are already selected or the current task (in edit mode)
  const availableTasks = tasks.filter(task => {
    const alreadySelected = selectedDependencies.some(dep => dep.taskId === task.id);
    const isCurrentTask = currentTaskId === task.id;
    return !alreadySelected && !isCurrentTask;
  });
  
  const handleAddDependency = () => {
    if (!selectedTaskId) return;
    
    setSelectedDependencies([
      ...selectedDependencies,
      {
        taskId: selectedTaskId,
        dependencyType: selectedDependencyType
      }
    ]);
    
    setSelectedTaskId("");
    setSelectedDependencyType("blocks");
    setIsDialogOpen(false);
  };
  
  const handleRemoveDependency = (taskId: string) => {
    setSelectedDependencies(
      selectedDependencies.filter(dep => dep.taskId !== taskId)
    );
  };
  
  const getDependencyLabel = (dependencyType: DependencyType): string => {
    switch (dependencyType) {
      case 'blocks':
        return 'تعتمد عليها';
      case 'blocked_by':
        return 'تعتمد على';
      case 'relates_to':
        return 'مرتبطة بـ';
      default:
        return dependencyType;
    }
  };
  
  const getTaskById = (taskId: string): Task | undefined => {
    return tasks.find(task => task.id === taskId);
  };
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label>اعتماديات المهمة</Label>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              disabled={availableTasks.length === 0}
            >
              <Plus className="h-3.5 w-3.5" />
              إضافة اعتمادية
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>إضافة اعتمادية للمهمة</DialogTitle>
            </DialogHeader>
            
            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>خطأ في تحميل المهام</AlertDescription>
              </Alert>
            ) : isLoading ? (
              <div className="text-center p-4">جاري تحميل المهام...</div>
            ) : availableTasks.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                لا يوجد مهام متاحة للاعتمادية
              </div>
            ) : (
              <>
                <div className="grid gap-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="task">المهمة</Label>
                    <Select
                      value={selectedTaskId}
                      onValueChange={setSelectedTaskId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مهمة" />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="h-[200px]">
                          {availableTasks.map(task => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.title}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dependencyType">نوع الاعتمادية</Label>
                    <Select
                      value={selectedDependencyType}
                      onValueChange={(value) => setSelectedDependencyType(value as DependencyType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الاعتمادية" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blocks">تعتمد عليها</SelectItem>
                        <SelectItem value="blocked_by">تعتمد على</SelectItem>
                        <SelectItem value="relates_to">مرتبطة بـ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button 
                    onClick={handleAddDependency} 
                    disabled={!selectedTaskId}
                  >
                    إضافة
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="border rounded-md p-3 min-h-[100px]">
        {selectedDependencies.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            لم يتم إضافة اعتماديات بعد
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDependencies.map(dependency => {
              const task = getTaskById(dependency.taskId);
              if (!task) return null;
              
              return (
                <div 
                  key={dependency.taskId}
                  className="flex items-center justify-between bg-muted/50 p-2 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{getDependencyLabel(dependency.dependencyType)}</Badge>
                    <span>{task.title}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDependency(dependency.taskId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
