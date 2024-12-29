import { DashboardRegistrations } from "@/components/admin/DashboardRegistrations";

interface DashboardRegistrationsTabProps {
  projectId: string;
}

export const DashboardRegistrationsTab = ({ projectId }: DashboardRegistrationsTabProps) => {
  return <DashboardRegistrations eventId={projectId} />;
};