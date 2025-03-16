
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { WorkflowStep, User } from '../types';

interface StepFormProps {
  step: WorkflowStep;
  users: User[];
  onSave: (step: WorkflowStep) => void;
  onCancel: () => void;
}

// Define the form schema
const stepFormSchema = z.object({
  step_name: z.string().min(1, { message: 'يرجى إدخال اسم الخطوة' }),
  step_type: z.enum(['decision', 'opinion', 'notification']),
  approver_id: z.string().optional().nullable(),
  is_required: z.boolean().default(true),
  instructions: z.string().optional().nullable()
});

export const StepForm: React.FC<StepFormProps> = ({ step, users, onSave, onCancel }) => {
  const form = useForm<z.infer<typeof stepFormSchema>>({
    resolver: zodResolver(stepFormSchema),
    defaultValues: {
      step_name: step.step_name || '',
      step_type: (step.step_type as 'decision' | 'opinion' | 'notification') || 'decision',
      approver_id: step.approver_id || null,
      is_required: step.is_required !== false, // Default to true if undefined
      instructions: step.instructions || ''
    }
  });

  const stepType = form.watch('step_type');

  const handleSubmit = (values: z.infer<typeof stepFormSchema>) => {
    onSave({
      ...step,
      ...values
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="step_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم الخطوة</FormLabel>
              <FormControl>
                <Input placeholder="أدخل اسم الخطوة" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="step_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نوع الخطوة</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الخطوة" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="decision">اعتماد وقرار</SelectItem>
                  <SelectItem value="opinion">إبداء رأي</SelectItem>
                  <SelectItem value="notification">إشعار</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                نوع "اعتماد وقرار" سيتطلب موافقة أو رفض. نوع "إبداء رأي" لا يوقف سير العمل.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {(stepType === 'decision' || stepType === 'opinion') && (
          <FormField
            control={form.control}
            name="approver_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المسؤول عن الخطوة</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المسؤول" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.display_name || user.email || user.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="is_required"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">خطوة إلزامية</FormLabel>
                <FormDescription>
                  ضبط الخطوة كإلزامية يعني أنها يجب أن تتم قبل الانتقال إلى الخطوة التالية
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تعليمات الخطوة</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="أدخل أي تعليمات أو ملاحظات خاصة بهذه الخطوة"
                  className="resize-y"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                سيتم عرض هذه التعليمات للمسؤول عن الخطوة
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 rtl:space-x-reverse">
          <Button type="button" variant="outline" onClick={onCancel} className="ml-2">
            إلغاء
          </Button>
          <Button type="submit">حفظ الخطوة</Button>
        </div>
      </form>
    </Form>
  );
};
