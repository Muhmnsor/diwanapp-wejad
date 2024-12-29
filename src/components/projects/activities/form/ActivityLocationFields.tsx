import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ProjectActivityFormData } from "@/types/activity";

interface ActivityLocationFieldsProps {
  form: UseFormReturn<ProjectActivityFormData>;
}

export const ActivityLocationFields = ({ form }: ActivityLocationFieldsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>المكان</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>رابط المكان (اختياري)</FormLabel>
            <FormControl>
              <Input {...field} dir="ltr" placeholder="https://maps.google.com/..." />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="event_hours"
        render={({ field }) => (
          <FormItem>
            <FormLabel>مدة النشاط (بالساعات)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field} 
                min="0"
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="special_requirements"
        render={({ field }) => (
          <FormItem>
            <FormLabel>احتياجات خاصة (اختياري)</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="أي متطلبات أو احتياجات خاصة للنشاط..."
                className="min-h-[100px] resize-y"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};