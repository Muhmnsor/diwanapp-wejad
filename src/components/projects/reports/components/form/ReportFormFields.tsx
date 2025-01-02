import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  program_name: z.string().min(1, "الرجاء إدخال اسم البرنامج"),
  report_name: z.string().min(1, "الرجاء إدخال اسم التقرير"),
  report_text: z.string().min(1, "الرجاء إدخال نص التقرير"),
  detailed_description: z.string().optional(),
  activity_duration: z.string().optional(),
  attendees_count: z.string().optional(),
  activity_objectives: z.string().optional(),
  impact_on_participants: z.string().optional(),
  photos: z.array(z.object({
    url: z.string(),
    description: z.string()
  })).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ReportFormFieldsProps {
  form: UseFormReturn<FormData>;
}

export const ReportFormFields = ({ form }: ReportFormFieldsProps) => {
  console.log("ReportFormFields - form:", form);
  
  return (
    <>
      <FormField
        control={form.control}
        name="program_name"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input placeholder="اسم البرنامج" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="report_name"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input placeholder="اسم التقرير" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="report_text"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea placeholder="نص التقرير" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="detailed_description"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea placeholder="التفاصيل" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="activity_duration"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input placeholder="مدة النشاط" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="attendees_count"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input placeholder="عدد المشاركين" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="activity_objectives"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input placeholder="الأهداف" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="impact_on_participants"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input placeholder="الأثر على المشاركين" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="photos"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="space-y-2">
                {field.value?.map((photo: { url: string; description: string }, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      value={photo.url}
                      onChange={(e) => {
                        const newPhotos = [...field.value];
                        newPhotos[index] = { ...photo, url: e.target.value };
                        field.onChange(newPhotos);
                      }}
                      placeholder="رابط الصورة"
                    />
                    <Input 
                      value={photo.description}
                      onChange={(e) => {
                        const newPhotos = [...field.value];
                        newPhotos[index] = { ...photo, description: e.target.value };
                        field.onChange(newPhotos);
                      }}
                      placeholder="وصف الصورة"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => {
                    const newPhotos = [...(field.value || []), { url: '', description: '' }];
                    field.onChange(newPhotos);
                  }}
                >
                  إضافة صورة
                </Button>
              </div>
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
};