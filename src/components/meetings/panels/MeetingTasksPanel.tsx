
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { NewTaskDialog } from '../dialogs/NewTaskDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { MeetingTask } from '../types';

interface MeetingTasksPanelProps {
  tasks: MeetingTask[];
  meetingId: string;
  onAddTask: (task: Omit<MeetingTask, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateTask: (params: { id: string, status: MeetingTask['status'] }) => void;
}

export const MeetingTasksPanel = ({ 
  tasks, 
  meetingId,
  onAddTask,
  onUpdateTask 
}: MeetingTasksPanelProps) => {
  const [taskType, setTaskType] = useState<'all' | 'preparation' | 'execution' | 'follow_up'>('all');
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);

  // Filter tasks based on type
  const filteredTasks = taskType === 'all' 
    ? tasks 
    : tasks.filter(task => task.task_type === taskType);

  // Split tasks by status
  const pendingTasks = filteredTasks.filter(task => task.status === 'pending');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in_progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');
  const cancelledTasks = filteredTasks.filter(task => task.status === 'cancelled');

  const handleStatusChange = (task: MeetingTask, checked: boolean) => {
    const newStatus = checked ? 'completed' : 'pending';
    onUpdateTask({ id: task.id, status: newStatus });
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'preparation': return 'تحضير';
      case 'execution': return 'تنفيذ';
      case 'follow_up': return 'متابعة';
      default: return type;
    }
  };

  const TaskItem = ({ task }: { task: MeetingTask }) => (
    <div className="flex items-start gap-3 p-3 border rounded-md">
      <Checkbox 
        id={`task-${task.id}`}
        checked={task.status === 'completed'}
        onCheckedChange={(checked) => handleStatusChange(task, checked as boolean)}
      />
      <div className="flex-1">
        <label 
          htmlFor={`task-${task.id}`}
          className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}
        >
          {task.title}
        </label>
        {task.description && (
          <p className={`mt-1 text-sm ${task.status === 'completed' ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
            {task.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="bg-primary/5">
            {getTaskTypeLabel(task.task_type)}
          </Badge>
          {task.due_date && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              <Calendar className="h-3 w-3 ml-1" />
              {format(new Date(task.due_date), 'dd/MM/yyyy')}
            </Badge>
          )}
          {task.assigned_to && task.assignee && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <User className="h-3 w-3 ml-1" />
              {task.assignee.display_name || task.assignee.email || 'مستخدم'}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">مهام الاجتماع</h2>
        <Button onClick={() => setShowNewTaskDialog(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة مهمة
        </Button>
      </div>

      <Tabs defaultValue="all" value={taskType} onValueChange={(value: any) => setTaskType(value)}>
        <TabsList>
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="preparation">التحضير</TabsTrigger>
          <TabsTrigger value="execution">التنفيذ</TabsTrigger>
          <TabsTrigger value="follow_up">المتابعة</TabsTrigger>
        </TabsList>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <Circle className="h-4 w-4 ml-2 text-gray-500" />
                  قيد الانتظار
                </CardTitle>
                <Badge variant="outline">{pendingTasks.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[40vh] overflow-y-auto">
              <div className="space-y-2">
                {pendingTasks.length === 0 ? (
                  <p className="text-center text-muted-foreground my-8">لا توجد مهام قيد الانتظار</p>
                ) : (
                  pendingTasks.map(task => <TaskItem key={task.id} task={task} />)
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <Clock className="h-4 w-4 ml-2 text-yellow-500" />
                  قيد التنفيذ
                </CardTitle>
                <Badge variant="outline">{inProgressTasks.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[40vh] overflow-y-auto">
              <div className="space-y-2">
                {inProgressTasks.length === 0 ? (
                  <p className="text-center text-muted-foreground my-8">لا توجد مهام قيد التنفيذ</p>
                ) : (
                  inProgressTasks.map(task => <TaskItem key={task.id} task={task} />)
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />
                  مكتملة
                </CardTitle>
                <Badge variant="outline">{completedTasks.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[40vh] overflow-y-auto">
              <div className="space-y-2">
                {completedTasks.length === 0 ? (
                  <p className="text-center text-muted-foreground my-8">لا توجد مهام مكتملة</p>
                ) : (
                  completedTasks.map(task => <TaskItem key={task.id} task={task} />)
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Tabs>

      <NewTaskDialog 
        open={showNewTaskDialog} 
        onOpenChange={setShowNewTaskDialog}
        meetingId={meetingId}
        onAddTask={onAddTask}
      />
    </div>
  );
};
