
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Task } from "../types/task";
import { Button } from "@/components/ui/button";
import { MessageCircle, Paperclip } from "lucide-react";
import { useState } from "react";
import { TaskDiscussionDialog } from "../../components/TaskDiscussionDialog";
import { TaskAttachmentDialog } from "../../components/dialogs/TaskAttachmentDialog";

interface TasksStageGroupProps {
  stage: { id: string; name: string };
  tasks: Task[];
  activeTab: string;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
}

export const TasksStageGroup = ({
  stage,
  tasks,
  activeTab,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId
}: TasksStageGroupProps) => {
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
  
  const filteredTasks = tasks.filter(task => 
    activeTab === "all" || task.status === activeTab
  );
  
  if (filteredTasks.length === 0) return null;
  
  return (
    <div className="border rounded-md overflow-hidden" dir="rtl">
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
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleAttachments(task.id)}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleDiscussion(task.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
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
  );
};
