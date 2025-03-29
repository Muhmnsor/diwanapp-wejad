
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Meeting, MeetingStatus, AttendanceType, MeetingType } from "@/types/meeting";

interface MeetingsDashboardData {
  totalMeetings: number;
  upcomingMeetings: number;
  inProgressMeetings: number;
  completedMeetings: number;
  averageAttendance: number | null;
  statusDistribution: {
    name: string;
    count: number;
    color: string;
  }[];
  typeDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  attendanceTypeDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  monthlyDistribution: {
    name: string;
    value: number;
  }[];
}

export const useMeetingsDashboard = () => {
  return useQuery({
    queryKey: ['meetings-dashboard'],
    queryFn: async (): Promise<MeetingsDashboardData> => {
      console.log('Fetching meetings dashboard data');
      
      // Fetch all meetings
      const { data: meetings, error } = await supabase
        .from('meetings')
        .select(`
          *,
          meeting_participants(*)
        `);
        
      if (error) {
        console.error("Error fetching meetings for dashboard:", error);
        throw error;
      }

      // Calculate overall statistics
      const totalMeetings = meetings.length;
      
      // Count by status
      const upcomingMeetings = meetings.filter(m => m.meeting_status === 'scheduled').length;
      const inProgressMeetings = meetings.filter(m => m.meeting_status === 'in_progress').length;
      const completedMeetings = meetings.filter(m => m.meeting_status === 'completed').length;
      const cancelledMeetings = meetings.filter(m => m.meeting_status === 'cancelled').length;
      
      // Calculate status distribution
      const statusDistribution = [
        { name: 'مجدولة', count: upcomingMeetings, color: '#3B82F6' },  // blue
        { name: 'جارية', count: inProgressMeetings, color: '#F59E0B' }, // amber
        { name: 'مكتملة', count: completedMeetings, color: '#10B981' }, // green
        { name: 'ملغاة', count: cancelledMeetings, color: '#EF4444' },  // red
      ];
      
      // Calculate attendance rate - not implemented as we need more data
      // Placeholder for now
      const averageAttendance = null;
      
      // Calculate meeting type distribution
      const meetingTypesMap: Record<string, number> = {};
      meetings.forEach(meeting => {
        const type = meeting.meeting_type;
        if (!meetingTypesMap[type]) {
          meetingTypesMap[type] = 0;
        }
        meetingTypesMap[type]++;
      });
      
      const typeDistribution = Object.entries(meetingTypesMap).map(([type, count], index) => {
        let name: string;
        switch (type) {
          case 'board': name = 'مجلس إدارة'; break;
          case 'department': name = 'قسم'; break;
          case 'team': name = 'فريق عمل'; break;
          case 'committee': name = 'لجنة'; break;
          default: name = 'أخرى';
        }
        
        // Different colors for different types
        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE'];
        
        return {
          name,
          value: count,
          color: colors[index % colors.length]
        };
      });
      
      // Calculate attendance type distribution
      const attendanceTypesMap: Record<string, number> = {};
      meetings.forEach(meeting => {
        const type = meeting.attendance_type;
        if (!attendanceTypesMap[type]) {
          attendanceTypesMap[type] = 0;
        }
        attendanceTypesMap[type]++;
      });
      
      const attendanceTypeDistribution = Object.entries(attendanceTypesMap).map(([type, count], index) => {
        let name: string;
        switch (type) {
          case 'in_person': name = 'حضوري'; break;
          case 'virtual': name = 'افتراضي'; break;
          case 'hybrid': name = 'مختلط'; break;
          default: name = 'غير محدد';
        }
        
        // Different colors for different attendance types
        const colors = ['#00C49F', '#FFBB28', '#FF8042'];
        
        return {
          name,
          value: count,
          color: colors[index % colors.length]
        };
      });
      
      // Calculate monthly distribution
      const arabicMonths = [
        'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      
      const meetingsByMonth: Record<number, number> = {};
      meetings.forEach(meeting => {
        const date = new Date(meeting.date);
        const month = date.getMonth();
        
        if (!meetingsByMonth[month]) {
          meetingsByMonth[month] = 0;
        }
        meetingsByMonth[month]++;
      });
      
      const monthlyDistribution = arabicMonths.map((name, index) => ({
        name,
        value: meetingsByMonth[index] || 0
      }));
      
      return {
        totalMeetings,
        upcomingMeetings,
        inProgressMeetings,
        completedMeetings,
        averageAttendance,
        statusDistribution,
        typeDistribution,
        attendanceTypeDistribution,
        monthlyDistribution
      };
    }
  });
};
