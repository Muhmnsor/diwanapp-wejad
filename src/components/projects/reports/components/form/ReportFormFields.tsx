import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  console.log("ReportFormFields - form values:", form.getValues());

  return (
    <div className="space-y-4">
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

      <div className="space-y-2">
        {(form.watch('photos') || [])
          .filter(photo => photo !== null) // Filter out null values
          .map((photo, index) => (
          <div key={index} className="flex gap-2">
            <Input 
              value={photo.url}
              onChange={(e) => {
                const newPhotos = [...(form.getValues('photos') || [])];
                newPhotos[index] = { ...photo, url: e.target.value };
                form.setValue('photos', newPhotos);
              }}
              placeholder="رابط الصورة"
            />
            <Input 
              value={photo.description}
              onChange={(e) => {
                const newPhotos = [...(form.getValues('photos') || [])];
                newPhotos[index] = { ...photo, description: e.target.value };
                form.setValue('photos', newPhotos);
              }}
              placeholder="وصف الصورة"
            />
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                const newPhotos = form.getValues('photos')?.filter((_, i) => i !== index) || [];
                form.setValue('photos', newPhotos);
              }}
            >
              حذف
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={() => {
            const currentPhotos = form.getValues('photos') || [];
            form.setValue('photos', [...currentPhotos, { url: '', description: '' }]);
          }}
        >
          إضافة صورة
        </Button>
      </div>
    </div>
  );
};