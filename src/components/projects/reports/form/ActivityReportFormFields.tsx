import { UseFormReturn, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ReportBasicInfoFields } from "./fields/ReportBasicInfoFields";
import { ActivityDetailsFields } from "./fields/ActivityDetailsFields";
import { ObjectivesImpactFields } from "./fields/ObjectivesImpactFields";
import { ReportPhotosSection } from "./fields/ReportPhotosSection";

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

interface ActivityReportFormFieldsProps {
  initialData?: any;
  onSubmit: (values: any) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export const ActivityReportFormFields = ({
  initialData,
  onSubmit,
  isSubmitting = false,
  onCancel
}: ActivityReportFormFieldsProps) => {
  console.log("ActivityReportFormFields - Initial data:", initialData);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      program_name: initialData?.program_name || "",
      report_name: initialData?.report_name || "",
      report_text: initialData?.report_text || "",
      detailed_description: initialData?.detailed_description || "",
      activity_duration: initialData?.activity_duration || "",
      attendees_count: initialData?.attendees_count || "",
      activity_objectives: initialData?.activity_objectives || "",
      impact_on_participants: initialData?.impact_on_participants || "",
      photos: initialData?.photos || [],
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <ReportBasicInfoFields form={form} />
        <ActivityDetailsFields form={form} />
        <ObjectivesImpactFields form={form} />
        <ReportPhotosSection 
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
        
        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "جاري الحفظ..." : "حفظ التقرير"}
          </Button>
        </div>
      </form>
    </Form>
  );
};