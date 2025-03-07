
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { CalendarIcon, Clock, Flag, Tag, User } from "lucide-react";
import { Task } from "@/types/workspace";
import { TaskDependenciesBadge } from "./components/TaskDependenciesBadge";
import { useTaskDependencies } from "./hooks/useTaskDependencies";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ViewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

export const ViewTaskDialog = ({ 
  open, 
  onOpenChange,
  task
}: ViewTaskDialogProps) => {
  const [assignedUserName, setAssignedUserName] = useState<string>("");
  const [stageName, setStageName] = useState<string>("");
  const { dependencies, isLoading: isDepsLoading } = useTaskDependencies(task?.id);
  
  useEffect(() => {
    const fetchUserAndStage = async () => {
      if (!task) return;
      
      // Fetch assigned user name
      if (task.assigned_to) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, email")
          .eq("id", task.assigned_to)
          .single();
          
        if (profile) {
          setAssignedUserName(profile.display_name || profile.email || "");
        }
      }
      
      // Fetch stage name
      if (task.stage_id) {
        const { data: stage } = await supabase
          .from("project_stages")
          .select("name")
          .eq("id", task.stage_id)
          .single();
          
        if (stage) {
          setStageName(stage.name);
        }
      }
    };
    
    if (open) {
      fetchUserAndStage();
    }
  }, [task, open]);

  if (!task) return null;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتملة';
      case 'in_progress':
        return 'قيد التنفيذ';
      case 'pending':
        return 'قيد الانتظار';
      case 'delayed':
        return 'متأخرة';
      default:
        return status;
    }
  };
  
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'عالية';
      case 'medium':
        return 'متوسطة';
      case 'low':
        return 'منخفضة';
      default:
        return priority;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] rtl">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getStatusColor(task.status || "pending")}>
              {getStatusLabel(task.status || "pending")}
            </Badge>
            <TaskDependenciesBadge taskId={task.id} />
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="details">تفاصيل المهمة</TabsTrigger>
            <TabsTrigger value="dependencies">الاعتماديات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">الوصف</h3>
                <div className="text-sm bg-muted/50 p-3 rounded-md">
                  {task.description || "لا يوجد وصف"}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                    <CalendarIcon className="ml-1 h-4 w-4" />
                    تاريخ الاستحقاق
                  </h3>
                  <p className="text-sm">
                    {task.due_date ? formatDate(task.due_date) : "غير محدد"}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                    <Flag className="ml-1 h-4 w-4" />
                    الأولوية
                  </h3>
                  <p className="text-sm">
                    {getPriorityLabel(task.priority || "medium")}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                    <User className="ml-1 h-4 w-4" />
                    المسؤول
                  </h3>
                  <p className="text-sm">
                    {assignedUserName || "غير محدد"}
                  </p>
                </div>
                
                {task.stage_id && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                      <Tag className="ml-1 h-4 w-4" />
                      المرحلة
                    </h3>
                    <p className="text-sm">
                      {stageName || "غير محدد"}
                    </p>
                  </div>
                )}
              </div>
              
              {task.category && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                    <Tag className="ml-1 h-4 w-4" />
                    التصنيف
                  </h3>
                  <p className="text-sm">{task.category}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                    <Clock className="ml-1 h-4 w-4" />
                    تاريخ الإنشاء
                  </h3>
                  <p className="text-sm">
                    {formatDate(task.created_at)}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                    <Clock className="ml-1 h-4 w-4" />
                    آخر تحديث
                  </h3>
                  <p className="text-sm">
                    {formatDate(task.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="dependencies" className="max-h-[60vh] overflow-y-auto p-1">
            {isDepsLoading ? (
              <div className="text-center p-4">جاري تحميل الاعتماديات...</div>
            ) : dependencies.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                لا توجد اعتماديات لهذه المهمة
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">اعتماديات المهمة:</h3>
                
                {dependencies.some(dep => dep.dependencyType === 'blocked_by' || dep.dependencyType === 'finish-to-start' || dep.dependencyType === 'start-to-start') && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">
                      مهام يجب إكمالها أولاً:
                    </h4>
                    {dependencies
                      .filter(dep => dep.dependencyType === 'blocked_by' || dep.dependencyType === 'finish-to-start' || dep.dependencyType === 'start-to-start')
                      .map(dep => (
                        <div 
                          key={dep.id} 
                          className="bg-muted/50 p-2 rounded-md flex items-center justify-between"
                        >
                          <span className="text-sm">{dep.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {dep.dependencyType === 'blocked_by' ? 'تعتمد على' : 
                             dep.dependencyType === 'finish-to-start' ? 'انتهاء -> بدء' : 
                             'بدء -> بدء'}
                          </Badge>
                        </div>
                      ))
                    }
                  </div>
                )}
                
                {dependencies.some(dep => dep.dependencyType === 'blocks') && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">
                      مهام تعتمد على هذه المهمة:
                    </h4>
                    {dependencies
                      .filter(dep => dep.dependencyType === 'blocks')
                      .map(dep => (
                        <div 
                          key={dep.id} 
                          className="bg-muted/50 p-2 rounded-md flex items-center justify-between"
                        >
                          <span className="text-sm">{dep.title}</span>
                          <Badge variant="outline" className="text-xs">
                            تعتمد عليها
                          </Badge>
                        </div>
                      ))
                    }
                  </div>
                )}
                
                {dependencies.some(dep => dep.dependencyType === 'relates_to' || dep.dependencyType === 'finish-to-finish') && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">
                      مهام مرتبطة:
                    </h4>
                    {dependencies
                      .filter(dep => dep.dependencyType === 'relates_to' || dep.dependencyType === 'finish-to-finish')
                      .map(dep => (
                        <div 
                          key={dep.id} 
                          className="bg-muted/50 p-2 rounded-md flex items-center justify-between"
                        >
                          <span className="text-sm">{dep.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {dep.dependencyType === 'relates_to' ? 'مرتبطة بـ' : 'انتهاء -> انتهاء'}
                          </Badge>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
