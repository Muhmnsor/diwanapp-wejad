import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { ProjectActivityReportForm } from "../../reports/ProjectActivityReportForm";
import { ProjectReportsList } from "../../reports/ProjectReportsList";
import { Card } from "@/components/ui/card";

interface DashboardReportsTabProps {
  projectId: string;
  activityId: string;
}

export const DashboardReportsTab = ({
  projectId,
  activityId
}: DashboardReportsTabProps) => {
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">تقارير النشاط</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة تقرير
          </Button>
        )}
      </div>

      {showForm ? (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">إضافة تقرير جديد</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ProjectActivityReportForm
            projectId={projectId}
            activityId={activityId}
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      ) : (
        <Card>
          <ProjectReportsList
            projectId={projectId}
            activityId={activityId}
          />
        </Card>
      )}
    </div>
  );
};