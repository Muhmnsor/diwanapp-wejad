import { TableCell } from "@/components/ui/table";

interface ReportContentProps {
  report_text: string;
  detailed_description: string | null;
  duration: string | null;
  attendees_count: string | null;
  objectives: string | null;
  impact_on_participants: string | null;
  created_at: string;
  photos: { url: string; description: string; }[] | null;
  event_id: string | null;
}

export const ReportContent = ({
  report_text,
  detailed_description,
  duration,
  attendees_count,
  objectives,
  impact_on_participants,
  created_at,
  photos,
  event_id,
}: ReportContentProps) => {
  return (
    <>
      <TableCell className="font-medium">{report_text}</TableCell>
      <TableCell>{detailed_description}</TableCell>
      <TableCell>{duration}</TableCell>
      <TableCell>{attendees_count}</TableCell>
      <TableCell>{objectives}</TableCell>
      <TableCell>{impact_on_participants}</TableCell>
      <TableCell>{created_at}</TableCell>
      <TableCell>{photos?.length || 0} صور</TableCell>
      <TableCell>{event_id}</TableCell>
    </>
  );
};