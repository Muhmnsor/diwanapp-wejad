import { TableCell } from "@/components/ui/table";

export interface ReportContentProps {
  report_text: string;
  detailed_description: string;
  event_duration?: string;
  activity_duration?: string;
  attendees_count: string;
  event_objectives?: string;
  activity_objectives?: string;
  impact_on_participants: string;
  created_at: string;
  photos: any[];
  isProjectActivity?: boolean;
}

export const ReportContent = ({
  report_text,
  detailed_description,
  event_duration,
  activity_duration,
  attendees_count,
  event_objectives,
  activity_objectives,
  impact_on_participants,
  created_at,
  photos,
  isProjectActivity,
}: ReportContentProps) => {
  return (
    <>
      <TableCell className="font-medium">{report_text}</TableCell>
      <TableCell>{detailed_description}</TableCell>
      <TableCell>{isProjectActivity ? activity_duration : event_duration}</TableCell>
      <TableCell>{attendees_count}</TableCell>
      <TableCell>{isProjectActivity ? activity_objectives : event_objectives}</TableCell>
      <TableCell>{impact_on_participants}</TableCell>
      <TableCell>{created_at}</TableCell>
      <TableCell>{photos.length} صور</TableCell>
    </>
  );
};