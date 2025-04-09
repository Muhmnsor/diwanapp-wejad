import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { 
  File, 
  Image, 
  FileText, 
  FilePdf, 
  FileSpreadsheet, 
  FileDown, 
  Trash2, 
  Upload, 
  Eye, 
  PenSquare, 
  Plus,
  CheckCircle2,
  XCircle,
  FileImage
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  uploaded_at: string;
  uploaded_by: string;
  is_main_document: boolean;
  uploader_name?: string;
}

interface AttachmentsManagerProps {
  correspondenceId: string;
  mode?: 'view' | 'edit';
  onAttachmentAdded?: () => void;
}

export const AttachmentsManager: React.FC<AttachmentsManagerProps> = ({
  correspondenceId,
  mode = 'view',
  onAttachmentAdded
}) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewAttachment, setViewAttachment] = useState<Attachment | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isMainDocument, setIsMainDocument] = useState(false);
  
  useEffect(() => {
    fetchAttachments();
  }, [correspondenceId]);
  
  const fetchAttachments = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('correspondence_attachments')
        .select(`
          *,
          profiles:uploaded_by (
            display_name
          )
        `)
        .eq('correspondence_id', correspondenceId)
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      
      const enhancedData = data.map(attachment => ({
        ...attachment,
        uploader_name: attachment.profiles?.display_name
      }));
      
      setAttachments(enhancedData);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      toast({
        variant: "destructive",
        title: "خطأ في جلب المرفقات",
        description: "حدث خطأ أثناء جلب المرفقات، يرجى المحاولة مرة أخرى",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };
  
  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "خطأ في الرفع",
        description: "يرجى اختيار ملف لرفعه",
      });
      return;
    }
    
    if (!fileName.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ في الرفع",
        description: "يرجى إدخال اسم للملف",
      });
      return;
    }
    
    setUploading(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error("لم يتم العثور على معلومات المستخدم");
      }
      
      // جلب بيانات الوقت والاسم للملف
      const timestamp = new Date().getTime();
      const fileExtension = files[0].name.split('.').pop();
      const filePath = `attachments/${correspondenceId}/${timestamp}_${fileName.replace(/\s/g, '_')}.${fileExtension}`;
      
      // رفع الملف للتخزين
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('correspondence')
        .upload(filePath, files[0], {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      // إنشاء الرابط العام للملف
      const { data: urlData } = await supabase.storage
        .from('correspondence')
        .getPublicUrl(filePath);
      
      // تخزين بيانات المرفق في قاعدة البيانات
      const { data: attachmentData, error: attachmentError } = await supabase
        .from('correspondence_attachments')
        .insert({
          file_name: fileName,
          file_type: files[0].type,
          file_size: files[0].size,
          file_path: urlData.publicUrl,
          correspondence_id: correspondenceId,
          uploaded_by: user.user.id,
          is_main_document: isMainDocument
        })
        .select()
        .single();
      
      if (attachmentError) throw attachmentError;
      
      // إذا تم تحديد الملف كمستند رئيسي، قم بتحديث باقي المرفقات
      if (isMainDocument) {
        await supabase
          .from('correspondence_attachments')
          .update({ is_main_document: false })
          .eq('correspondence_id', correspondenceId)
          .neq('id', attachmentData.id);
      }
      
      toast({
        title: "تم رفع الملف بنجاح",
        description: `تم رفع الملف "${fileName}" بنجاح`,
      });
      
      // إعادة تعيين الحالة
      setFiles([]);
      setFileName("");
      setIsMainDocument(false);
      setUploadOpen(false);
      
      // إعادة تحميل المرفقات
      fetchAttachments();
      
      // استدعاء الدالة الخارجية إذا تم تمريرها
      if (onAttachmentAdded) {
        onAttachmentAdded();
      }
      
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        variant: "destructive",
        title: "خطأ في رفع الملف",
        description: "حدث خطأ أثناء رفع الملف، يرجى المحاولة مرة أخرى",
      });
    } finally {
      setUploading(false);
    }
  };
  
  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.file_path;
    link.download = attachment.file_name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleView = (attachment: Attachment) => {
    setViewAttachment(attachment);
    setViewDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('correspondence_attachments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // تحديث قائمة المرفقات
      setAttachments(prev => prev.filter(attachment => attachment.id !== id));
      
      toast({
        title: "تم حذف المرفق",
        description: "تم حذف المرفق بنجاح",
      });
      
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast({
        variant: "destructive",
        title: "خطأ في حذف المرفق",
        description: "حدث خطأ أثناء حذف المرفق، يرجى المحاولة مرة أخرى",
      });
    }
  };
  
  const handleSetMainDocument = async (id: string) => {
    try {
      // تحديث المرفق الحالي ليكون المستند الرئيسي
      const { error: updateError } = await supabase
        .from('correspondence_attachments')
        .update({ is_main_document: true })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // تحديث باقي المرفقات
      const { error: resetError } = await supabase
        .from('correspondence_attachments')
        .update({ is_main_document: false })
        .eq('correspondence_id', correspondenceId)
        .neq('id', id);
      
      if (resetError) throw resetError;
      
      // تحديث القائمة المحلية
      setAttachments(prev => 
        prev.map(attachment => ({
          ...attachment,
          is_main_document: attachment.id === id
        }))
      );
      
      toast({
        title: "تم تعيين المستند الرئيسي",
        description: "تم تعيين المستند الرئيسي بنجاح",
      });
      
    } catch (error) {
      console.error("Error setting main document:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تعيين المستند الرئيسي",
        description: "حدث خطأ أثناء تعيين المستند الرئيسي، يرجى المحاولة مرة أخرى",
      });
    }
  };
  
  const getFileIcon = (attachment: Attachment) => {
    const fileType = attachment.file_type.toLowerCase();
    
    if (fileType.includes('image')) {
      return <Image className="h-4 w-4 text-purple-500" />;
    } else if (fileType.includes('pdf')) {
      return <FilePdf className="h-4 w-4 text-red-500" />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet') || fileType.includes('csv')) {
      return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    } else {
      return <File className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} بايت`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} كيلوبايت`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} ميجابايت`;
    }
  };
  
  const filteredAttachments = activeTab === "all" 
    ? attachments 
    : activeTab === "main" 
      ? attachments.filter(a => a.is_main_document)
      : attachments.filter(a => !a.is_main_document);
  
  const renderAttachmentViewer = () => {
    if (!viewAttachment) return null;
    
    const fileType = viewAttachment.file_type.toLowerCase();
    
    if (fileType.includes('image')) {
      return (
        <div className="flex flex-col items-center">
          <img 
            src={viewAttachment.file_path} 
            alt={viewAttachment.file_name} 
            className="max-w-full max-h-[70vh] object-contain"
          />
          <div className="mt-4">
            <Button onClick={() => window.open(viewAttachment.file_path, '_blank')}>
              فتح الصورة في صفحة جديدة
            </Button>
          </div>
        </div>
      );
    } else if (fileType.includes('pdf')) {
      return (
        <iframe 
          src={viewAttachment.file_path} 
          className="w-full h-[70vh] border-0" 
          title={viewAttachment.file_name}
        />
      );
    } else {
      return (
        <div className="text-center p-8">
          <FileImage className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">لا يمكن عرض هذا الملف</h3>
          <p className="text-sm text-muted-foreground mb-4">
            نوع الملف ({viewAttachment.file_type}) لا يمكن عرضه مباشرة في المتصفح
          </p>
          <Button onClick={() => handleDownload(viewAttachment)}>
            <FileDown className="h-4 w-4 ml-2" />
            تنزيل الملف
          </Button>
        </div>
      );
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>المرفقات</CardTitle>
          {mode === 'edit' && (
            <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)}>
              <Plus className="h-4 w-4 ml-1" />
              إضافة مرفق
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">جميع المرفقات</TabsTrigger>
              <TabsTrigger value="main">المستندات الرئيسية</TabsTrigger>
              <TabsTrigger value="secondary">المرفقات الإضافية</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">جاري تحميل المرفقات...</p>
                </div>
              ) : filteredAttachments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground/60" />
                  <p>لا توجد مرفقات{activeTab === "main" ? " رئيسية" : activeTab === "secondary" ? " إضافية" : ""}</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[240px]">اسم الملف</TableHead>
                        <TableHead>الحجم</TableHead>
                        <TableHead className="hidden md:table-cell">تاريخ الرفع</TableHead>
                        <TableHead className="hidden md:table-cell">بواسطة</TableHead>
                        <TableHead>النوع</TableHead>
                        <TableHead className="text-left">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAttachments.map((attachment) => (
                        <TableRow key={attachment.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              {getFileIcon(attachment)}
                              <span className="truncate max-w-[180px]">{attachment.file_name}</span>
                              {attachment.is_main_document && (
                                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                                  رئيسي
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{formatFileSize(attachment.file_size)}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(attachment.uploaded_at).toLocaleString('ar-SA')}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {attachment.uploader_name || 'غير معروف'}
                          </TableCell>
                          <TableCell>
                            {attachment.file_type.split('/').pop()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleView(attachment)}
                              >
                                <Eye className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDownload(attachment)}
                              >
                                <FileDown className="h-4 w-4 text-blue-500" />
                              </Button>
                              {mode === 'edit' && (
                                <>
                                  {!attachment.is_main_document && (
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleSetMainDocument(attachment.id)}
                                      title="تعيين كمستند رئيسي"
                                    >
                                      <PenSquare className="h-4 w-4 text-green-500" />
                                    </Button>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleDelete(attachment.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* حوار إضافة مرفق */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة مرفق جديد</DialogTitle>
            <DialogDescription>
              قم باختيار الملف وإدخال المعلومات المطلوبة
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="file-name">اسم الملف</Label>
              <Input
                id="file-name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="أدخل اسماً وصفياً للملف"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="file-upload">اختر الملف</Label>
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Label 
                  htmlFor="file-upload" 
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium">اضغط لاختيار ملف</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    أو اسحب الملف وأفلته هنا
                  </span>
                </Label>
                
                {files.length > 0 && (
                  <div className="mt-4 text-sm text-left">
                    <div className="p-2 bg-muted rounded flex items-center justify-between">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="font-medium truncate max-w-[200px]">{files[0].name}</span>
                      </div>
                      <span>{formatFileSize(files[0].size)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                id="is-main-document"
                checked={isMainDocument}
                onChange={(e) => setIsMainDocument(e.target.checked)}
                className="mr-2"
              />
              <Label htmlFor="is-main-document">تعيين كمستند رئيسي</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleUpload} disabled={uploading || files.length === 0 || !fileName.trim()}>
              {uploading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload className="ml-2 h-4 w-4" />
                  رفع الملف
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* حوار عرض المرفق */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 space-x-reverse">
              {viewAttachment && getFileIcon(viewAttachment)}
              <span>{viewAttachment?.file_name}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-2 overflow-auto max-h-[70vh]">
            {renderAttachmentViewer()}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              إغلاق
            </Button>
            {viewAttachment && (
              <Button onClick={() => handleDownload(viewAttachment)}>
                <FileDown className="ml-2 h-4 w-4" />
                تنزيل
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

