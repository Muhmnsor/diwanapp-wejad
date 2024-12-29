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
    <>
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
        name="special_requirements"
        render={({ field }) => (
          <FormItem>
            <FormLabel>احتياجات خاصة (اختياري)</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="أي متطلبات أو احتياجات خاصة للنشاط..." />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
};