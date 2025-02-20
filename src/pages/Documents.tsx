
import { useEffect, useState } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { FileText, Archive, Filter, Download, Search, Upload, Trash2, Edit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, differenceInDays } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/auth/authStore";

interface Document {
  id: string;
  name: string;
  type: string;
  expiry_date: string;
  status: string;
  issuer: string;
  file_path?: string;
  file_size?: number;
  created_by?: string;
}

const Documents = () => {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newDocument, setNewDocument] = useState({
    name: "",
    type: "",
    expiry_date: "",
    issuer: "",
  });

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('حدث خطأ أثناء تحميل المستندات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error('حجم الملف يجب أن لا يتجاوز 10 ميجابايت');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('الرجاء اختيار ملف');
      return;
    }

    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      setIsLoading(true);
      
      // رفع الملف إلى Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      console.log('Uploading file:', { filePath, fileSize: selectedFile.size, fileType: selectedFile.type });
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully, inserting document record');

      // إضافة المستند إلى قاعدة البيانات
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          ...newDocument,
          file_path: filePath,
          file_size: selectedFile.size,
          file_type: selectedFile.type,
          status: 'ساري',
          created_by: user.id
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        // إذا فشل إدخال البيانات، نحذف الملف المرفوع
        await supabase.storage
          .from('documents')
          .remove([filePath]);
        throw insertError;
      }

      toast.success('تم إضافة المستند بنجاح');
      fetchDocuments();
      setNewDocument({ name: "", type: "", expiry_date: "", issuer: "" });
      setSelectedFile(null);
      
      // إغلاق مربع الحوار
      const closeButton = document.querySelector('[data-dialog-close]') as HTMLButtonElement;
      if (closeButton) closeButton.click();
      
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error('حدث خطأ أثناء إضافة المستند');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, filePath?: string) => {
    try {
      if (filePath) {
        await supabase.storage
          .from('documents')
          .remove([filePath]);
      }

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('تم حذف المستند بنجاح');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('حدث خطأ أثناء حذف المستند');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ساري":
        return "text-green-600";
      case "قريب من الانتهاء":
        return "text-yellow-600";
      case "منتهي":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getRemainingDays = (expiryDate: string) => {
    const remaining = differenceInDays(new Date(expiryDate), new Date());
    return remaining;
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('حدث خطأ أثناء تحميل الملف');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="documents" dir="rtl" className="w-full">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>المستندات</span>
            </TabsTrigger>
            <TabsTrigger value="archive" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              <span>الأرشيف</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-6">
            {/* إضافة مستند جديد */}
            <Dialog>
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
                    <Input
                      id="type"
                      value={newDocument.type}
                      onChange={(e) => setNewDocument({...newDocument, type: e.target.value})}
                      required
                    />
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

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي المستندات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{documents.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">المستندات السارية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {documents.filter(d => d.status === "ساري").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">قريبة من الانتهاء</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {documents.filter(d => d.status === "قريب من الانتهاء").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">المستندات المنتهية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {documents.filter(d => d.status === "منتهي").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="بحث في المستندات..."
                  className="pl-10 w-full"
                  dir="rtl"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                تصفية
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                تصدير
              </Button>
            </div>

            {/* Documents Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم المستند</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                    <TableHead className="text-right">الأيام المتبقية</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">جهة الإصدار</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>{doc.type}</TableCell>
                      <TableCell dir="ltr" className="text-right">
                        {format(new Date(doc.expiry_date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        {getRemainingDays(doc.expiry_date)} يوم
                      </TableCell>
                      <TableCell className={getStatusColor(doc.status)}>
                        {doc.status}
                      </TableCell>
                      <TableCell>{doc.issuer}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
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
          </TabsContent>

          <TabsContent value="archive" className="mt-6">
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Archive className="w-16 h-16 text-primary" />
              <h1 className="text-2xl font-bold text-primary text-center">قيد التطوير - الأرشيف</h1>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Documents;
