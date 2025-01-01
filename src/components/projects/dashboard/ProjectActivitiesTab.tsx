import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectReportDialog } from "../reports/ProjectReportDialog";
import { ProjectReportsList } from "../reports/ProjectReportsList";
import { Card } from "@/components/ui/card";

interface ProjectActivitiesTabProps {
  projectId: string;
  activityId: string;
}

export const ProjectActivitiesTab = ({
  projectId,
  activityId
}: ProjectActivitiesTabProps) => {
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">تقارير النشاط</h2>
        <Button onClick={() => setIsAddReportOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة تقرير
        </Button>
      </div>

      <Card>
        <ProjectReportsList
          projectId={projectId}
          activityId={activityId}
        />
      </Card>

      <ProjectReportDialog
        open={isAddReportOpen}
        onOpenChange={setIsAddReportOpen}
        projectId={projectId}
        activityId={activityId}
      />
    </div>
  );
};