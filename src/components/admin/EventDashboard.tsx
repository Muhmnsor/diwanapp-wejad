import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardTabs } from "./dashboard/DashboardTabs";
import { ProjectDashboardTabs } from "../projects/dashboard/ProjectDashboardTabs";

interface EventDashboardProps {
  eventId: string;
}

export const EventDashboard = ({ eventId }: EventDashboardProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProject, setIsProject] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching details for dashboard:', eventId);
        
        // First try to find it as a project
        const { data: projectResult, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', eventId)
          .maybeSingle();

        if (projectResult) {
          console.log('Found project:', projectResult);
          setData(projectResult);
          setIsProject(true);
          setLoading(false);
          return;
        }

        // If not found as project, try to find it as an event
        const { data: eventResult, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .maybeSingle();

        if (eventError) {
          console.error('Error fetching event:', eventError);
          setError(eventError.message);
          return;
        }

        if (!eventResult) {
          console.log('No event found with ID:', eventId);
          setError('الفعالية غير موجودة');
          return;
        }

        setData(eventResult);
        setIsProject(false);
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

  return isProject ? (
    <ProjectDashboardTabs project={data} />
  ) : (
    <DashboardTabs event={data} />
  );
};