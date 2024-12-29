import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProjectActivityFormData } from "@/types/activity";

interface ActivityDateTimeFieldsProps {
  form: UseFormReturn<ProjectActivityFormData>;
}

export const ActivityDateTimeFields = ({ form }: ActivityDateTimeFieldsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>التاريخ</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="time"
        render={({ field }) => (
          <FormItem>
            <FormLabel>الوقت</FormLabel>
            <FormControl>
              <Input type="time" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};