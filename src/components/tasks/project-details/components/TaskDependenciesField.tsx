
import { useState, useEffect } from "react";
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
import { AlertCircle, Plus, X, ArrowDown, ArrowUp, Link, GitMerge, GitBranch, Clock, Flag } from "lucide-react";
import { Task } from "@/types/workspace";
import { useProjectTasks } from "../hooks/useProjectTasks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DependencyType } from "../hooks/useTaskDependencies";

export interface TaskDependency {
  id?: string;
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
  const [activeTab, setActiveTab] = useState<string>("select-task");
  
  const { tasks, isLoading, error } = useProjectTasks(projectId);
  
  const availableTasks = tasks.filter(task => {
    const alreadySelected = selectedDependencies.some(dep => dep.taskId === task.id);
    const isCurrentTask = currentTaskId === task.id;
    return !alreadySelected && !isCurrentTask;
  });

  const tasksByStatus = {
    completed: availableTasks.filter(task => task.status === 'completed'),
    inProgress: availableTasks.filter(task => task.status === 'in_progress'),
    pending: availableTasks.filter(task => task.status === 'pending'),
    other: availableTasks.filter(task => 
      !['completed', 'in_progress', 'pending'].includes(task.status || '')
    )
  };
  
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
      case 'finish-to-start':
        return 'لا تبدأ حتى تنتهي';
      case 'start-to-start':
        return 'تبدأ مع بداية';
      case 'finish-to-finish':
        return 'تنتهي مع نهاية';
      default:
        return dependencyType;
    }
  };
  
  const getDependencyIcon = (dependencyType: DependencyType) => {
    switch (dependencyType) {
      case 'blocks':
        return <ArrowDown className="h-3.5 w-3.5 ml-1" />;
      case 'blocked_by':
        return <ArrowUp className="h-3.5 w-3.5 ml-1" />;
      case 'relates_to':
        return <Link className="h-3.5 w-3.5 ml-1" />;
      case 'finish-to-start':
        return <Flag className="h-3.5 w-3.5 ml-1" />;
      case 'start-to-start':
        return <Clock className="h-3.5 w-3.5 ml-1" />;
      case 'finish-to-finish':
        return <GitMerge className="h-3.5 w-3.5 ml-1" />;
      default:
        return null;
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
          <DialogContent className="sm:max-w-[550px]">
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
                <Tabs defaultValue="select-task" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="select-task">اختيار المهمة</TabsTrigger>
                    <TabsTrigger value="dependency-type">نوع الاعتمادية</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="select-task" className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="task">المهمة</Label>
                      
                      <Select
                        value={selectedTaskId}
                        onValueChange={(value) => {
                          setSelectedTaskId(value);
                          setActiveTab("dependency-type");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر مهمة" />
                        </SelectTrigger>
                        <SelectContent>
                          <ScrollArea className="h-[300px]">
                            {tasksByStatus.completed.length > 0 && (
                              <>
                                <div className="px-2 py-1.5 text-xs font-semibold bg-green-50">
                                  مهام مكتملة
                                </div>
                                {tasksByStatus.completed.map(task => (
                                  <SelectItem key={task.id} value={task.id}>
                                    {task.title}
                                  </SelectItem>
                                ))}
                              </>
                            )}
                            
                            {tasksByStatus.inProgress.length > 0 && (
                              <>
                                <div className="px-2 py-1.5 text-xs font-semibold bg-blue-50">
                                  مهام قيد التنفيذ
                                </div>
                                {tasksByStatus.inProgress.map(task => (
                                  <SelectItem key={task.id} value={task.id}>
                                    {task.title}
                                  </SelectItem>
                                ))}
                              </>
                            )}
                            
                            {tasksByStatus.pending.length > 0 && (
                              <>
                                <div className="px-2 py-1.5 text-xs font-semibold bg-gray-50">
                                  مهام معلقة
                                </div>
                                {tasksByStatus.pending.map(task => (
                                  <SelectItem key={task.id} value={task.id}>
                                    {task.title}
                                  </SelectItem>
                                ))}
                              </>
                            )}
                            
                            {tasksByStatus.other.length > 0 && (
                              <>
                                <div className="px-2 py-1.5 text-xs font-semibold bg-gray-50">
                                  مهام أخرى
                                </div>
                                {tasksByStatus.other.map(task => (
                                  <SelectItem key={task.id} value={task.id}>
                                    {task.title}
                                  </SelectItem>
                                ))}
                              </>
                            )}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                      
                      {selectedTaskId && (
                        <div className="text-xs text-muted-foreground mt-2">
                          تم اختيار المهمة. الآن حدد نوع الاعتمادية.
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("dependency-type")}
                        disabled={!selectedTaskId}
                      >
                        التالي: تحديد نوع الاعتمادية
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="dependency-type" className="space-y-4 py-2">
                    {selectedTaskId && (
                      <div className="mb-4 p-2 border rounded-md bg-muted/40">
                        <p className="text-sm font-medium">المهمة المختارة:</p>
                        <p className="text-sm text-muted-foreground">{getTaskById(selectedTaskId)?.title}</p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="dependencyType">نوع الاعتمادية</Label>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <div 
                          className={`border rounded-md p-3 cursor-pointer ${selectedDependencyType === 'finish-to-start' ? 'border-primary bg-primary/5' : ''}`}
                          onClick={() => setSelectedDependencyType('finish-to-start')}
                        >
                          <div className="flex items-center">
                            <Flag className="h-4 w-4 ml-2 text-primary" />
                            <div>
                              <p className="font-medium">لا تبدأ حتى تنتهي</p>
                              <p className="text-sm text-muted-foreground">
                                هذه المهمة لا يمكن أن تبدأ إلا بعد انتهاء المهمة المختارة
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className={`border rounded-md p-3 cursor-pointer ${selectedDependencyType === 'blocks' ? 'border-primary bg-primary/5' : ''}`}
                          onClick={() => setSelectedDependencyType('blocks')}
                        >
                          <div className="flex items-center">
                            <ArrowDown className="h-4 w-4 ml-2 text-primary" />
                            <div>
                              <p className="font-medium">هذه المهمة مطلوبة لـ</p>
                              <p className="text-sm text-muted-foreground">
                                المهمة المختارة تعتمد على إكمال هذه المهمة
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className={`border rounded-md p-3 cursor-pointer ${selectedDependencyType === 'blocked_by' ? 'border-primary bg-primary/5' : ''}`}
                          onClick={() => setSelectedDependencyType('blocked_by')}
                        >
                          <div className="flex items-center">
                            <ArrowUp className="h-4 w-4 ml-2 text-primary" />
                            <div>
                              <p className="font-medium">هذه المهمة تعتمد على</p>
                              <p className="text-sm text-muted-foreground">
                                هذه المهمة تتطلب إكمال المهمة المختارة أولاً
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className={`border rounded-md p-3 cursor-pointer ${selectedDependencyType === 'start-to-start' ? 'border-primary bg-primary/5' : ''}`}
                          onClick={() => setSelectedDependencyType('start-to-start')}
                        >
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 ml-2 text-primary" />
                            <div>
                              <p className="font-medium">تبدأ مع بداية</p>
                              <p className="text-sm text-muted-foreground">
                                هذه المهمة يجب أن تبدأ مع بداية المهمة المختارة
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className={`border rounded-md p-3 cursor-pointer ${selectedDependencyType === 'finish-to-finish' ? 'border-primary bg-primary/5' : ''}`}
                          onClick={() => setSelectedDependencyType('finish-to-finish')}
                        >
                          <div className="flex items-center">
                            <GitMerge className="h-4 w-4 ml-2 text-primary" />
                            <div>
                              <p className="font-medium">تنتهي مع نهاية</p>
                              <p className="text-sm text-muted-foreground">
                                هذه المهمة لا يمكن أن تنتهي إلا مع نهاية المهمة المختارة
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className={`border rounded-md p-3 cursor-pointer ${selectedDependencyType === 'relates_to' ? 'border-primary bg-primary/5' : ''}`}
                          onClick={() => setSelectedDependencyType('relates_to')}
                        >
                          <div className="flex items-center">
                            <Link className="h-4 w-4 ml-2 text-primary" />
                            <div>
                              <p className="font-medium">مرتبطة بـ</p>
                              <p className="text-sm text-muted-foreground">
                                هذه المهمة مرتبطة بالمهمة المختارة ولكن بدون اعتماد
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-4">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("select-task")}
                      >
                        رجوع: تغيير المهمة
                      </Button>
                      
                      <Button 
                        onClick={handleAddDependency} 
                        disabled={!selectedTaskId}
                      >
                        إضافة الاعتمادية
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
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
                    <Badge variant="outline">
                      {getDependencyIcon(dependency.dependencyType)}
                      {getDependencyLabel(dependency.dependencyType)}
                    </Badge>
                    <span className="text-sm">{task.title}</span>
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
