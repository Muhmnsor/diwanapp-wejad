import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventDashboard } from "@/components/admin/EventDashboard";
import { ProjectContent } from "../ProjectContent";
import { Project } from "@/types/project";
import { Event } from "@/store/eventStore";
import { EditProjectEventDialog } from "../events/EditProjectEventDialog";
import { useState } from "react";

interface ProjectAdminTabsProps {
  project: Project;
  id: string;
}

export const ProjectAdminTabs = ({ project, id }: ProjectAdminTabsProps) => {
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEditEventDialogOpen(true);
  };

  const handleUpdateEvent = async (updatedEvent: Event) => {
    // Handle event update logic here
    console.log('Updating project event:', updatedEvent);
  };

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="w-full justify-start border-b rounded-none bg-white grid grid-cols-2" dir="rtl">
        <TabsTrigger value="details" className="flex-1">تفاصيل المشروع</TabsTrigger>
        <TabsTrigger value="dashboard" className="flex-1">لوحة التحكم</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="mt-0">
        <ProjectContent project={project} />
      </TabsContent>

      <TabsContent value="dashboard" className="mt-6 px-4 md:px-8 pb-8">
        <EventDashboard 
          eventId={id} 
          isProject={true} 
          onEditEvent={handleEditEvent}
        />
      </TabsContent>

      {selectedEvent && (
        <EditProjectEventDialog
          event={selectedEvent}
          open={isEditEventDialogOpen}
          onOpenChange={setIsEditEventDialogOpen}
          onSave={handleUpdateEvent}
        />
      )}
    </Tabs>
  );
};