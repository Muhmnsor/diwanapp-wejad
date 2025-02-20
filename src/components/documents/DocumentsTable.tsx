import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { determineStatus } from "@/utils/documentStatus";

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

const documentTypes = [
  "ترخيص",
  "شهادة",
  "تصريح",
  "اعتماد",
  "خطاب",
  "عقد",
  "اتفاقية",
  "سجل",
  "وثيقة",
  "تقرير",
  "بيان",
  "مذكرة",
  "أخرى"
];

export const DocumentsTable = ({
  documents: initialDocuments,
  getRemainingDays,
  getStatusColor,
  handleDelete,
  downloadFile
}: DocumentsTableProps) => {
  const [documents, setDocuments] = useState(initialDocuments);
  const [editOpen, setEditOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatedFields, setUpdatedFields] = useState<Partial<Document>>({});

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setUpdatedFields({});
    setEditOpen(true);
  };

  const handleFieldUpdate = (field: keyof Document, value: string) => {
    setUpdatedFields(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDocument) return;

    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('documents')
        .update({
          name: updatedFields.name || editingDocument.name,
          type: updatedFields.type || editingDocument.type,
          expiry_date: updatedFields.expiry_date || editingDocument.expiry_date,
          issuer: updatedFields.issuer || editingDocument.issuer,
        })
        .eq('id', editingDocument.id);

      if (error) throw error;

      const updatedDocument = {
        ...editingDocument,
        name: updatedFields.name || editingDocument.name,
        type: updatedFields.type || editingDocument.type,
        expiry_date: updatedFields.expiry_date || editingDocument.expiry_date,
        issuer: updatedFields.issuer || editingDocument.issuer,
        status: determineStatus(updatedFields.expiry_date || editingDocument.expiry_date)
      };

      setDocuments(prevDocuments => 
        prevDocuments.map(doc => 
          doc.id === editingDocument.id ? updatedDocument : doc
        )
      );

      toast.success('تم تحديث المستند بنجاح');
      setEditOpen(false);
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('حدث خطأ أثناء تحديث المستند');
    } finally {
      setIsUpdating(false);
    }
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
                      onClick={() => handleDeleteClick(doc)}
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
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="name">اسم المستند</Label>
                <Input
                  id="name"
                  defaultValue={editingDocument.name}
                  onChange={(e) => handleFieldUpdate('name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="type">نوع المستند</Label>
                <Select 
                  defaultValue={editingDocument.type}
                  onValueChange={(value) => handleFieldUpdate('type', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر نوع المستند" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expiry_date">تاريخ الانتهاء</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  defaultValue={editingDocument.expiry_date}
                  onChange={(e) => handleFieldUpdate('expiry_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="issuer">جهة الإصدار</Label>
                <Input
                  id="issuer"
                  defaultValue={editingDocument.issuer}
                  onChange={(e) => handleFieldUpdate('issuer', e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف المستند "{documentToDelete?.name}"؟
              <br />
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
