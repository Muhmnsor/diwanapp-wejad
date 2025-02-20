
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { EventReportFormValues } from "../types";

interface ReportDescriptionFieldsProps {
  form: UseFormReturn<EventReportFormValues>;
}

export const ReportDescriptionFields = ({ form }: ReportDescriptionFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="objectives"
        render={({ field }) => (
          <FormItem>
            <FormLabel>أهداف الفعالية</FormLabel>
            <FormControl>
              <Textarea {...field} rows={3} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="impact_on_participants"
        render={({ field }) => (
          <FormItem>
            <FormLabel>الأثر على المشاركين</FormLabel>
            <FormControl>
              <Textarea {...field} rows={3} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
