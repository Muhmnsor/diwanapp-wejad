
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Task } from "../types/task";
import { TaskItem } from "./TaskItem";
import { useState } from "react";
import { TaskAttachmentDialog } from "../../components/dialogs/TaskAttachmentDialog";
import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const filteredTasks = tasks.filter(task => 
    activeTab === "all" || task.status === activeTab
  );
  
  const [showAttachments, setShowAttachments] = useState<string | null>(null);
  
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
            <TableHead className="text-center">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.map(task => (
            <tr key={task.id}>
              <TaskItem
                task={task}
                getStatusBadge={getStatusBadge}
                getPriorityBadge={getPriorityBadge}
                formatDate={formatDate}
                onStatusChange={onStatusChange}
                projectId={projectId}
              />
              <td className="text-center p-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="px-2 mx-1"
                  onClick={() => setShowAttachments(task.id)}
                >
                  <Paperclip className="h-4 w-4 text-gray-500" />
                </Button>
              </td>
            </tr>
          ))}
        </TableBody>
      </Table>

      {showAttachments && (
        <TaskAttachmentDialog
          task={filteredTasks.find(t => t.id === showAttachments) || filteredTasks[0]}
          open={!!showAttachments}
          onOpenChange={(open) => {
            if (!open) setShowAttachments(null);
          }}
        />
      )}
    </div>
  );
};
