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
    if (projectId && selectedActivityId) {
      console.log("Fetching registrations for activity:", selectedActivityId);
      fetchRegistrations();
    } else if (eventId) {
      console.log("Fetching registrations for event:", eventId);
      fetchRegistrations();
    }
  }, [projectId, eventId, selectedActivityId, fetchRegistrations]);

  // Only show activity selector for projects
  const showActivitySelector = projectId && activities && activities.length > 0;

  return (
    <div className="space-y-6">
      {showActivitySelector ? (
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
      ) : null}

      {/* Show attendance controls only if it's a single event or if an activity is selected */}
      {(!showActivitySelector || (showActivitySelector && selectedActivityId)) && (
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