
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { TaskFormFields } from '../form/TaskFormFields';
import { useTaskForm } from '../hooks/useTaskForm';
import { useUsers } from '../hooks/useUsers';
import { MeetingTask } from '../types';

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
  onAddTask: (task: Omit<MeetingTask, 'id' | 'created_at' | 'updated_at'>) => void;
}

export const NewTaskDialog = ({ 
  open, 
  onOpenChange,
  meetingId,
  onAddTask 
}: NewTaskDialogProps) => {
  // Use the custom hooks
  const { form, onSubmit } = useTaskForm({
    meetingId,
    onAddTask,
    onClose: () => onOpenChange(false)
  });

  const { data: users = [], isLoading: isLoadingUsers } = useUsers();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة مهمة جديدة</DialogTitle>
          <DialogDescription>
            قم بإدخال معلومات المهمة وإسنادها لأحد المشاركين
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TaskFormFields 
              form={form} 
              users={users} 
              isLoadingUsers={isLoadingUsers} 
            />

            <DialogFooter>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button type="submit">
                إضافة المهمة
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
