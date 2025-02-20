
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Document {
  id: string;
  name: string;
  type: string;
  expiry_date: string;
  status: string;
  issuer: string;
  file_path?: string;
}

interface DocumentsTableProps {
  documents: Document[];
  getRemainingDays: (date: string) => number;
  getStatusColor: (status: string) => string;
  handleDelete: (id: string, filePath?: string) => Promise<void>;
  downloadFile: (filePath: string, fileName: string) => Promise<void>;
}

export const DocumentsTable = ({
  documents,
  getRemainingDays,
  getStatusColor,
  handleDelete,
  downloadFile
}: DocumentsTableProps) => {
  const [editOpen, setEditOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setEditOpen(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">م</TableHead>
              <TableHead className="text-center">اسم المستند</TableHead>
              <TableHead className="text-center">النوع</TableHead>
              <TableHead className="text-center">تاريخ الانتهاء</TableHead>
              <TableHead className="text-center">الأيام المتبقية</TableHead>
              <TableHead className="text-center">الحالة</TableHead>
              <TableHead className="text-center">جهة الإصدار</TableHead>
              <TableHead className="text-center">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc, index) => (
              <TableRow key={doc.id}>
                <TableCell className="text-center">{index + 1}</TableCell>
                <TableCell className="text-center font-medium">{doc.name}</TableCell>
                <TableCell className="text-center">{doc.type}</TableCell>
                <TableCell dir="ltr" className="text-center">
                  {format(new Date(doc.expiry_date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell className="text-center">
                  {getRemainingDays(doc.expiry_date)} يوم
                </TableCell>
                <TableCell className={`text-center ${getStatusColor(doc.status)}`}>
                  {doc.status}
                </TableCell>
                <TableCell className="text-center">{doc.issuer}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    {doc.file_path && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => downloadFile(doc.file_path!, doc.name)}
                        title="تحميل"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(doc)}
                      title="تعديل"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(doc.id, doc.file_path)}
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل المستند</DialogTitle>
          </DialogHeader>
          {editingDocument && (
            <form className="space-y-4">
              <div>
                <Label htmlFor="name">اسم المستند</Label>
                <Input
                  id="name"
                  defaultValue={editingDocument.name}
                />
              </div>
              <div>
                <Label htmlFor="type">نوع المستند</Label>
                <Input
                  id="type"
                  defaultValue={editingDocument.type}
                />
              </div>
              <div>
                <Label htmlFor="expiry_date">تاريخ الانتهاء</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  defaultValue={editingDocument.expiry_date}
                />
              </div>
              <div>
                <Label htmlFor="issuer">جهة الإصدار</Label>
                <Input
                  id="issuer"
                  defaultValue={editingDocument.issuer}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  حفظ التغييرات
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
