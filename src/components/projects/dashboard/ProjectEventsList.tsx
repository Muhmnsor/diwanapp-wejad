import { Card, CardContent } from "@/components/ui/card";
import { ProjectEventCard } from "./ProjectEventCard";

interface ProjectEventsListProps {
  projectEvents: any[];
  onEditEvent: (event: any) => void;
  onDeleteEvent: (event: any) => void;
}

export const ProjectEventsList = ({ 
  projectEvents,
  onEditEvent,
  onDeleteEvent
}: ProjectEventsListProps) => {
  if (projectEvents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        لا توجد فعاليات مضافة لهذا المشروع
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projectEvents.map((projectEvent: any) => (
        <ProjectEventCard
          key={projectEvent.id}
          projectEvent={projectEvent}
          onEdit={() => onEditEvent(projectEvent)}
          onDelete={() => onDeleteEvent(projectEvent)}
        />
      ))}
    </div>
  );
};