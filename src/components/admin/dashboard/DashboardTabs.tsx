import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardOverview } from "../DashboardOverview";
import { DashboardRegistrations } from "../DashboardRegistrations";
import { ReportsTab } from "./ReportsTab";

interface DashboardTabsProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  eventDate: string;
  eventTime: string;
  registrations: any[];
  eventTitle: string;
  eventId: string;
}

export const DashboardTabs = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  eventDate,
  eventTime,
  registrations,
  eventTitle,
  eventId,
}: DashboardTabsProps) => {
  return (
    <Tabs defaultValue="overview" dir="rtl">
      <TabsList>
        <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        <TabsTrigger value="registrations">المسجلين</TabsTrigger>
        <TabsTrigger value="report">التقارير</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <DashboardOverview
          registrationCount={registrationCount}
          remainingSeats={remainingSeats}
          occupancyRate={occupancyRate}
          eventDate={eventDate}
          eventTime={eventTime}
        />
      </TabsContent>

      <TabsContent value="registrations">
        <DashboardRegistrations
          registrations={registrations}
          eventTitle={eventTitle}
        />
      </TabsContent>

      <TabsContent value="report">
        <ReportsTab eventId={eventId} />
      </TabsContent>
    </Tabs>
  );
};