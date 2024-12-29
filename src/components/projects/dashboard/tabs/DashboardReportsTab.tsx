import { ReportsTab } from "@/components/admin/dashboard/ReportsTab";

interface DashboardReportsTabProps {
  projectId: string;
}

export const DashboardReportsTab = ({ projectId }: DashboardReportsTabProps) => {
  return <ReportsTab eventId={projectId} />;
};