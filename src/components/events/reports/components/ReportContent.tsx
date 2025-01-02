import { TableCell } from "@/components/ui/table";
import { EventReport } from "@/types/eventReport";

type ReportContentProps = Pick<
  EventReport,
  | "report_text"
  | "detailed_description"
  | "duration"
  | "activity_duration"
  | "attendees_count"
  | "objectives"
  | "activity_objectives"
  | "impact_on_participants"
  | "created_at"
  | "photos"
  | "event_id"
>;

export const ReportContent = ({
  report_text,
  detailed_description,
  duration,
  activity_duration,
  attendees_count,
  objectives,
  activity_objectives,
  impact_on_participants,
  created_at,
  photos,
  event_id,
}: ReportContentProps) => {
  return (
    <>
      <TableCell className="font-medium">{report_text}</TableCell>
      <TableCell>{detailed_description}</TableCell>
      <TableCell>{duration || activity_duration}</TableCell>
      <TableCell>{attendees_count}</TableCell>
      <TableCell>{objectives || activity_objectives}</TableCell>
      <TableCell>{impact_on_participants}</TableCell>
      <TableCell>{created_at}</TableCell>
      <TableCell>{photos?.length || 0} صور</TableCell>
      <TableCell>{event_id}</TableCell>
    </>
  );
};