
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CorrespondenceTable } from '@/components/correspondence/CorrespondenceTable';
import { CorrespondenceViewDialog } from '@/components/correspondence/CorrespondenceViewDialog';
import { AddCorrespondenceDialog } from '@/components/correspondence/AddCorrespondenceDialog';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Mail {
  id: string;
  number: string;
  subject: string;
  sender: string;
  recipient: string;
  date: string;
  status: string;
  type: string;
  hasAttachments: boolean;
  content?: string;
}

const IncomingOutgoingMail: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'letter'>('incoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  
  const [incomingMails, setIncomingMails] = useState<Mail[]>([]);
  const [outgoingMails, setOutgoingMails] = useState<Mail[]>([]);
  const [letters, setLetters] = useState<Mail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const { toast } = useToast();

  // Fetch correspondence data
  useEffect(() => {
    const fetchCorrespondence = async () => {
      setIsLoading(true);
      try {
        // Fetch correspondence data
        const { data, error } = await supabase
          .from('correspondence')
          .select('*, correspondence_attachments(id)');
        
        if (error) throw error;
        
        const formattedData = data.map((item: any) => ({
          id: item.id,
          number: item.number || `${item.type.substring(0, 3)}-${item.id.substring(0, 6)}`,
          subject: item.subject,
          sender: item.sender,
          recipient: item.recipient,
          date: new Date(item.date).toLocaleDateString('ar-SA'),
          status: item.status,
          type: item.type,
          content: item.content,
          hasAttachments: item.correspondence_attachments.length > 0
        }));
        
        // Filter by type
        setIncomingMails(formattedData.filter((mail: Mail) => mail.type === 'incoming'));
        setOutgoingMails(formattedData.filter((mail: Mail) => mail.type === 'outgoing'));
        setLetters(formattedData.filter((mail: Mail) => mail.type === 'letter'));
      } catch (error) {
        console.error('Error fetching correspondence:', error);
        toast({
          variant: "destructive",
          title: "خطأ في جلب البيانات",
          description: "حدث خطأ أثناء جلب بيانات المراسلات، يرجى المحاولة مرة أخرى.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCorrespondence();
  }, [toast]);

  // Handle view mail
  const handleViewMail = (mail: Mail) => {
    setSelectedMail(mail);
    setIsViewDialogOpen(true);
  };

  // Handle download mail
  const handleDownloadMail = (mail: Mail) => {
    toast({
      title: "جاري تحميل المعاملة",
      description: `جاري تحميل المعاملة رقم ${mail.number}`,
    });
    // Actual download logic would be implemented here
  };

  // Filter functions
  const filterByStatus = (mails: Mail[], status: string) => {
    if (status === 'all') return mails;
    return mails.filter(mail => mail.status === status);
  };

  const filterByDate = (mails: Mail[], dateRange: string) => {
    if (dateRange === 'all') return mails;
    
    const now = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        return mails;
    }
    
    return mails.filter(mail => new Date(mail.date) >= startDate);
  };

  const filterBySearch = (mails: Mail[], term: string) => {
    if (!term) return mails;
    const searchLower = term.toLowerCase();
    return mails.filter(mail => 
      mail.subject.toLowerCase().includes(searchLower) ||
      mail.sender.toLowerCase().includes(searchLower) ||
      mail.recipient.toLowerCase().includes(searchLower) ||
      mail.number.toLowerCase().includes(searchLower)
    );
  };

  // Apply all filters
  const getFilteredMails = (mails: Mail[]) => {
    return filterBySearch(filterByDate(filterByStatus(mails, statusFilter), dateFilter), searchTerm);
  };

  // Get filtered mail lists
  const filteredIncomingMails = getFilteredMails(incomingMails);
  const filteredOutgoingMails = getFilteredMails(outgoingMails);
  const filteredLetters = getFilteredMails(letters);

  return (
    <div className="container mx-auto py-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة المراسلات</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة معاملة جديدة
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            className="pl-4 pr-10" 
            placeholder="البحث في المراسلات..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="ml-2 h-4 w-4" />
              <SelectValue placeholder="حالة المعاملة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="قيد المعالجة">قيد المعالجة</SelectItem>
              <SelectItem value="مكتمل">مكتمل</SelectItem>
              <SelectItem value="معلق">معلق</SelectItem>
              <SelectItem value="مرسل">مرسل</SelectItem>
              <SelectItem value="قيد الإعداد">قيد الإعداد</SelectItem>
              <SelectItem value="معتمد">معتمد</SelectItem>
              <SelectItem value="مسودة">مسودة</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="ml-2 h-4 w-4" />
              <SelectValue placeholder="التاريخ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفترات</SelectItem>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="week">آخر أسبوع</SelectItem>
              <SelectItem value="month">آخر شهر</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="ml-2 h-4 w-4" />
            تصدير
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'incoming' | 'outgoing' | 'letter')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="incoming">الوارد</TabsTrigger>
          <TabsTrigger value="outgoing">الصادر</TabsTrigger>
          <TabsTrigger value="letter">الخطابات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="incoming">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <CorrespondenceTable 
              mails={filteredIncomingMails} 
              onView={handleViewMail}
              onDownload={handleDownloadMail}
            />
          )}
        </TabsContent>
        
        <TabsContent value="outgoing">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <CorrespondenceTable 
              mails={filteredOutgoingMails} 
              onView={handleViewMail}
              onDownload={handleDownloadMail}
            />
          )}
        </TabsContent>
        
        <TabsContent value="letter">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <CorrespondenceTable 
              mails={filteredLetters} 
              onView={handleViewMail}
              onDownload={handleDownloadMail}
            />
          )}
        </TabsContent>
      </Tabs>
      
      {selectedMail && (
        <CorrespondenceViewDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          mail={selectedMail}
        />
      )}
      
      <AddCorrespondenceDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        type={activeTab}
      />
    </div>
  );
};

export default IncomingOutgoingMail;
