import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface RegistrationPeriodFieldsProps {
  form: UseFormReturn<any>;
}

export const RegistrationPeriodFields = ({ form }: RegistrationPeriodFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="registration_start_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>تاريخ بدء التسجيل</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="registration_end_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>تاريخ انتهاء التسجيل</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};