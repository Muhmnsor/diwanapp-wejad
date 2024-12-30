import { useEffect, useState } from "react";
import { useAttendanceManagement } from "@/hooks/useAttendanceManagement";
import { AttendanceControls } from "./preparation/AttendanceControls";
import { AttendanceStats } from "./preparation/AttendanceStats";
import { AttendanceTable } from "./preparation/AttendanceTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardPreparationProps {
  projectId?: string;
  eventId?: string;
  activities?: any[];
}

export const DashboardPreparation = ({ projectId, eventId, activities = [] }: DashboardPreparationProps) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const {
    registrations,
    stats,
    handleBarcodeScanned,
    handleGroupAttendance,
    handleAttendanceChange,
    fetchRegistrations,
  } = useAttendanceManagement(projectId, eventId, selectedActivityId);

  useEffect(() => {
    // For regular events, fetch registrations directly
    if (eventId && !projectId) {
      console.log("Fetching registrations for event:", eventId);
      fetchRegistrations();
    }
    // For project activities, only fetch when an activity is selected
    else if (projectId && selectedActivityId) {
      console.log("Fetching registrations for activity:", selectedActivityId);
      fetchRegistrations();
    }
  }, [projectId, eventId, selectedActivityId, fetchRegistrations]);

  // Only show activity selector for projects
  const showActivitySelector = projectId && activities && activities.length > 0;

  // For regular events, show attendance components directly
  const showAttendanceComponents = (!projectId && eventId) || (projectId && selectedActivityId);

  return (
    <div className="space-y-6">
      {showActivitySelector && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">اختر النشاط للتحضير</h3>
          <Select
            value={selectedActivityId || ""}
            onValueChange={(value) => setSelectedActivityId(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر النشاط" />
            </SelectTrigger>
            <SelectContent>
              {activities.map((activity) => (
                <SelectItem key={activity.id} value={activity.id}>
                  {activity.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showAttendanceComponents && (
        <>
          <AttendanceControls
            onBarcodeScanned={handleBarcodeScanned}
            onGroupAttendance={handleGroupAttendance}
          />
          <AttendanceStats stats={stats} />
          <AttendanceTable
            registrations={registrations}
            onAttendanceChange={handleAttendanceChange}
          />
        </>
      )}
    </div>
  );
};