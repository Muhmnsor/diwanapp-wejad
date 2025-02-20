
import { useQuery } from "@tanstack/react-query";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { EventReportFormValues } from "../types";
import { supabase } from "@/integrations/supabase/client";

interface ReportMetricsFieldsProps {
  form: UseFormReturn<EventReportFormValues>;
  eventId: string;
}

export const ReportMetricsFields = ({ form, eventId }: ReportMetricsFieldsProps) => {
  const { data: feedbackAverages } = useQuery({
    queryKey: ['event-feedback-averages', eventId],
    queryFn: async () => {
      console.log('Fetching feedback averages for event:', eventId);
      const { data, error } = await supabase
        .from('event_feedback')
        .select('overall_rating, content_rating, organization_rating, presenter_rating')
        .eq('event_id', eventId);

      if (error) {
        console.error('Error fetching ratings:', error);
        throw error;
      }

      const calculateAverage = (ratings: (number | null)[]) => {
        const validRatings = ratings.filter((r): r is number => r !== null);
        if (validRatings.length === 0) return 0;
        return Math.round(validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length);
      };

      const averages = {
        overall: calculateAverage(data.map(f => f.overall_rating)),
        content: calculateAverage(data.map(f => f.content_rating)),
        organization: calculateAverage(data.map(f => f.organization_rating)),
        presenter: calculateAverage(data.map(f => f.presenter_rating))
      };

      console.log('Feedback averages calculated:', averages);
      
      // تحديث قيمة مستوى الرضا في النموذج تلقائياً باستخدام التقييم العام
      form.setValue('satisfaction_level', averages.overall);
      
      return averages;
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="attendees_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عدد الحضور</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="absent_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عدد الغائبين</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="satisfaction_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>مستوى الرضا العام (تلقائي)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={1} 
                  max={5} 
                  {...field}
                  readOnly
                  className="bg-muted"
                  value={feedbackAverages?.overall || 0}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-muted/30 p-4 rounded-lg space-y-4">
        <h3 className="font-medium">تفاصيل التقييمات</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <FormLabel>تقييم المحتوى</FormLabel>
            <Input 
              type="number" 
              readOnly 
              className="bg-muted"
              value={feedbackAverages?.content || 0}
            />
          </div>
          <div>
            <FormLabel>تقييم التنظيم</FormLabel>
            <Input 
              type="number" 
              readOnly 
              className="bg-muted"
              value={feedbackAverages?.organization || 0}
            />
          </div>
          <div>
            <FormLabel>تقييم المقدم</FormLabel>
            <Input 
              type="number" 
              readOnly 
              className="bg-muted"
              value={feedbackAverages?.presenter || 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
