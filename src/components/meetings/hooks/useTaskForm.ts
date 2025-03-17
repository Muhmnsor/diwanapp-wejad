
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { MeetingTask } from '../types';

// Define the form schema
export const taskFormSchema = z.object({
  title: z.string().min(3, { message: 'العنوان يجب أن يكون 3 أحرف على الأقل' }),
  description: z.string().optional(),
  task_type: z.enum(['preparation', 'execution', 'follow_up']),
  assigned_to: z.string().optional(),
  due_date: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

interface UseTaskFormProps {
  meetingId: string;
  onAddTask: (task: Omit<MeetingTask, 'id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
}

export const useTaskForm = ({ meetingId, onAddTask, onClose }: UseTaskFormProps) => {
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
    onClose();
  };

  return {
    form,
    onSubmit
  };
};
