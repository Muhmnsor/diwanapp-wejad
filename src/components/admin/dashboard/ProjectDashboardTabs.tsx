import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardOverview } from "../DashboardOverview";
import { DashboardRegistrations } from "../DashboardRegistrations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { AddProjectEventDialog } from "@/components/projects/events/AddProjectEventDialog";

interface ProjectDashboardTabsProps {
  project: {
    id: string;
    max_attendees: number;
    start_date: string;
    end_date: string;
    event_path?: string;
    event_category?: string;
  };
}

export const ProjectDashboardTabs = ({ project }: ProjectDashboardTabsProps) => {
  console.log("ProjectDashboardTabs - project:", project);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  // Fetch registrations count
  const { data: registrations = [] } = useQuery({
    queryKey: ['project-registrations', project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('project_id', project.id);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch project events
  const { data: projectEvents = [], refetch: refetchEvents } = useQuery({
    queryKey: ['project-events', project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_events')
        .select(`
          *,
          event:events (
            id,
            title,
            description,
            date,
            time,
            location,
            location_url,
            special_requirements,
            event_type,
            max_attendees
          )
        `)
        .eq('project_id', project.id)
        .order('event_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Calculate dashboard metrics
  const registrationCount = registrations.length;
  const remainingSeats = project.max_attendees - registrationCount;
  const occupancyRate = (registrationCount / project.max_attendees) * 100;

  const handleAddEvent = () => {
    setIsAddEventOpen(true);
  };

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
          value="events"
          className="flex-1 max-w-[200px] data-[state=active]:bg-white"
        >
          الفعاليات والأنشطة
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-6">
        <DashboardOverview
          registrationCount={registrationCount}
          remainingSeats={remainingSeats}
          occupancyRate={occupancyRate}
          eventDate={project.start_date}
          eventTime={project.end_date}
          eventPath={project.event_path}
          eventCategory={project.event_category}
        />
      </TabsContent>

      <TabsContent value="registrations" className="mt-6">
        <DashboardRegistrations eventId={project.id} />
      </TabsContent>

      <TabsContent value="events" className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">فعاليات وأنشطة المشروع</h3>
              <Button onClick={handleAddEvent} className="gap-2">
                <Plus className="w-4 h-4" />
                إضافة فعالية
              </Button>
            </div>
            
            {projectEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد فعاليات مضافة لهذا المشروع
              </div>
            ) : (
              <div className="space-y-4">
                {projectEvents.map((projectEvent: any) => (
                  <Card key={projectEvent.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{projectEvent.event?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {projectEvent.event?.date} - {projectEvent.event?.time}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {projectEvent.event?.location}
                        </div>
                      </div>
                      {projectEvent.event?.description && (
                        <p className="text-sm text-gray-600">
                          {projectEvent.event.description}
                        </p>
                      )}
                      {projectEvent.event?.special_requirements && (
                        <div className="text-sm">
                          <span className="font-medium">احتياجات خاصة: </span>
                          {projectEvent.event.special_requirements}
                        </div>
                      )}
                      {projectEvent.event?.location_url && (
                        <a
                          href={projectEvent.event.location_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          رابط الموقع
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <AddProjectEventDialog
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        projectId={project.id}
        onSuccess={refetchEvents}
      />
    </Tabs>
  );
};