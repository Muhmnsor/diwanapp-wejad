import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardOverviewTabProps {
  eventId: string;
  isEvent: boolean;
}

export const DashboardOverviewTab = ({
  eventId,
  isEvent
}: DashboardOverviewTabProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const { data: registrations } = await supabase
          .from('registrations')
          .select('*')
          .eq('event_id', eventId);

        const { data: eventData } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (eventData) {
          setData({
            registrationCount: registrations?.length || 0,
            remainingSeats: eventData.max_attendees - (registrations?.length || 0),
            occupancyRate: ((registrations?.length || 0) / eventData.max_attendees) * 100,
            project: {
              id: eventData.id,
              start_date: eventData.date,
              end_date: eventData.end_date || eventData.date,
              event_path: eventData.event_path,
              event_category: eventData.event_category
            }
          });
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  if (loading || !data) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <DashboardOverview
      registrationCount={data.registrationCount}
      remainingSeats={data.remainingSeats}
      occupancyRate={data.occupancyRate}
      project={data.project}
      activities={data.activities}
    />
  );
};