import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ProjectActivityFormData } from "@/components/projects/activities/types";

interface EventBasicFieldsProps {
  form: UseFormReturn<ProjectActivityFormData>;
}

export const EventBasicFields = ({ form }: EventBasicFieldsProps) => {
  return (
    <div className="space-y-4 text-right" dir="rtl">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>عنوان النشاط</FormLabel>
            <FormControl>
              <Input {...field} className="text-right" />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>نموذج النشاط</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="وصف تفصيلي للنشاط..."
                className="min-h-[100px] resize-y text-right"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};