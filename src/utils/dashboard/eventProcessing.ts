import { ChartData } from "@/types/dashboard";

export const calculateEventStats = (events: any[], projects: any[]) => {
  const allEvents = [
    ...(events || []).map(event => ({
      ...event,
      type: 'event',
      registrationCount: event.registrations?.[0]?.count || 0,
      attendanceCount: event.attendance_records?.filter((record: any) => record.status === 'present').length || 0,
      averageRating: event.event_feedback?.length > 0
        ? event.event_feedback.reduce((sum: number, feedback: any) => sum + (feedback.overall_rating || 0), 0) / event.event_feedback.length
        : 0,
      date: new Date(event.date)
    })),
    ...(projects || []).map(project => ({
      ...project,
      type: 'project',
      registrationCount: project.registrations?.[0]?.count || 0,
      attendanceCount: project.events?.reduce((sum: number, event: any) => 
        sum + (event.attendance_records?.filter((record: any) => record.status === 'present').length || 0), 0) || 0,
      averageRating: project.events?.reduce((sum: number, event: any) => {
        const eventRating = event.event_feedback?.length > 0
          ? event.event_feedback.reduce((rSum: number, feedback: any) => rSum + (feedback.overall_rating || 0), 0) / event.event_feedback.length
          : 0;
        return sum + eventRating;
      }, 0) / (project.events?.length || 1),
      date: new Date(project.start_date)
    }))
  ];

  return allEvents;
};