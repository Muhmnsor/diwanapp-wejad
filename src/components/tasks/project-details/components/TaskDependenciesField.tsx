
import { useEffect, useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import { useTaskDependencies } from "../hooks/useTaskDependencies";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TaskDependenciesFieldProps {
  form: UseFormReturn<any>;
  taskId?: string;
  projectId: string;
}

export const TaskDependenciesField = ({
  form,
  taskId,
  projectId
}: TaskDependenciesFieldProps) => {
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [dependencyType, setDependencyType] = useState<string>("finish-to-start");
  const [isAddingDependency, setIsAddingDependency] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    blockedByDependencies,
    isLoading: isDepsLoading,
    addDependency,
    removeDependency,
    detectCircularDependencies
  } = useTaskDependencies(taskId);

  // Fetch available tasks for this project
  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId) return;
      
      setIsLoadingTasks(true);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('id, title, status')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Filter out the current task
        const filteredTasks = data?.filter(t => t.id !== taskId) || [];
        setAvailableTasks(filteredTasks);
      } catch (err) {
        console.error('Error fetching tasks for dependencies:', err);
        toast.error("حدث خطأ أثناء جلب المهام المتاحة");
      } finally {
        setIsLoadingTasks(false);
      }
    };
    
    fetchTasks();
  }, [projectId, taskId]);

  const handleAddDependency = async () => {
    if (!selectedTask || !dependencyType || !taskId) {
      setError("الرجاء اختيار مهمة ونوع التبعية");
      return;
    }
    
    setIsAddingDependency(true);
    setError(null);
    
    try {
      // Check for circular dependencies
      const wouldCreateCircular = await detectCircularDependencies(taskId);
      if (wouldCreateCircular) {
        setError("لا يمكن إضافة هذه التبعية لأنها ستؤدي إلى تبعية دائرية");
        return;
      }
      
      const result = await addDependency(selectedTask, dependencyType);
      
      if (!result.success) {
        setError(result.error || "حدث خطأ أثناء إضافة التبعية");
        return;
      }
      
      toast.success("تمت إضافة التبعية بنجاح");
      setSelectedTask("");
    } catch (err) {
      console.error("Error adding dependency:", err);
      setError("حدث خطأ أثناء إضافة التبعية");
    } finally {
      setIsAddingDependency(false);
    }
  };

  const handleRemoveDependency = async (dependencyId: string) => {
    try {
      const result = await removeDependency(dependencyId);
      
      if (!result.success) {
        toast.error(result.error || "حدث خطأ أثناء حذف التبعية");
        return;
      }
      
      toast.success("تم حذف التبعية بنجاح");
    } catch (err) {
      console.error("Error removing dependency:", err);
      toast.error("حدث خطأ أثناء حذف التبعية");
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="dependencies"
        render={({ field }) => (
          <FormItem>
            <FormLabel>تبعيات المهمة</FormLabel>
            <FormControl>
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {/* Current Dependencies */}
                <div className="space-y-2">
                  <h4 className="text-sm text-muted-foreground">التبعيات الحالية:</h4>
                  
                  {isDepsLoading ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2 text-sm">جاري التحميل...</span>
                    </div>
                  ) : blockedByDependencies.length === 0 ? (
                    <div className="text-sm text-muted-foreground">لا توجد تبعيات حالية</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {blockedByDependencies.map(dep => (
                        <Badge key={dep.id} variant="outline" className="flex items-center gap-1">
                          <span>{dep.title}</span>
                          <span className="text-xs">
                            ({dep.dependency_type === 'finish-to-start' ? 'اكتمال قبل البدء' :
                              dep.dependency_type === 'start-to-start' ? 'بدء قبل البدء' :
                              dep.dependency_type === 'finish-to-finish' ? 'اكتمال قبل الاكتمال' :
                              dep.dependency_type === 'blocked_by' ? 'ممنوع بواسطة' :
                              dep.dependency_type === 'blocks' ? 'يمنع' : 'مرتبط'})
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => handleRemoveDependency(dep.id)}
                          >
                            &times;
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Add New Dependency */}
                {taskId && (
                  <div className="flex flex-col space-y-2">
                    <h4 className="text-sm text-muted-foreground">إضافة تبعية جديدة:</h4>
                    
                    <div className="grid grid-cols-5 gap-2">
                      <div className="col-span-2">
                        <Select
                          value={selectedTask}
                          onValueChange={setSelectedTask}
                          disabled={isLoadingTasks}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر مهمة" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingTasks ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="ml-2">جاري التحميل...</span>
                              </div>
                            ) : availableTasks.length === 0 ? (
                              <div className="p-2 text-center text-muted-foreground">
                                لا توجد مهام متاحة
                              </div>
                            ) : (
                              <SelectGroup>
                                <SelectLabel>المهام المتاحة</SelectLabel>
                                {availableTasks.map(task => (
                                  <SelectItem key={task.id} value={task.id}>
                                    {task.title}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="col-span-2">
                        <Select
                          value={dependencyType}
                          onValueChange={setDependencyType}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="نوع التبعية" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>نوع التبعية</SelectLabel>
                              <SelectItem value="finish-to-start">يجب اكتمالها قبل البدء</SelectItem>
                              <SelectItem value="start-to-start">يجب بدؤها قبل البدء</SelectItem>
                              <SelectItem value="finish-to-finish">يجب اكتمالها قبل الاكتمال</SelectItem>
                              <SelectItem value="relates_to">مرتبطة بـ</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="col-span-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="w-full"
                          onClick={handleAddDependency}
                          disabled={isAddingDependency || !selectedTask}
                        >
                          {isAddingDependency ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'إضافة'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
