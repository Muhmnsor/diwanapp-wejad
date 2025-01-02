import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ReportForm } from "../reports/ReportForm";

interface DashboardReportsTabProps {
  projectId: string;
}

export const DashboardReportsTab = ({ projectId }: DashboardReportsTabProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">تقارير النشاط</h2>
        <Button onClick={() => setIsFormOpen(!isFormOpen)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة تقرير
        </Button>
      </div>

      {isFormOpen && <ReportForm projectId={projectId} />}
    </div>
  );
};