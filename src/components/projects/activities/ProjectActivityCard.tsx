import React from "react";
import { ProjectActivity } from "@/types/activity";
import { EditActivityDialog } from "./dialogs/EditActivityDialog";

interface ProjectActivityCardProps {
  activity: ProjectActivity;
  isEditEventOpen: boolean;
  setIsEditEventOpen: (open: boolean) => void;
  refetchActivities: () => void;
  projectId: string;
}

export const ProjectActivityCard: React.FC<ProjectActivityCardProps> = ({
  activity,
  isEditEventOpen,
  setIsEditEventOpen,
  refetchActivities,
  projectId,
}) => {
  return (
    <div className="activity-card">
      <h3>{activity.title}</h3>
      <p>{activity.description}</p>
      <button onClick={() => setIsEditEventOpen(true)}>Edit</button>

      <EditActivityDialog
        activity={activity}
        isOpen={isEditEventOpen}
        onOpenChange={setIsEditEventOpen}
        onSave={refetchActivities}
        projectId={projectId}
      />
    </div>
  );
};
