
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TrashIcon, Plus, GripVertical } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { useFieldArray, UseFormReturn } from 'react-hook-form';

interface MeetingAgendaItemsFieldProps {
  form: UseFormReturn<any>;
}

export const MeetingAgendaItemsField = ({ form }: MeetingAgendaItemsFieldProps) => {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'agenda_items',
  });

  const addAgendaItem = () => {
    append({ 
      title: '',
      description: '',
      order_number: fields.length + 1
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <FormLabel className="text-base">بنود جدول الأعمال</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addAgendaItem}
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة بند
        </Button>
      </div>

      <FormDescription>
        قم بإضافة بنود جدول الأعمال التي سيتم مناقشتها في الاجتماع
      </FormDescription>

      {fields.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-md">
          <p className="text-muted-foreground">لا يوجد بنود في جدول الأعمال. قم بإضافة بنود للمناقشة.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 border p-3 rounded-md">
              <div className="flex flex-col items-center justify-center px-2">
                <span className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs">
                  {index + 1}
                </span>
              </div>

              <div className="flex-1 space-y-2">
                <FormField
                  control={form.control}
                  name={`agenda_items.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={`title-${index}`}>عنوان البند</FormLabel>
                      <FormControl>
                        <Input 
                          id={`title-${index}`}
                          placeholder="أدخل عنوان البند" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`agenda_items.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={`description-${index}`}>التفاصيل (اختياري)</FormLabel>
                      <FormControl>
                        <Textarea 
                          id={`description-${index}`}
                          placeholder="أدخل تفاصيل هذا البند" 
                          className="h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <input 
                  type="hidden" 
                  {...form.register(`agenda_items.${index}.order_number`)} 
                  value={index + 1} 
                />
              </div>

              <div className="flex flex-col justify-start pt-8">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="text-destructive"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
