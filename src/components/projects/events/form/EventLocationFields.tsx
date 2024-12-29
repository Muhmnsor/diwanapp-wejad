import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ProjectActivityFormData } from "@/components/projects/activities/types";

interface EventLocationFieldsProps {
  form: UseFormReturn<ProjectActivityFormData>;
}

export const EventLocationFields = ({ form }: EventLocationFieldsProps) => {
  return (
    <div className="space-y-4 text-right" dir="rtl">
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>المكان</FormLabel>
            <FormControl>
              <Input {...field} className="text-right" />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="location_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>رابط الموقع (قوقل ماب)</FormLabel>
            <FormControl>
              <Input {...field} dir="ltr" placeholder="https://maps.google.com/..." className="text-left" />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="special_requirements"
        render={({ field }) => (
          <FormItem>
            <FormLabel>احتياجات خاصة</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="أي متطلبات أو احتياجات خاصة للنشاط..."
                className="min-h-[100px] resize-y text-right"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};