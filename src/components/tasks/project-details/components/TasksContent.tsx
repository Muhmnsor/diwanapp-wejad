
import { Skeleton } from "@/components/ui/skeleton";
import { Task } from "../types/task";
import { TasksStageGroup } from "./TasksStageGroup";
import { TaskCard } from "./TaskCard";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MessageCircle, Paperclip } from "lucide-react";
import { useState } from "react";
import { TaskDiscussionDialog } from "../../components/TaskDiscussionDialog";
import { TaskAttachmentDialog } from "../../components/dialogs/TaskAttachmentDialog";

interface TasksContentProps {
  isLoading: boolean;
  activeTab: string;
  filteredTasks: Task[];
  projectStages: { id: string; name: string }[];
  tasksByStage: Record<string, Task[]>;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string | undefined;
}

export const TasksContent = ({
  isLoading,
  activeTab,
  filteredTasks,
  projectStages,
  tasksByStage,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId
}: TasksContentProps) => {
  const [taskDialogs, setTaskDialogs] = useState<{ [key: string]: { discussion: boolean; attachments: boolean } }>({});
  
  const toggleDiscussion = (taskId: string, state?: boolean) => {
    setTaskDialogs(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId] || { discussion: false, attachments: false },
        discussion: state !== undefined ? state : !(prev[taskId]?.discussion || false)
      }
    }));
  };
  
  const toggleAttachments = (taskId: string, state?: boolean) => {
    setTaskDialogs(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId] || { discussion: false, attachments: false },
        attachments: state !== undefined ? state : !(prev[taskId]?.attachments || false)
      }
    }));
  };
  
  if (isLoading) {
    return (
      <div className="space-y-3" dir="rtl">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md border" dir="rtl">
        <p className="text-gray-500">لا توجد مهام {activeTab !== "all" && "بهذه الحالة"}</p>
      </div>
    );
  }

  // إذا كان التبويب النشط هو "الكل"، فسنعرض المهام مقسمة حسب المراحل
  if (activeTab === "all" && projectStages.length > 0) {
    return (
      <div className="space-y-6" dir="rtl">
        {projectStages.map(stage => (
          <div key={stage.id} className="border rounded-md overflow-hidden">
            <div className="bg-gray-50 p-3 border-b">
              <h3 className="font-medium">{stage.name}</h3>
            </div>
            <Table dir="rtl">
              <TableHeader>
                <TableRow>
                  <TableHead>المهمة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead>المكلف</TableHead>
                  <TableHead>تاريخ الاستحقاق</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(tasksByStage[stage.id] || []).map(task => {
                  const dialogState = taskDialogs[task.id] || { discussion: false, attachments: false };
                  
                  return (
                    <TableRow key={task.id}>
                      <TableCell>{task.title}</TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>{task.assigned_user_name || 'غير محدد'}</TableCell>
                      <TableCell>{formatDate(task.due_date)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-xs flex items-center gap-1"
                            onClick={() => toggleAttachments(task.id)}
                          >
                            <Paperclip className="h-3.5 w-3.5" />
                            المرفقات
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-xs flex items-center gap-1"
                            onClick={() => toggleDiscussion(task.id)}
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            مناقشة
                          </Button>
                          
                          {/* Additional actions as needed */}
                        </div>
                        
                        {dialogState.discussion && (
                          <TaskDiscussionDialog 
                            open={dialogState.discussion} 
                            onOpenChange={(open) => toggleDiscussion(task.id, open)}
                            task={task}
                          />
                        )}
                        
                        {dialogState.attachments && (
                          <TaskAttachmentDialog
                            task={task}
                            open={dialogState.attachments}
                            onOpenChange={(open) => toggleAttachments(task.id, open)}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    );
  }

  // عرض المهام كقائمة بدون تقسيم للتبويبات الأخرى
  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-white rounded-md shadow-sm overflow-hidden border">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-medium">المهام</h3>
        </div>
        <div className="border rounded-md overflow-hidden">
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead>المهمة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الأولوية</TableHead>
                <TableHead>المكلف</TableHead>
                <TableHead>تاريخ الاستحقاق</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map(task => {
                const dialogState = taskDialogs[task.id] || { discussion: false, attachments: false };
                
                return (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>{task.assigned_user_name || 'غير محدد'}</TableCell>
                    <TableCell>{formatDate(task.due_date)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-xs flex items-center gap-1"
                          onClick={() => toggleAttachments(task.id)}
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          المرفقات
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-xs flex items-center gap-1"
                          onClick={() => toggleDiscussion(task.id)}
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          مناقشة
                        </Button>
                        
                        {/* Additional actions as needed */}
                      </div>
                      
                      {dialogState.discussion && (
                        <TaskDiscussionDialog 
                          open={dialogState.discussion} 
                          onOpenChange={(open) => toggleDiscussion(task.id, open)}
                          task={task}
                        />
                      )}
                      
                      {dialogState.attachments && (
                        <TaskAttachmentDialog
                          task={task}
                          open={dialogState.attachments}
                          onOpenChange={(open) => toggleAttachments(task.id, open)}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
