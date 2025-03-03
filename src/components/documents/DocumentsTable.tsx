
import { Table, TableBody } from "@/components/ui/table";
import { useState } from "react";
import { Document } from "./types/document";
import { DocumentsTableHeader } from "./table/DocumentsTableHeader";
import { DocumentsTableRow } from "./table/DocumentsTableRow";
import { EditDocumentDialog } from "./dialogs/EditDocumentDialog";
import { DeleteDocumentDialog } from "./dialogs/DeleteDocumentDialog";

interface DocumentsTableProps {
  documents: Document[];
  getRemainingDays: (date: string) => number;
  getStatusColor: (status: string) => string;
  handleDelete: (id: string, filePath?: string) => Promise<void>;
  downloadFile: (filePath: string, fileName: string) => Promise<void>;
  onUpdate: () => void;
}

export const DocumentsTable = ({
  documents,
  getRemainingDays,
  getStatusColor,
  handleDelete,
  downloadFile,
  onUpdate
}: DocumentsTableProps) => {
  const [editOpen, setEditOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setEditOpen(true);
  };

  const handleDeleteClick = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (documentToDelete) {
      await handleDelete(documentToDelete.id, documentToDelete.file_path);
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <DocumentsTableHeader />
          <TableBody>
            {documents.map((doc, index) => (
              <DocumentsTableRow
                key={doc.id}
                document={doc}
                index={index}
                getRemainingDays={getRemainingDays}
                getStatusColor={getStatusColor}
                onDownload={downloadFile}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <EditDocumentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        document={editingDocument}
        onUpdate={onUpdate}
      />

      <DeleteDocumentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        document={documentToDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
};
