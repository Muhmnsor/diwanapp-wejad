import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardOverview } from "../DashboardOverview";
import { DashboardRegistrations } from "../DashboardRegistrations";
import { DashboardPreparation } from "./DashboardPreparation";
import { ReportsTab } from "./ReportsTab";
import { FeedbackTab } from "./FeedbackTab";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardTabsProps {
  event: {
    id: string;
    title: string;
    max_attendees: number;
    event_path: string;
    event_category: string;
    start_date: string;
    end_date: string;
    date: string;
  };
}

export const DashboardTabs = ({ event }: DashboardTabsProps) => {
  // Fetch event stats including registrations and ratings
  const { data: eventStats } = useQuery({
    queryKey: ['eventStats', event.id],
    queryFn: async () => {
      console.log('Fetching event stats for:', event.id);
      
      // Get registrations count
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('*', { count: 'exact' })
        .eq('event_id', event.id);

      if (regError) {
        console.error('Error fetching registrations:', regError);
        throw regError;
      }

      // Get average rating
      const { data: feedback, error: feedbackError } = await supabase
        .from('event_feedback')
        .select('overall_rating')
        .eq('event_id', event.id);

      if (feedbackError) {
        console.error('Error fetching feedback:', feedbackError);
        throw feedbackError;
      }

      const registrationCount = registrations?.length || 0;
      const remainingSeats = event.max_attendees - registrationCount;
      const occupancyRate = (registrationCount / event.max_attendees) * 100;

      // Calculate average rating
      const averageRating = feedback?.length 
        ? feedback.reduce((acc, curr) => acc + (curr.overall_rating || 0), 0) / feedback.length 
        : undefined;

      console.log('Event stats calculated:', {
        registrationCount,
        remainingSeats,
        occupancyRate,
        averageRating
      });

      return {
        registrationCount,
        remainingSeats,
        occupancyRate,
        averageRating
      };
    }
  });

  const projectData = {
    id: event.id,
    start_date: event.start_date || '',
    end_date: event.end_date || '',
    event_path: event.event_path,
    event_category: event.event_category,
    date: event.date,
    averageRating: eventStats?.averageRating
  };

  return (
    <Tabs defaultValue="overview" className="w-full space-y-6" dir="rtl">
      <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
        <TabsTrigger
          value="overview"
          className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
        >
          نظرة عامة
        </TabsTrigger>
        <TabsTrigger
          value="registrations"
          className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
        >
          المسجلون
        </TabsTrigger>
        <TabsTrigger
          value="preparation"
          className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
        >
          التحضير
        </TabsTrigger>
        <TabsTrigger
          value="reports"
          className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
        >
          التقارير
        </TabsTrigger>
        <TabsTrigger
          value="feedback"
          className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
        >
          التقييمات
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <DashboardOverview
          registrationCount={eventStats?.registrationCount || 0}
          remainingSeats={eventStats?.remainingSeats || 0}
          occupancyRate={eventStats?.occupancyRate || 0}
          project={projectData}
          isEvent={true}
        />
      </TabsContent>

      <TabsContent value="registrations" className="mt-6">
        <DashboardRegistrations eventId={event.id} />
      </TabsContent>

      <TabsContent value="preparation" className="mt-6">
        <DashboardPreparation eventId={event.id} />
      </TabsContent>

      <TabsContent value="reports" className="mt-6">
        <ReportsTab eventId={event.id} />
      </TabsContent>

      <TabsContent value="feedback" className="mt-6">
        <FeedbackTab eventId={event.id} />
      </TabsContent>
    </Tabs>
  );
};