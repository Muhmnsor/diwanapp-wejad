
import { useQuery } from "@tanstack/react-query";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { EventReportFormValues } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

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
        return validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length;
      };

      const averages = {
        overall: calculateAverage(data.map(f => f.overall_rating)),
        content: calculateAverage(data.map(f => f.content_rating)),
        organization: calculateAverage(data.map(f => f.organization_rating)),
        presenter: calculateAverage(data.map(f => f.presenter_rating))
      };

      console.log('Feedback averages calculated:', averages);
      
      form.setValue('satisfaction_level', Math.round(averages.overall));
      
      return averages;
    }
  });

  const { data: attendanceStats } = useQuery({
    queryKey: ['event-attendance', eventId],
    queryFn: async () => {
      console.log('Fetching attendance stats for event:', eventId);
      const { data: records, error } = await supabase
        .from('attendance_records')
        .select('status')
        .eq('event_id', eventId);

      if (error) {
        console.error('Error fetching attendance:', error);
        throw error;
      }

      const present = records?.filter(r => r.status === 'present').length || 0;
      const absent = records?.filter(r => r.status === 'absent').length || 0;

      console.log('Attendance stats calculated:', { present, absent });
      
      form.setValue('attendees_count', present);
      form.setValue('absent_count', absent);

      return { present, absent };
    }
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 bg-green-50';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="attendees_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عدد الحضور (تلقائي)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  readOnly
                  className="bg-muted"
                  value={attendanceStats?.present || 0}
                />
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
              <FormLabel>عدد الغائبين (تلقائي)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  readOnly
                  className="bg-muted"
                  value={attendanceStats?.absent || 0}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Card className={`p-4 ${getRatingColor(feedbackAverages?.overall || 0)}`}>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-sm font-medium mb-2">التقييم العام</span>
            <span className="text-2xl font-bold">
              {feedbackAverages?.overall.toFixed(1) || '0.0'}
            </span>
            <span className="text-xs mt-1">من 5</span>
          </div>
        </Card>

        <Card className={`p-4 ${getRatingColor(feedbackAverages?.content || 0)}`}>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-sm font-medium mb-2">تقييم المحتوى</span>
            <span className="text-2xl font-bold">
              {feedbackAverages?.content.toFixed(1) || '0.0'}
            </span>
            <span className="text-xs mt-1">من 5</span>
          </div>
        </Card>

        <Card className={`p-4 ${getRatingColor(feedbackAverages?.organization || 0)}`}>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-sm font-medium mb-2">تقييم التنظيم</span>
            <span className="text-2xl font-bold">
              {feedbackAverages?.organization.toFixed(1) || '0.0'}
            </span>
            <span className="text-xs mt-1">من 5</span>
          </div>
        </Card>

        <Card className={`p-4 ${getRatingColor(feedbackAverages?.presenter || 0)}`}>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-sm font-medium mb-2">تقييم المقدم</span>
            <span className="text-2xl font-bold">
              {feedbackAverages?.presenter.toFixed(1) || '0.0'}
            </span>
            <span className="text-xs mt-1">من 5</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
