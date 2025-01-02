import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ReportPhotosSection } from "./ReportPhotosSection";
import { ActivityReportFormData } from "@/types/activityReport";

interface ActivityReportFormFieldsProps {
  form: UseFormReturn<ActivityReportFormData>;
}

export const ActivityReportFormFields = ({ form }: ActivityReportFormFieldsProps) => {
  console.log('ActivityReportFormFields - Initial data:', form.getValues());

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-4">معلومات التقرير الأساسية</h3>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="program_name"
            render={({ field }) => (
              <FormItem>
                <Label>اسم البرنامج</Label>
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
                <Label>اسم التقرير</Label>
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
                <Label>نص التقرير</Label>
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
                <Label>الوصف التفصيلي</Label>
                <FormControl>
                  <Textarea 
                    placeholder="الوصف التفصيلي للنشاط" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="activity_duration"
            render={({ field }) => (
              <FormItem>
                <Label>مدة النشاط</Label>
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
                <Label>عدد المشاركين</Label>
                <FormControl>
                  <Input placeholder="عدد المشاركين" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
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
                <Label>أهداف النشاط</Label>
                <FormControl>
                  <Textarea 
                    placeholder="أهداف النشاط" 
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
                <Label>الأثر على المشاركين</Label>
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

      <FormField
        control={form.control}
        name="photos"
        render={({ field }) => (
          <FormItem>
            <ReportPhotosSection
              photos={field.value || []}
              onChange={field.onChange}
              form={form}
              photoPlaceholders={[
                "صورة تظهر تفاعل المستفيدين والجمهور مع المحتوى",
                "صورة توضح مكان إقامة النشاط",
                "صورة للمتحدثين أو المدربين",
                "صورة للمواد التدريبية أو التعليمية",
                "صورة للأنشطة التفاعلية",
                "صورة ختامية للنشاط"
              ]}
            />
          </FormItem>
        )}
      />
    </div>
  );
};