import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardOverview } from "../DashboardOverview";
import { DashboardRegistrations } from "../DashboardRegistrations";
import { ReportsTab } from "./ReportsTab";
import { FeedbackTab } from "./FeedbackTab";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardTabsProps {
  event: {
    id: string;
    max_attendees: number;
    date: string;
    time: string;
    event_path?: string;
    event_category?: string;
  };
  isProject?: boolean;
}

export const DashboardTabs = ({ event, isProject = false }: DashboardTabsProps) => {
  // Fetch registrations count
  const { data: registrations = [] } = useQuery({
    queryKey: ['registrations', event.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq(isProject ? 'project_id' : 'event_id', event.id);

      if (error) throw error;
      return data || [];
    },
  });

  // Calculate dashboard metrics
  const registrationCount = registrations.length;
  const remainingSeats = event.max_attendees - registrationCount;
  const occupancyRate = (registrationCount / event.max_attendees) * 100;

  return (
    <Tabs defaultValue="overview" dir="rtl" className="w-full space-y-6">
      <TabsList className="w-full justify-start bg-secondary/20 p-1 rounded-xl">
        <TabsTrigger 
          value="overview" 
          className="flex-1 max-w-[200px] data-[state=active]:bg-white"
        >
          نظرة عامة
        </TabsTrigger>
        <TabsTrigger 
          value="registrations"
          className="flex-1 max-w-[200px] data-[state=active]:bg-white"
        >
          المسجلين
        </TabsTrigger>
        <TabsTrigger 
          value="report"
          className="flex-1 max-w-[200px] data-[state=active]:bg-white"
        >
          التقارير
        </TabsTrigger>
        <TabsTrigger 
          value="feedback"
          className="flex-1 max-w-[200px] data-[state=active]:bg-white"
        >
          التقييمات
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-6">
        <DashboardOverview
          registrationCount={registrationCount}
          remainingSeats={remainingSeats}
          occupancyRate={occupancyRate}
          eventDate={event.date}
          eventTime={event.time}
          eventPath={event.event_path}
          eventCategory={event.event_category}
        />
      </TabsContent>

      <TabsContent value="registrations" className="mt-6">
        <DashboardRegistrations eventId={event.id} />
      </TabsContent>

      <TabsContent value="report" className="mt-6">
        <ReportsTab eventId={event.id} />
      </TabsContent>

      <TabsContent value="feedback" className="mt-6">
        <FeedbackTab eventId={event.id} />
      </TabsContent>
    </Tabs>
  );
};