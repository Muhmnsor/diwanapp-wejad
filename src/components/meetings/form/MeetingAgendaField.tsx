
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { formatFormError } from "../types/meetingTypes";

interface MeetingAgendaFieldProps {
  form: UseFormReturn<any>;
}

export const MeetingAgendaField = ({ form }: MeetingAgendaFieldProps) => {
  const agendaItems = form.watch("agenda_items") || [];
  
  const addAgendaItem = () => {
    form.setValue("agenda_items", [
      ...agendaItems,
      {
        title: "",
        description: "",
        order_number: agendaItems.length + 1
      }
    ]);
  };
  
  const removeAgendaItem = (index: number) => {
    const updatedItems = agendaItems.filter((_, i) => i !== index);
    // Update order numbers after removal
    const reorderedItems = updatedItems.map((item, idx) => ({
      ...item,
      order_number: idx + 1
    }));
    form.setValue("agenda_items", reorderedItems);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel className="text-base">بنود جدول الأعمال</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addAgendaItem}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة بند</span>
        </Button>
      </div>
      
      {agendaItems.length === 0 ? (
        <Card className="p-4 text-center text-muted-foreground">
          لا توجد بنود في جدول الأعمال. اضغط على "إضافة بند" لإضافة بنود جديدة.
        </Card>
      ) : (
        <div className="space-y-4">
          {agendaItems.map((_, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">البند {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAgendaItem(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name={`agenda_items.${index}.title`}
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>عنوان البند</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage>
                          {formatFormError(fieldState.error)}
                        </FormMessage>
                      )}
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`agenda_items.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>وصف البند (اختياري)</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <input
                  type="hidden"
                  {...form.register(`agenda_items.${index}.order_number`)}
                  value={index + 1}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
