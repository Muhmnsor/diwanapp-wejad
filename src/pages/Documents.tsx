
import { useEffect, useState } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Archive, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { differenceInDays } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/auth/authStore";
import { DocumentsTable } from "@/components/documents/DocumentsTable";
import { DocumentStats } from "@/components/documents/DocumentStats";
import { DocumentControls } from "@/components/documents/DocumentControls";
import { AddDocumentDialog } from "@/components/documents/AddDocumentDialog";

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

  const determineStatus = (expiryDate: string) => {
    const remainingDays = differenceInDays(new Date(expiryDate), new Date());
    
    if (remainingDays < 0) {
      return "منتهي";
    } else if (remainingDays <= 30) {
      return "قريب من الانتهاء";
    } else {
      return "ساري";
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Update documents with calculated status
      const updatedDocuments = (data || []).map(doc => ({
        ...doc,
        status: determineStatus(doc.expiry_date)
      }));

      setDocuments(updatedDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('حدث خطأ أثناء تحميل المستندات');
    } finally {
      setIsLoading(false);
    }
  };

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
      
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const status = determineStatus(newDocument.expiry_date);

      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          ...newDocument,
          file_path: filePath,
          file_size: selectedFile.size,
          file_type: selectedFile.type,
          status: status,
          created_by: user.id
        });

      if (insertError) {
        await supabase.storage
          .from('documents')
          .remove([filePath]);
        throw insertError;
      }

      toast.success('تم إضافة المستند بنجاح');
      fetchDocuments();
      setNewDocument({ name: "", type: "", expiry_date: "", issuer: "" });
      setSelectedFile(null);
      
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
    return differenceInDays(new Date(expiryDate), new Date());
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

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

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
            <AddDocumentDialog
              isLoading={isLoading}
              handleSubmit={handleSubmit}
              handleFileChange={handleFileChange}
              newDocument={newDocument}
              setNewDocument={setNewDocument}
            />

            <DocumentStats documents={documents} />
            
            <DocumentControls />

            <DocumentsTable
              documents={documents}
              getRemainingDays={getRemainingDays}
              getStatusColor={getStatusColor}
              handleDelete={handleDelete}
              downloadFile={downloadFile}
            />
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
