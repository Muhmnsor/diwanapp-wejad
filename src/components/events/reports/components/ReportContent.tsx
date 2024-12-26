import { TableCell } from "@/components/ui/table";
import { Report } from "@/types/report";

type ReportContentProps = Pick<
  Report,
  | "report_text"
  | "detailed_description"
  | "event_duration"
  | "attendees_count"
  | "event_objectives"
  | "impact_on_participants"
  | "created_at"
  | "photos"
  | "event_id"
>;

export const ReportContent = ({
  report_text,
  detailed_description,
  event_duration,
  attendees_count,
  event_objectives,
  impact_on_participants,
  created_at,
  photos,
  event_id,
}: ReportContentProps) => {
  return (
    <>
      <TableCell className="font-medium">{report_text}</TableCell>
      <TableCell>{detailed_description}</TableCell>
      <TableCell>{event_duration}</TableCell>
      <TableCell>{attendees_count}</TableCell>
      <TableCell>{event_objectives}</TableCell>
      <TableCell>{impact_on_participants}</TableCell>
      <TableCell>{created_at}</TableCell>
      <TableCell>{photos.length} صور</TableCell>
      <TableCell>{event_id}</TableCell>
    </>
  );
};