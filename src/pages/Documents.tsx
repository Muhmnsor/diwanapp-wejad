import { useEffect, useState } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Archive, FileText, Receipt, FileDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { DocumentsTable } from "@/components/documents/DocumentsTable";
import { DocumentStats } from "@/components/documents/DocumentStats";
import { DocumentControls } from "@/components/documents/DocumentControls";
import { AddDocumentDialog } from "@/components/documents/AddDocumentDialog";
import { determineStatus, getStatusColor, getRemainingDays } from "@/utils/documentStatus";
import { downloadFile, handleDelete, handleFileUpload } from "@/components/documents/DocumentOperations";
import { SubscriptionsTab } from "@/components/subscriptions/SubscriptionsTab";
import { TemplatesTab } from "@/components/templates/TemplatesTab";

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
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
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

      const updatedDocuments = (data || []).map(doc => ({
        ...doc,
        status: determineStatus(doc.expiry_date)
      }));

      setDocuments(updatedDocuments);
      setFilteredDocuments(updatedDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('حدث خطأ أثناء تحميل المستندات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, selectedStatuses);
  };

  const handleFilterStatusChange = (statuses: string[]) => {
    setSelectedStatuses(statuses);
    applyFilters(searchQuery, statuses);
  };

  const applyFilters = (query: string, statuses: string[]) => {
    let filtered = documents;

    if (query) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(query.toLowerCase()) ||
        doc.type.toLowerCase().includes(query.toLowerCase()) ||
        doc.issuer.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (statuses.length > 0) {
      filtered = filtered.filter(doc => statuses.includes(doc.status));
    }

    setFilteredDocuments(filtered);
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
      toast.error('يجب تسجي�� الدخول أولاً');
      return;
    }

    try {
      setIsLoading(true);
      await handleFileUpload(selectedFile, user.id, newDocument, () => {
        fetchDocuments();
        setNewDocument({ name: "", type: "", expiry_date: "", issuer: "" });
        setSelectedFile(null);
        setDialogOpen(false);
      });
    } catch (error) {
      // Error already handled in handleFileUpload
    } finally {
      setIsLoading(false);
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
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              <span>النماذج</span>
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span>الاشتراكات</span>
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
              open={dialogOpen}
              onOpenChange={setDialogOpen}
            />

            <DocumentStats documents={documents} />
            
            <DocumentControls 
              onSearch={handleSearch}
              onFilterStatusChange={handleFilterStatusChange}
            />

            <DocumentsTable
              documents={filteredDocuments}
              getRemainingDays={getRemainingDays}
              getStatusColor={getStatusColor}
              handleDelete={(id, filePath) => handleDelete(id, filePath, fetchDocuments)}
              downloadFile={downloadFile}
              onUpdate={fetchDocuments}
            />
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <TemplatesTab />
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-6">
            <SubscriptionsTab />
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
