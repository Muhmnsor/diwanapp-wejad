
import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { CorrespondenceTable } from "@/components/correspondence/CorrespondenceTable";
import { CorrespondenceViewDialog } from "@/components/correspondence/CorrespondenceViewDialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import { IncomingOutgoingMailHeader } from "@/components/correspondence/IncomingOutgoingMailHeader";

const IncomingOutgoingMail = () => {
  const [mails, setMails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMail, setSelectedMail] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const loadCorrespondence = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('correspondence')
        .select('*')
        .order('creation_date', { ascending: false });
      
      if (searchQuery) {
        query = query.or(`subject.ilike.%${searchQuery}%,number.ilike.%${searchQuery}%,sender.ilike.%${searchQuery}%,recipient.ilike.%${searchQuery}%`);
      }
      
      if (selectedType !== 'all') {
        query = query.eq('type', selectedType);
      }
      
      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setMails(data || []);
    } catch (error: any) {
      console.error('Error loading correspondence:', error);
      toast({
        variant: "destructive",
        title: "خطأ في تحميل البيانات",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCorrespondence();
  }, [selectedType, selectedStatus]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    loadCorrespondence();
  };

  const handleViewCorrespondence = (mail: any) => {
    setSelectedMail(mail.id);
    setIsViewDialogOpen(true);
  };

  const handleDownloadCorrespondence = async (mail: any) => {
    try {
      // First check if there are attachments
      const { data: attachments, error: attachmentsError } = await supabase
        .from('correspondence_attachments')
        .select('*')
        .eq('correspondence_id', mail.id);

      if (attachmentsError) {
        throw attachmentsError;
      }

      // If no attachments, show a message
      if (!attachments || attachments.length === 0) {
        toast({
          title: "لا توجد مرفقات",
          description: "لا توجد مرفقات لهذه المعاملة للتحميل"
        });
        return;
      }

      // If there's a main document, download it
      const mainDocument = attachments.find(att => att.is_main_document);
      const fileToDownload = mainDocument || attachments[0];

      const { data, error } = await supabase.storage
        .from('correspondence')
        .download(fileToDownload.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileToDownload.file_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error downloading correspondence:', error);
      toast({
        variant: "destructive",
        title: "خطأ في تحميل الملف",
        description: error.message || "حدث خطأ أثناء محاولة تحميل الملف"
      });
    }
  };

  const handleAddNew = () => {
    // Will implement in the future
    toast({
      title: "قريباً",
      description: "ستتمكن من إضافة معاملات جديدة قريباً"
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow" dir="rtl">
        <IncomingOutgoingMailHeader
          onSearch={handleSearch}
          onFilterType={setSelectedType}
          onFilterStatus={setSelectedStatus}
          onAddNew={handleAddNew}
          onExport={() => toast({ title: "قريباً", description: "ستتمكن من تصدير البيانات قريباً" })}
          onImport={() => toast({ title: "قريباً", description: "ستتمكن من استيراد البيانات قريباً" })}
          showAdvanced={showAdvancedFilters}
          toggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedType={selectedType}
          selectedStatus={selectedStatus}
        />
        
        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="mr-2">جاري تحميل البيانات...</span>
            </div>
          ) : (
            <>
              {mails.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-gray-50">
                  <p className="text-xl text-gray-500 mb-4">لا توجد معاملات تطابق معايير البحث</p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery("");
                    setSelectedStatus("all");
                    setSelectedType("all");
                    setShowAdvancedFilters(false);
                    loadCorrespondence();
                  }}>
                    إعادة تعيين البحث
                  </Button>
                </div>
              ) : (
                <CorrespondenceTable
                  mails={mails}
                  onView={handleViewCorrespondence}
                  onDownload={handleDownloadCorrespondence}
                />
              )}
            </>
          )}
        </div>
        
        <CorrespondenceViewDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          correspondenceId={selectedMail}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default IncomingOutgoingMail;
