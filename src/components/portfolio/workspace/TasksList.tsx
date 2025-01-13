import { Card } from "@/components/ui/card";
import { Calendar, ListChecks, User } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  assigned_to?: {
    email: string;
  };
  gid?: string; // For Asana tasks
}

interface TasksListProps {
  tasks: Task[];
  projectId?: string;
}

export const TasksList = ({ tasks }: TasksListProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">المهام</h2>
      {tasks?.length > 0 ? (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id || task.gid} className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">{task.title}</h3>
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-500">{task.description}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    task.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status === 'completed' ? 'مكتمل' : 'قيد التنفيذ'}
                  </span>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {task.due_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(task.due_date).toLocaleDateString('ar-SA')}</span>
                      </div>
                    )}
                    {task.assigned_to && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{task.assigned_to.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">لا توجد مهام في مساحة العمل هذه</p>
      )}
    </div>
  );
};