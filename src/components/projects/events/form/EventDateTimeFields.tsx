import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProjectActivityFormData } from "@/components/projects/activities/types";

interface EventDateTimeFieldsProps {
  form: UseFormReturn<ProjectActivityFormData>;
}

export const EventDateTimeFields = ({ form }: EventDateTimeFieldsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>تاريخ النشاط</FormLabel>
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
            <FormLabel>وقت النشاط</FormLabel>
            <FormControl>
              <Input type="time" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="event_hours"
        render={({ field }) => (
          <FormItem>
            <FormLabel>عدد الساعات</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
