import React, { useState } from 'react';
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Archive, 
  Send, 
  FileText, 
  Search,
  BarChart4,
  Plus,
  Download,
  Eye,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CorrespondenceTable } from "@/components/correspondence/CorrespondenceTable";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCorrespondence, Correspondence } from "@/hooks/useCorrespondence";
import { CorrespondenceViewDialog } from "@/components/correspondence/CorrespondenceViewDialog";
import { AddCorrespondenceDialog } from "@/components/correspondence/AddCorrespondenceDialog";
import { DistributeCorrespondenceDialog } from "@/components/correspondence/DistributeCorrespondenceDialog";
import { AdvancedSearchDialog, SearchCriteria } from "@/components/correspondence/AdvancedSearchDialog";


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
}

const IncomingOutgoingMail = () => {
  const [activeTab, setActiveTab] = useState<string>("incoming");
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);
  const [isMailViewOpen, setIsMailViewOpen] = useState(false);
  const [isAddMailOpen, setIsAddMailOpen] = useState(false);
  const [isDistributeDialogOpen, setIsDistributeDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [advancedSearchCriteria, setAdvancedSearchCriteria] = useState<SearchCriteria>({});
  const { toast } = useToast();
  const { loading, incomingMail, outgoingMail, letters, hasAttachments, downloadAttachment, getAttachments } = useCorrespondence();

  
  const handleViewMail = (mail: Mail) => {
    setSelectedMail(mail);
    setIsMailViewOpen(true);
  };
  
  const handleAddMail = () => {
    setIsAddMailOpen(true);
  };
  
  const handleDownload = async (mail: Mail) => {
    // استخدام وظيفة التنزيل المناسبة
    if (mail.hasAttachments) {
      // الحصول على المرفقات وتنزيل الأول منها
      const attachments = await getAttachments(mail.id);
      if (attachments && attachments.length > 0) {
        downloadAttachment(attachments[0].file_path, attachments[0].file_name);
      } else {
        toast({
          variant: "destructive",
          title: "لا توجد مرفقات",
          description: "لم يتم العثور على مرفقات لهذه المعاملة"
        });
      }
    } else {
      // عرض رسالة عدم وجود مرفقات
      toast({
        variant: "destructive",
        title: "لا توجد مرفقات",
        description: "هذه المعاملة لا تحتوي على مرفقات للتنزيل"
      });
    }
  };

  const handleDistribute = (mail: Mail) => {
    setSelectedMail(mail);
    setIsDistributeDialogOpen(true);
  };

  const handleAdvancedSearch = (criteria: SearchCriteria) => {
    setAdvancedSearchCriteria(criteria);
    // تعيين علامة التبويب على البحث
    setActiveTab('search');
    
    // يمكن إضافة رسالة لإظهار معايير البحث المستخدمة
    toast({
      title: "تم تطبيق البحث المتقدم",
      description: "تم تطبيق معايير البحث المحددة"
    });
  };

  const getFilteredMails = () => {
    let mails: Correspondence[] = [];
    
    if (activeTab === "incoming") {
      mails = incomingMail || [];
    } else if (activeTab === "outgoing") {
      mails = outgoingMail || [];
    } else if (activeTab === "letters") {
      mails = letters || [];
    }
    
    // البحث العادي
    if (searchQuery) {
      mails = mails.filter(mail => 
        mail.subject?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        mail.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mail.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mail.number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // تطبيق معايير البحث المتقدم
    if (advancedSearchCriteria) {
      // البحث بالرقم
      if (advancedSearchCriteria.number) {
        mails = mails.filter(mail => 
          mail.number?.toLowerCase().includes(advancedSearchCriteria.number!.toLowerCase())
        );
      }
      
      // البحث بالموضوع
      if (advancedSearchCriteria.subject) {
        mails = mails.filter(mail => 
          mail.subject?.toLowerCase().includes(advancedSearchCriteria.subject!.toLowerCase())
        );
      }
      
      // البحث بالمرسل
      if (advancedSearchCriteria.sender) {
        mails = mails.filter(mail => 
          mail.sender?.toLowerCase().includes(advancedSearchCriteria.sender!.toLowerCase())
        );
      }
      
      // البحث بالمستلم
      if (advancedSearchCriteria.recipient) {
        mails = mails.filter(mail => 
          mail.recipient?.toLowerCase().includes(advancedSearchCriteria.recipient!.toLowerCase())
        );
      }
      
      // البحث بالتاريخ (من)
      if (advancedSearchCriteria.fromDate) {
        const fromDate = new Date(advancedSearchCriteria.fromDate);
        mails = mails.filter(mail => {
          const mailDate = new Date(mail.date);
          return mailDate >= fromDate;
        });
      }
      
      // البحث بالتاريخ (إلى)
      if (advancedSearchCriteria.toDate) {
        const toDate = new Date(advancedSearchCriteria.toDate);
        mails = mails.filter(mail => {
          const mailDate = new Date(mail.date);
          return mailDate <= toDate;
        });
      }
      
      // البحث بالنوع
      if (advancedSearchCriteria.type) {
        mails = mails.filter(mail => mail.type === advancedSearchCriteria.type);
      }
      
      // البحث بالحالة
      if (advancedSearchCriteria.status) {
        mails = mails.filter(mail => mail.status === advancedSearchCriteria.status);
      }
      
      // البحث بالأولوية
      if (advancedSearchCriteria.priority) {
        mails = mails.filter(mail => mail.priority === advancedSearchCriteria.priority);
      }
      
      // البحث بالسرية
      if (advancedSearchCriteria.is_confidential !== undefined) {
        mails = mails.filter(mail => mail.is_confidential === advancedSearchCriteria.is_confidential);
      }
      
      // البحث بالمرفقات
      if (advancedSearchCriteria.hasAttachments) {
        mails = mails.filter(mail => hasAttachments(mail.id));
      }
    }
    
    // البحث حسب الحالة
    if (statusFilter !== "all") {
      mails = mails.filter(mail => mail.status === statusFilter);
    }
    
    // البحث حسب التاريخ
    if (dateFilter === "today") {
      const today = new Date().toISOString().split('T')[0];
      mails = mails.filter(mail => mail.date === today);
    } else if (dateFilter === "week") {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      
      mails = mails.filter(mail => {
        const mailDate = new Date(mail.date);
        return mailDate >= weekStart && mailDate <= today;
      });
    } else if (dateFilter === "month") {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      
      mails = mails.filter(mail => {
        const mailDate = new Date(mail.date);
        return mailDate >= monthStart && mailDate <= today;
      });
    }
    
    // تحويل إلى نوع Mail مع خاصية hasAttachments
    return mails.map(mail => ({
      ...mail,
      hasAttachments: hasAttachments(mail.id)
    }));
  };

  // استدعاء الدالة مرة واحدة لتخزين القيمة
  const filteredMails = getFilteredMails();
  
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto p-6 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">نظام الصادر والوارد</h1>
          
          <div className="flex gap-2">
            <Button
              onClick={handleAddMail}
              className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة معاملة جديدة</span>
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="incoming" className="flex gap-2 items-center">
              <Archive className="h-4 w-4" />
              <span>الوارد</span>
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="flex gap-2 items-center">
              <Send className="h-4 w-4" />
              <span>الصادر</span>
            </TabsTrigger>
            <TabsTrigger value="letters" className="flex gap-2 items-center">
              <FileText className="h-4 w-4" />
              <span>الخطابات</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex gap-2 items-center">
              <Search className="h-4 w-4" />
              <span>البحث والاستعلام</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex gap-2 items-center">
              <BarChart4 className="h-4 w-4" />
              <span>التقارير</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="البحث في المعاملات..." 
                className="pr-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="w-40">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="الحالة" />
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
              </div>
              <div className="w-40">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="التاريخ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الأوقات</SelectItem>
                    <SelectItem value="today">اليوم</SelectItem>
                    <SelectItem value="week">هذا الأسبوع</SelectItem>
                    <SelectItem value="month">هذا الشهر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={() => setIsAdvancedSearchOpen(true)}>
                <Filter className="h-4 w-4 ml-1" />
                <span>بحث متقدم</span>
              </Button>
            </div>
          </div>
          
          <TabsContent value="incoming" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>المعاملات الواردة</CardTitle>
                  <Badge>{incomingMail ? incomingMail.length : 0} معاملة</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-muted-foreground">جاري تحميل المعاملات...</p>
                  </div>
                ) : filteredMails && filteredMails.length > 0 ? (
                  <CorrespondenceTable 
                    mails={filteredMails}
                    onView={handleViewMail}
                    onDownload={handleDownload}
                    onDistribute={handleDistribute}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      لا توجد معاملات تطابق معايير البحث
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="outgoing" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>المعاملات الصادرة</CardTitle>
                  <Badge>{outgoingMail ? outgoingMail.length : 0} معاملة</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-muted-foreground">جاري تحميل المعاملات...</p>
                  </div>
                ) : filteredMails && filteredMails.length > 0 ? (
                  <CorrespondenceTable 
                    mails={filteredMails}
                    onView={handleViewMail}
                    onDownload={handleDownload}
                    onDistribute={handleDistribute}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      لا توجد معاملات تطابق معايير البحث
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="letters" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>الخطابات</CardTitle>
                  <Badge>{letters ? letters.length : 0} خطاب</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-muted-foreground">جاري تحميل الخطابات...</p>
                  </div>
                ) : filteredMails && filteredMails.length > 0 ? (
                  <CorrespondenceTable 
                    mails={filteredMails}
                    onView={handleViewMail}
                    onDownload={handleDownload}
                    onDistribute={handleDistribute}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      لا توجد خطابات تطابق معايير البحث
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>البحث والاستعلام</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">رقم المعاملة</label>
                      <Input placeholder="أدخل رقم المعاملة" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">الفترة من</label>
                      <Input type="date" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">الفترة إلى</label>
                      <Input type="date" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">الموضوع</label>
                      <Input placeholder="أدخل موضوع المعاملة" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">الجهة</label>
                      <Input placeholder="أدخل اسم الجهة" />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button>
                      <Search className="h-4 w-4 ml-1" />
                      بحث
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>التقارير</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <BarChart4 className="h-8 w-8 text-primary" />
                    <div className="text-center">
                      <h3 className="font-medium">تقرير المعاملات الواردة</h3>
                      <p className="text-sm text-muted-foreground">إحصائيات وبيانات عن المعاملات الواردة</p>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <BarChart4 className="h-8 w-8 text-primary" />
                    <div className="text-center">
                      <h3 className="font-medium">تقرير المعاملات الصادرة</h3>
                      <p className="text-sm text-muted-foreground">إحصائيات وبيانات عن المعاملات الصادرة</p>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <BarChart4 className="h-8 w-8 text-primary" />
                    <div className="text-center">
                      <h3 className="font-medium">تقرير الخطابات</h3>
                      <p className="text-sm text-muted-foreground">إحصائيات وبيانات عن الخطابات</p>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <BarChart4 className="h-8 w-8 text-primary" />
                    <div className="text-center">
                      <h3 className="font-medium">تقرير أداء المعاملات</h3>
                      <p className="text-sm text-muted-foreground">تقارير عن وقت معالجة المعاملات</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <CorrespondenceViewDialog 
        isOpen={isMailViewOpen}
        onClose={() => setIsMailViewOpen(false)}
        mail={selectedMail}
      />

      <AddCorrespondenceDialog 
        isOpen={isAddMailOpen}
        onClose={() => setIsAddMailOpen(false)}
        type={activeTab === "incoming" ? "incoming" : activeTab === "outgoing" ? "outgoing" : "letter"}
      />
      
      <AdvancedSearchDialog
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
        onSearch={handleAdvancedSearch}
      />
      
      {/* نافذة حوار توزيع المعاملة */}
      {selectedMail && isDistributeDialogOpen && (
        <DistributeCorrespondenceDialog
          isOpen={isDistributeDialogOpen}
          onClose={() => setIsDistributeDialogOpen(false)}
          correspondenceId={selectedMail.id}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default IncomingOutgoingMail;
