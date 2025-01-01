import { Table, TableBody } from "@/components/ui/table";
import { FeedbackTableHeader } from "./FeedbackTableHeader";
import { FeedbackTableRow } from "./FeedbackTableRow";

interface FeedbackTableProps {
  ratings: {
    overall: number;
    content: number;
    organization: number;
    presenter: number;
  };
}

export const FeedbackTable = ({ ratings }: FeedbackTableProps) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <FeedbackTableHeader />
        <TableBody>
          <FeedbackTableRow {...ratings} />
        </TableBody>
      </Table>
    </div>
  );
};