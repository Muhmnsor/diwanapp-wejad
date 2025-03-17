
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MeetingTask } from '../types';

// Define the form schema
const taskFormSchema = z.object({
  title: z.string().min(3, { message: 'العنوان يجب أن يكون 3 أحرف على الأقل' }),
  description: z.string().optional(),
  task_type: z.enum(['preparation', 'execution', 'follow_up']),
  assigned_to: z.string().optional(),
  due_date: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
  onAddTask: (task: Omit<MeetingTask, 'id' | 'created_at' | 'updated_at'>) => void;
}

interface User {
  id: string;
  display_name?: string;
  email?: string;
}

export const NewTaskDialog = ({ 
  open, 
  onOpenChange,
  meetingId,
  onAddTask 
}: NewTaskDialogProps) => {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      task_type: 'preparation',
      assigned_to: '',
      due_date: '',
    }
  });

  // Fetch users for assignment dropdown
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email');

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return data as User[];
    },
  });

  const onSubmit = (data: TaskFormValues) => {
    // Add the task through the parent component's handler
    onAddTask({
      meeting_id: meetingId,
      title: data.title,
      description: data.description,
      task_type: data.task_type,
      status: 'pending',
      assigned_to: data.assigned_to || undefined,
      due_date: data.due_date || undefined,
    });

    // Reset the form and close the dialog
    form.reset();
    onOpenChange(false);
  };

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
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان المهمة</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل عنوان المهمة" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف المهمة (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="أدخل وصف المهمة" 
                      className="h-20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="task_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع المهمة</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع المهمة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="preparation">تحضير (قبل الاجتماع)</SelectItem>
                      <SelectItem value="execution">تنفيذ (أثناء الاجتماع)</SelectItem>
                      <SelectItem value="follow_up">متابعة (بعد الاجتماع)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assigned_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مسؤول المهمة (اختياري)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مسؤول المهمة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">لم يتم التعيين</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.display_name || user.email || 'مستخدم غير معروف'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ الاستحقاق (اختياري)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
