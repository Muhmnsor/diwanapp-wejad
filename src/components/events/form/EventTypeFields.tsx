import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface EventTypeFieldsProps {
  form: UseFormReturn<any>;
}

export const EventTypeFields = ({ form }: EventTypeFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="eventType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>نوع الفعالية</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الفعالية" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="in-person">حضوري</SelectItem>
                <SelectItem value="online">عن بعد</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="beneficiaryType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>نوع المستفيدين</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع المستفيدين" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="men">رجال</SelectItem>
                <SelectItem value="women">نساء</SelectItem>
                <SelectItem value="both">رجال ونساء</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};