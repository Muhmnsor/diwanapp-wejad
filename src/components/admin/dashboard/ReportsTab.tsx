import { ProjectActivityReportsTab } from "@/components/projects/reports/ProjectActivityReportsTab";

interface ReportsTabProps {
  eventId: string;
}

export const ReportsTab = ({ eventId }: ReportsTabProps) => {
  console.log("ReportsTab - eventId:", eventId);
  
  return (
    <div className="pt-6 space-y-6">
      <ProjectActivityReportsTab projectId={eventId} activityId={null} />
    </div>
  );
};