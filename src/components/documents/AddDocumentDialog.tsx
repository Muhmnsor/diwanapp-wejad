
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NewDocument {
  name: string;
  type: string;
  expiry_date: string;
  issuer: string;
}

interface AddDocumentDialogProps {
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  newDocument: NewDocument;
  setNewDocument: (doc: NewDocument) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  "مذكرة"
];

export const AddDocumentDialog = ({
  isLoading,
  handleSubmit,
  handleFileChange,
  newDocument,
  setNewDocument,
  open,
  onOpenChange
}: AddDocumentDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="mb-6">
          <Upload className="ml-2 h-4 w-4" />
          إضافة مستند جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة مستند جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">اسم المستند</Label>
            <Input
              id="name"
              value={newDocument.name}
              onChange={(e) => setNewDocument({...newDocument, name: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="type">نوع المستند</Label>
            <Select
              value={newDocument.type}
              onValueChange={(value) => setNewDocument({...newDocument, type: value})}
              required
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
              value={newDocument.expiry_date}
              onChange={(e) => setNewDocument({...newDocument, expiry_date: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="issuer">جهة الإصدار</Label>
            <Input
              id="issuer"
              value={newDocument.issuer}
              onChange={(e) => setNewDocument({...newDocument, issuer: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="file">الملف</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              الحد الأقصى لحجم الملف: 10 ميجابايت
            </p>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'جارٍ الرفع...' : 'رفع المستند'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
