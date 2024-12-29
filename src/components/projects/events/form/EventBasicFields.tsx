import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ProjectEventFormData } from "../types";

interface EventBasicFieldsProps {
  form: UseFormReturn<ProjectEventFormData>;
}

export const EventBasicFields = ({ form }: EventBasicFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>عنوان الفعالية</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>وصف الفعالية</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
};