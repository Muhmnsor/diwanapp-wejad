import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ReportFormFieldsProps {
  form: UseFormReturn<any>;
}

export const ReportFormFields = ({ form }: ReportFormFieldsProps) => {
  console.log("ReportFormFields - form values:", form.getValues());

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-4">معلومات التقرير الأساسية</h3>
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
                  <Textarea 
                    placeholder="نص التقرير" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">تفاصيل النشاط</h3>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="detailed_description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea 
                    placeholder="التفاصيل" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">الأهداف والتأثير</h3>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="activity_objectives"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea 
                    placeholder="الأهداف" 
                    className="min-h-[100px]"
                    {...field} 
                  />
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
                  <Textarea 
                    placeholder="الأثر على المشاركين" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">الصور</h3>
        <div className="space-y-2">
          {(form.watch('photos') || [])
            .filter(photo => photo !== null)
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
      </Card>
    </div>
  );
};