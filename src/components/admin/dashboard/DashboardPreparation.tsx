import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventAttendanceTab } from "./preparation/EventAttendanceTab";
import { ProjectActivityAttendanceTab } from "./preparation/ProjectActivityAttendanceTab";

interface DashboardPreparationProps {
  eventId: string;
  isProjectActivity?: boolean;
  projectId?: string;
}

export const DashboardPreparation = ({ 
  eventId, 
  isProjectActivity = false,
  projectId 
}: DashboardPreparationProps) => {
  console.log('DashboardPreparation - Rendering with:', { eventId, isProjectActivity, projectId });

  return (
    <Tabs dir="rtl" defaultValue="attendance" className="w-full space-y-6">
      <TabsList className="grid w-full grid-cols-1 h-auto">
        <TabsTrigger value="attendance" className="data-[state=active]:bg-white">
          الحضور
        </TabsTrigger>
      </TabsList>

      <TabsContent value="attendance" className="space-y-6">
        {isProjectActivity && projectId ? (
          <ProjectActivityAttendanceTab 
            projectId={projectId} 
            activityId={eventId} 
          />
        ) : (
          <EventAttendanceTab eventId={eventId} />
        )}
      </TabsContent>
    </Tabs>
  );
};