
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMeetingTasks } from "@/hooks/meetings/useMeetingTasks";
import { Plus, Calendar, Circle, CheckCircle, XCircle, Clock } from "lucide-react";
import { AddTaskDialog } from "../tasks/AddTaskDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/dateUtils";

interface MeetingTasksProps {
  meetingId: string;
}

export const MeetingTasks: React.FC<MeetingTasksProps> = ({ meetingId }) => {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const { data: tasks, isLoading, error, refetch } = useMeetingTasks(meetingId);
  
  const handleTaskAdded = () => {
    refetch();
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      default:
        return <Circle className="h-4 w-4 text-yellow-500" />;
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتملة';
      case 'in_progress': return 'قيد التنفيذ';
      case 'cancelled': return 'ملغاة';
      case 'pending':
      default: return 'قيد الانتظار';
    }
  };
  
  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'action_item': return 'بند إجراء';
      case 'follow_up': return 'متابعة';
      case 'decision': return 'قرار';
      case 'other': return 'أخرى';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3 flex justify-between items-center">
          <CardTitle>المهام</CardTitle>
          <Button variant="outline" size="sm" disabled>
            <Plus className="h-4 w-4 ml-2" />
            إضافة مهمة
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Error fetching meeting tasks:', error);
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3 flex justify-between items-center">
          <CardTitle>المهام</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsAddTaskOpen(true)}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة مهمة
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">حدث خطأ أثناء تحميل المهام</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-3 flex flex-row justify-between items-center">
          <CardTitle>المهام ({tasks?.length || 0})</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsAddTaskOpen(true)}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة مهمة
          </Button>
        </CardHeader>
        <CardContent>
          {!tasks || tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-4">لا توجد مهام مضافة بعد</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{task.title}</h3>
                      {task.description && (
                        <p className="text-gray-600 mt-1">{task.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span className="text-sm">{getStatusLabel(task.status)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">النوع:</span>
                      <span>{getTaskTypeLabel(task.task_type)}</span>
                    </div>
                    
                    {task.assigned_to && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">المسؤول:</span>
                        <span>{task.assigned_to}</span>
                      </div>
                    )}
                    
                    {task.due_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>تاريخ الاستحقاق: {formatDate(task.due_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <AddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        meetingId={meetingId}
        onSuccess={handleTaskAdded}
      />
    </>
  );
};
