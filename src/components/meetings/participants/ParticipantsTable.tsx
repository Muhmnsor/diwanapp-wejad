
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MeetingParticipant } from "@/types/meeting";
import { ParticipantsTableRow } from "./ParticipantsTableRow";

interface ParticipantsTableProps {
  participants: MeetingParticipant[];
  meetingId: string;
}

export const ParticipantsTable = ({ participants, meetingId }: ParticipantsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>البريد الإلكتروني</TableHead>
            <TableHead>الدور</TableHead>
            <TableHead>حالة الحضور</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((participant) => (
            <ParticipantsTableRow
              key={participant.id}
              participant={participant}
              meetingId={meetingId}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
