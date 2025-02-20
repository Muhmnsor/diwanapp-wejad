
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
  const { data: averageRating } = useQuery({
    queryKey: ['event-feedback-average', eventId],
    queryFn: async () => {
      console.log('Fetching average rating for event:', eventId);
      const { data, error } = await supabase
        .from('event_feedback')
        .select('overall_rating')
        .eq('event_id', eventId);

      if (error) {
        console.error('Error fetching ratings:', error);
        throw error;
      }

      const ratings = data
        .map(feedback => feedback.overall_rating)
        .filter((rating): rating is number => rating !== null);

      if (ratings.length === 0) return 0;

      const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      console.log('Average rating calculated:', average);
      
      // تحديث قيمة مستوى الرضا في النموذج تلقائياً
      form.setValue('satisfaction_level', Math.round(average));
      
      return Math.round(average);
    }
  });

  return (
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
            <FormLabel>مستوى الرضا (تلقائي من التقييمات)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min={1} 
                max={5} 
                {...field}
                readOnly
                className="bg-muted"
                value={averageRating || 0}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
