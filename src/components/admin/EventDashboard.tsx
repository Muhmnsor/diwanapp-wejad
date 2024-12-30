import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardTabs } from "./dashboard/DashboardTabs";

interface EventDashboardProps {
  eventId: string;
}

export const EventDashboard = ({ eventId }: EventDashboardProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching event details for dashboard:', eventId);
        
        const { data: result, error: fetchError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching event:', fetchError);
          setError(fetchError.message);
          return;
        }

        if (!result) {
          console.log('No event found with ID:', eventId);
          setError('الفعالية غير موجودة');
          return;
        }

        setData(result);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  if (loading) {
    return <div className="p-4">جاري التحميل...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return <DashboardTabs event={data} />;
};