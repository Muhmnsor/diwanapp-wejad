import { DashboardTabs } from "../admin/dashboard/DashboardTabs";
import { useProjectDashboardData } from "./useProjectDashboardData";

export const ProjectDashboard = ({ projectId }: { projectId: string }) => {
  const { data, isLoading, error } = useProjectDashboardData(projectId);

  if (isLoading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  if (error || !data?.project) {
    return <div className="text-center p-8 text-red-500">لم يتم العثور على المشروع</div>;
  }

  return (
    <div className="space-y-6">
      <DashboardTabs
        registrationCount={data.registrationCount}
        remainingSeats={data.remainingSeats}
        occupancyRate={data.occupancyRate}
        eventDate={data.project.start_date}
        eventTime="00:00"
        registrations={data.registrations}
        eventTitle={data.project.title}
        eventId={projectId}
        eventPath={data.project.event_path}
        eventCategory={data.project.event_category}
      />
    </div>
  );
};