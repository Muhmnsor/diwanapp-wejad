
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { EventReportFormValues } from "../types";

interface ReportBasicFieldsProps {
  form: UseFormReturn<EventReportFormValues>;
}

export const ReportBasicFields = ({ form }: ReportBasicFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="report_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>اسم التقرير (تلقائي)</FormLabel>
            <FormControl>
              <Input {...field} readOnly className="bg-muted" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="speaker_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>اسم المتحدث/المنظم</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="report_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>نص التقرير</FormLabel>
            <FormControl>
              <Textarea {...field} rows={5} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
