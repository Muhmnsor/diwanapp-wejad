import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAttendanceStats = () => {
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    notRecorded: 0
  });

  const fetchActivityAttendance = async (projectId: string, activityId: string) => {
    console.log('Fetching attendance for activity:', activityId, 'in project:', projectId);
    
    if (!projectId || !activityId) {
      console.log('Missing required IDs:', { projectId, activityId });
      return { total: 0, present: 0, absent: 0, notRecorded: 0 };
    }

    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('status')
        .eq('project_id', projectId)
        .eq('activity_id', activityId);

      if (error) {
        console.error('Error fetching activity attendance:', error);
        throw error;
      }

      if (!data) {
        return { total: 0, present: 0, absent: 0, notRecorded: 0 };
      }

      const stats = {
        total: data.length,
        present: data.filter(r => r.status === 'present').length,
        absent: data.filter(r => r.status === 'absent').length,
        notRecorded: 0
      };

      console.log('Attendance stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('Error in fetchActivityAttendance:', error);
      return { total: 0, present: 0, absent: 0, notRecorded: 0 };
    }
  };

  return {
    attendanceStats,
    setAttendanceStats,
    fetchActivityAttendance
  };
};