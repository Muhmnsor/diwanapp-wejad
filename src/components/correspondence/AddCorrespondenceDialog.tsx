import { supabase } from "@/integrations/supabase/client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { RichTextEditor } from "./RichTextEditor";

interface AddCorrespondenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'incoming' | 'outgoing' | 'letter';
}

export const AddCorrespondenceDialog: React.FC<AddCorrespondenceDialogProps> = ({
  isOpen,
  onClose,
  type,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const [content, setContent] = useState<string>("");

  const getDialogTitle = () => {
    switch (type) {
      case 'incoming':
        return 'إضافة معاملة واردة';
      case 'outgoing':
        return 'إضافة معاملة صادرة';
      case 'letter':
        return 'إضافة خطاب';
      default:
        return 'إضافة معاملة جديدة';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles);
      setFiles((prev) => [...prev, ...fileArray]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(e.currentTarget);
    const subject = formData.get('subject') as string;
    const date = formData.get('date') as string;
    const sender = type === 'incoming'
      ? formData.get('sender') as string
      : formData.get('sender_select') as string;
    const recipient = type === 'incoming'
      ? formData.get('recipient_select') as string
      : formData.get('recipient') as string;
    const status = formData.get('status') as string;
    const notes = formData.get('notes') as string;
    const priority = formData.get('priority') as string;
    const is_confidential = formData.has('is_confidential');
    const related_correspondence_id = formData.get('related_correspondence_id') as string;

    try {
      // Create correspondence number (simple example - would be more sophisticated in production)
      const number = `${type.substring(0, 3)}-${Date.now().toString().substring(6)}`;

      // Insert into database
      const { data: correspondence, error: corrError } = await supabase
        .from('correspondence')
        .insert([
          {
            number,
            subject,
            date,
            sender,
            recipient,
            status,
            content,
            notes,
            type,
            priority,
            is_confidential,
            related_correspondence_id: related_correspondence_id || null,
            creation_date: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (corrError) throw corrError;

      // Upload attachments if any
      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${correspondence.id}_${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `correspondence/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('attachments')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Link attachment to correspondence
          await supabase
            .from('correspondence_attachments')
            .insert([
              {
                correspondence_id: correspondence.id,
                file_name: file.name,
                file_path: filePath,
                file_size: file.size,
                file_type: file.type
              }
            ]);
        }
      }

      toast({
        title: "تمت إضافة المعاملة بنجاح",
        description: `تم إضافة المعاملة برقم ${number}`,
      });

      // Clear the form
      setFiles([]);
      onClose();
    } catch (error) {
      console.error('Error adding correspondence:', error);
      toast({
        variant: "destructive",
        title: "خطأ في إضافة المعاملة",
        description: "حدث خطأ أثناء إضافة المعاملة، يرجى المحاولة مرة أخرى.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            أدخل بيانات المعاملة بالتفصيل، وأرفق الملفات المطلوبة.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">موضوع المعاملة</Label>
              <Input id="subject" name="subject" placeholder="أدخل موضوع المعاملة" required />
            </div>

            <div>
              <Label htmlFor="date">تاريخ المعاملة</Label>
              <Input id="date" name="date" type="date" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {type === 'incoming' ? (
              <>
                <div>
                  <Label htmlFor="sender">الجهة المرسلة</Label>
                  <Input id="sender" name="sender" placeholder="الجهة المرسلة" required />
                </div>

                <div>
                  <Label htmlFor="recipient_select">الجهة المستلمة</Label>
                  <Select name="recipient_select">
                    <SelectTrigger id="recipient_select">
                      <SelectValue placeholder="اختر المستلم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general_manager">المدير العام</SelectItem>
                      <SelectItem value="hr_manager">مدير الموارد البشرية</SelectItem>
                      <SelectItem value="projects_manager">مدير المشاريع</SelectItem>
                      <SelectItem value="finance_manager">المدير المالي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="sender_select">الجهة المرسلة</Label>
                  <Select name="sender_select">
                    <SelectTrigger id="sender_select">
                      <SelectValue placeholder="اختر المرسل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general_manager">المدير العام</SelectItem>
                      <SelectItem value="hr_manager">مدير الموارد البشرية</SelectItem>
                      <SelectItem value="projects_manager">مدير المشاريع</SelectItem>
                      <SelectItem value="finance_manager">المدير المالي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="recipient">الجهة المستلمة</Label>
                  <Input id="recipient" name="recipient" placeholder="الجهة المستلمة" required />
                </div>
              </>
            )}
          </div>

          <div>
            <Label htmlFor="status">حالة المعاملة</Label>
            <Select name="status">
              <SelectTrigger id="status">
                <SelectValue placeholder="اختر حالة المعاملة" />
              </SelectTrigger>
              <SelectContent>
                {type === 'incoming' && (
                  <>
                    <SelectItem value="قيد المعالجة">قيد المعالجة</SelectItem>
                    <SelectItem value="مكتمل">مكتمل</SelectItem>
                    <SelectItem value="معلق">معلق</SelectItem>
                  </>
                )}
                {type === 'outgoing' && (
                  <>
                    <SelectItem value="مرسل">مرسل</SelectItem>
                    <SelectItem value="قيد الإعداد">قيد الإعداد</SelectItem>
                  </>
                )}
                {type === 'letter' && (
                  <>
                    <SelectItem value="معتمد">معتمد</SelectItem>
                    <SelectItem value="مسودة">مسودة</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="content">محتوى المعاملة</Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="أدخل محتوى المعاملة"
              minHeight="150px"
            />
          </div>

          <div>
            <Label>المرفقات</Label>
            <div className="mt-2 p-4 border border-dashed rounded-md">
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div className="text-sm font-medium">{file.name} ({(file.size / 1024).toFixed(2)} KB)</div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      إزالة
                    </Button>
                  </div>
                ))}

                <div className="flex items-center justify-center p-4">
                  <label htmlFor="file-upload" className="cursor-pointer flex items-center text-primary">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    <span>إضافة مرفق</span>
                    <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} multiple />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {type !== 'incoming' && (
            <div>
              <Label htmlFor="notes">ملاحظات إضافية</Label>
              <Textarea id="notes" name="notes" placeholder="أية ملاحظات إضافية" />
            </div>
          )}

          {/* إضافة حقول متقدمة */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">الأولوية</Label>
              <Select name="priority">
                <SelectTrigger id="priority">
                  <SelectValue placeholder="اختر الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">عاجل</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="low">عادي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="is_confidential" className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  id="is_confidential"
                  name="is_confidential"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>معاملة سرية</span>
              </Label>
            </div>
          </div>

          {/* حقل المعاملات المرتبطة */}
          <div>
            <Label htmlFor="related_correspondence_id">ربط بمعاملة أخرى (اختياري)</Label>
            <Select name="related_correspondence_id">
              <SelectTrigger id="related_correspondence_id">
                <SelectValue placeholder="اختر معاملة للربط" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">لا يوجد</SelectItem>
                {/* هنا يمكن إضافة loop لعرض المعاملات السابقة */}
              </SelectContent>
            </Select>
          </div>

          {/* حقل الوسوم */}
          <div>
            <Label>الوسوم (اختيارية)</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              <div className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-sm">
                <span className="ml-1">إداري</span>
                <button type="button" className="text-muted-foreground hover:text-foreground">
                  <span className="sr-only">Remove tag</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
              <button type="button" className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mr-1 h-3 w-3">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                إضافة وسم
              </button>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2 sm:justify-start">
            <Button type="submit">إضافة المعاملة</Button>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
