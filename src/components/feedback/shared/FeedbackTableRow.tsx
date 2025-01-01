import { TableCell, TableRow } from "@/components/ui/table";

interface FeedbackTableRowProps {
  overall: number;
  content: number;
  organization: number;
  presenter: number;
}

export const FeedbackTableRow = ({ 
  overall, 
  content, 
  organization, 
  presenter 
}: FeedbackTableRowProps) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <TableRow>
      <TableCell className={`text-right font-medium ${getRatingColor(overall)}`}>
        {overall.toFixed(1)}
      </TableCell>
      <TableCell className={`text-right ${getRatingColor(content)}`}>
        {content.toFixed(1)}
      </TableCell>
      <TableCell className={`text-right ${getRatingColor(organization)}`}>
        {organization.toFixed(1)}
      </TableCell>
      <TableCell className={`text-right ${getRatingColor(presenter)}`}>
        {presenter.toFixed(1)}
      </TableCell>
    </TableRow>
  );
};