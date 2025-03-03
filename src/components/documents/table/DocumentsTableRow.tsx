
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Document } from "../types/document";
import { DocumentActions } from "./DocumentActions";

interface DocumentsTableRowProps {
  document: Document;
  index: number;
  getRemainingDays: (date: string) => number;
  getStatusColor: (status: string) => string;
  onDownload: (filePath: string, fileName: string) => Promise<void>;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
}

export const DocumentsTableRow = ({
  document,
  index,
  getRemainingDays,
  getStatusColor,
  onDownload,
  onEdit,
  onDelete
}: DocumentsTableRowProps) => {
  return (
    <TableRow key={document.id}>
      <TableCell className="text-center">{index + 1}</TableCell>
      <TableCell className="text-center font-medium">{document.name}</TableCell>
      <TableCell className="text-center">{document.type}</TableCell>
      <TableCell dir="ltr" className="text-center">
        {format(new Date(document.expiry_date), 'dd/MM/yyyy')}
      </TableCell>
      <TableCell className="text-center">
        {getRemainingDays(document.expiry_date)} يوم
      </TableCell>
      <TableCell className={`text-center ${getStatusColor(document.status)}`}>
        {document.status}
      </TableCell>
      <TableCell className="text-center">{document.issuer}</TableCell>
      <TableCell>
        <DocumentActions 
          document={document}
          onDownload={onDownload}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};
