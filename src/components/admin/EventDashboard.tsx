import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardTabs } from "./dashboard/DashboardTabs";
import { ProjectDashboardTabs } from "./dashboard/ProjectDashboardTabs";

interface EventDashboardProps {
  eventId: string;
  isProject?: boolean;
}

export const EventDashboard = ({ eventId, isProject = false }: EventDashboardProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`Fetching ${isProject ? 'project' : 'event'} details for dashboard:`, eventId);
        
        const { data: result, error: fetchError } = await supabase
          .from(isProject ? 'projects' : 'events')
          .select('*')
          .eq('id', eventId)
          .maybeSingle();

        if (fetchError) {
          console.error(`Error fetching ${isProject ? 'project' : 'event'}:`, fetchError);
          setError(fetchError.message);
          return;
        }

        if (!result) {
          console.log(`No ${isProject ? 'project' : 'event'} found with ID:`, eventId);
          setError(`${isProject ? 'المشروع' : 'الفعالية'} غير موجود`);
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
  }, [eventId, isProject]);

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