import { Card } from "@/components/ui/card";

interface DashboardReportsTabProps {
  projectId: string;
  isEvent?: boolean;
}

export const DashboardReportsTab = ({ projectId, isEvent = false }: DashboardReportsTabProps) => {
  console.log('DashboardReportsTab - Rendering with:', { projectId, isEvent });
  
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">التقارير</h2>
      {/* Add reports content here */}
    </Card>
  );
};