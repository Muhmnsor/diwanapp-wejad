import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { Event } from "@/store/eventStore";

interface EventDateTimeFieldsProps {
  form: UseFormReturn<Event>;
}

export const EventDateTimeFields = ({ form }: EventDateTimeFieldsProps) => {
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