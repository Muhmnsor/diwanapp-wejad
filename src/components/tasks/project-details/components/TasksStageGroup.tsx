
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
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
    <div className="border rounded-md overflow-hidden mb-4" dir="rtl">
      <div className="bg-gray-50 p-3 border-b">
        <h3 className="font-medium">{stage.name}</h3>
      </div>
      <div className="overflow-x-auto">
        <Table dir="rtl" className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%] text-right font-medium">المهمة</TableHead>
              <TableHead className="w-[12%] text-right font-medium">الحالة</TableHead>
              <TableHead className="w-[12%] text-right font-medium">الأولوية</TableHead>
              <TableHead className="w-[15%] text-right font-medium">المكلف</TableHead>
              <TableHead className="w-[15%] text-right font-medium">تاريخ الاستحقاق</TableHead>
              <TableHead className="w-[6%] text-center font-medium">المرفقات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map(task => (
              <TableRow key={task.id}>
                <TaskItem
                  key={task.id}
                  task={task}
                  getStatusBadge={getStatusBadge}
                  getPriorityBadge={getPriorityBadge}
                  formatDate={formatDate}
                  onStatusChange={onStatusChange}
                  projectId={projectId}
                />
                <TableCell className="text-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="px-2 mx-auto"
                    onClick={() => setShowAttachments(task.id)}
                  >
                    <Paperclip className="h-4 w-4 text-gray-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
