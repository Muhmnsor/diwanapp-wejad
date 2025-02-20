
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FormSectionProps } from "../types";

export const ReportExtraFields = ({ form }: FormSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="partners"
        render={({ field }) => (
          <FormItem>
            <FormLabel>الشركاء (إن وجد)</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="أدخل أسماء الشركاء المشاركين في الفعالية"
                className="resize-none"
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="links"
        render={({ field }) => (
          <FormItem>
            <FormLabel>روابط</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="أدخل الروابط (رابط واحد في كل سطر)"
                className="resize-none"
                rows={3}
                dir="ltr"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
