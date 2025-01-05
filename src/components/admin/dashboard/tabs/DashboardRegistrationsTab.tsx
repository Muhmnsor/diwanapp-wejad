import { DashboardRegistrations } from "@/components/admin/DashboardRegistrations";

interface DashboardRegistrationsTabProps {
  projectId: string;
  isEvent?: boolean;
}

export const DashboardRegistrationsTab = ({ projectId, isEvent = false }: DashboardRegistrationsTabProps) => {
  console.log('DashboardRegistrationsTab - Rendering with:', { projectId, isEvent });
  
  return <DashboardRegistrations eventId={projectId} />;
};