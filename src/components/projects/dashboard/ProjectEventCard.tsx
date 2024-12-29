import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";
import { EditProjectActivityDialog } from "../activities/EditProjectActivityDialog";
import { useState } from "react";
import { ProjectActivity } from "@/types/activity";

interface ProjectEventCardProps {
  projectEvent: any;
  onEdit: () => void;
  onDelete: () => void;
}

export const ProjectEventCard = ({ 
  projectEvent,
  onEdit,
  onDelete
}: ProjectEventCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <>
      <Card key={projectEvent.id} className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{projectEvent.event?.title}</h4>
              <p className="text-sm text-muted-foreground">
                {projectEvent.event?.date} - {projectEvent.event?.time}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditDialogOpen(true)}
                className="h-8 w-8"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onDelete}
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {projectEvent.event?.location}
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

      <EditProjectActivityDialog
        activity={projectEvent.event as ProjectActivity}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={onEdit}
        projectId={projectEvent.project_id}
      />
    </>
  );
};