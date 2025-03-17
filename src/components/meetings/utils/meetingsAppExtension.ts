
import { Database, CalendarClock } from "lucide-react";
import { AppItem } from "@/components/admin/dashboard/DashboardApps";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Function to get meetings count for notifications
export const useMeetingsNotificationCount = () => {
  const { data: count = 0 } = useQuery({
    queryKey: ['meetings-count'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('meetings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'scheduled');
          
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error("Error fetching meetings count:", error);
        return 0;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  return count;
};

// Function to create meetings app card
export const getMeetingsAppCard = (): AppItem => {
  return {
    title: "الاجتماعات",
    icon: CalendarClock,
    path: "/meetings",
    description: "إدارة وتنظيم الاجتماعات وجداول الأعمال",
    notifications: 0 // We'll update this dynamically
  };
};
