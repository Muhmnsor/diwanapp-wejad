import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProjectActivityFormData } from "@/components/projects/activities/types";

interface EventLocationFieldsProps {
  form: UseFormReturn<ProjectActivityFormData>;
}

export const EventLocationFields = ({ form }: EventLocationFieldsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>الموقع</FormLabel>
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
            <FormLabel>رابط الموقع (قوقل ماب)</FormLabel>
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
            <FormLabel>احتياجات خاصة</FormLabel>
            <FormControl>
              <Input {...field} placeholder="أي متطلبات أو احتياجات خاصة للنشاط..." />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};