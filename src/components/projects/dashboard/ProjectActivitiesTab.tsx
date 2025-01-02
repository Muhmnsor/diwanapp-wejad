import { Card, CardContent } from "@/components/ui/card";
import { ProjectActivitiesList } from "../activities/ProjectActivitiesList";

interface ProjectActivitiesTabProps {
  projectId: string;
}

export const ProjectActivitiesTab = ({ projectId }: ProjectActivitiesTabProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <ProjectActivitiesList projectId={projectId} />
      </CardContent>
    </Card>
  );
};