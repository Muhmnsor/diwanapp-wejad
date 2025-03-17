
import React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { TaskFormValues } from '../hooks/useTaskForm';

interface TaskFormFieldsProps {
  form: UseFormReturn<TaskFormValues>;
  users: Array<{ id: string; display_name?: string; email?: string }>;
  isLoadingUsers: boolean;
}

export const TaskFormFields = ({ form, users, isLoadingUsers }: TaskFormFieldsProps) => {
  return (
    <>
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
    </>
  );
};
