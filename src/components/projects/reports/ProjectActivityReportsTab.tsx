import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectActivityReportForm } from "./ProjectActivityReportForm";
import { ProjectActivityReportsList } from "./ProjectActivityReportsList";

interface ProjectActivityReportsTabProps {
  projectId: string;
  activityId: string;
}

export const ProjectActivityReportsTab = ({
  projectId,
  activityId
}: ProjectActivityReportsTabProps) => {
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

      <ProjectActivityReportsList
        projectId={projectId}
        activityId={activityId}
      />

      <Dialog open={isAddReportOpen} onOpenChange={setIsAddReportOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>إضافة تقرير جديد</DialogTitle>
          </DialogHeader>
          <ProjectActivityReportForm
            projectId={projectId}
            activityId={activityId}
            onSuccess={() => setIsAddReportOpen(false)}
            onCancel={() => setIsAddReportOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};