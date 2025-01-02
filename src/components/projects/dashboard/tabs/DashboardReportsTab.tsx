import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DashboardReportsTabProps {
  projectId: string;
  activityId: string;
}

export const DashboardReportsTab = ({
  projectId,
  activityId
}: DashboardReportsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">تقارير النشاط</h2>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          إضافة تقرير
        </Button>
      </div>

      <Card>
        <div className="p-6 text-center text-gray-500">
          نظام التقارير قيد التطوير
        </div>
      </Card>
    </div>
  );
};