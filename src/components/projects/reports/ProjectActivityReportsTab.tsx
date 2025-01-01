import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ReportForm } from "./components/ReportForm";
import { ReportsList } from "./components/ReportsList";

interface ProjectActivityReportsTabProps {
  projectId: string;
  activityId: string;
}

export const ProjectActivityReportsTab = ({
  projectId,
  activityId
}: ProjectActivityReportsTabProps) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">تقارير النشاط</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 ml-2" />
          {showForm ? "إلغاء" : "إضافة تقرير"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">إضافة تقرير جديد</h3>
          <ReportForm
            projectId={projectId}
            activityId={activityId}
            onSuccess={() => {
              setShowForm(false);
            }}
          />
        </Card>
      )}

      <ReportsList
        projectId={projectId}
        activityId={activityId}
      />
    </div>
  );
};