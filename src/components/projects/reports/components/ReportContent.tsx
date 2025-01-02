import { TableCell } from "@/components/ui/table";
import { ProjectReport } from "@/types/projectReport";

type ReportContentProps = Pick<
  ProjectReport,
  | "report_text"
  | "detailed_description"
  | "activity_duration"
  | "attendees_count"
  | "activity_objectives"
  | "impact_on_participants"
  | "created_at"
  | "photos"
  | "activity_id"
>;

export const ReportContent = ({
  report_text,
  detailed_description,
  activity_duration,
  attendees_count,
  activity_objectives,
  impact_on_participants,
  created_at,
  photos,
  activity_id,
}: ReportContentProps) => {
  return (
    <>
      <TableCell className="font-medium">{report_text}</TableCell>
      <TableCell>{detailed_description}</TableCell>
      <TableCell>{activity_duration}</TableCell>
      <TableCell>{attendees_count}</TableCell>
      <TableCell>{activity_objectives}</TableCell>
      <TableCell>{impact_on_participants}</TableCell>
      <TableCell>{created_at}</TableCell>
      <TableCell>{photos?.length || 0} صور</TableCell>
      <TableCell>{activity_id}</TableCell>
    </>
  );
};