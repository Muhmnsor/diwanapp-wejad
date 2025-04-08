// src/pages/IncomingOutgoingMail.tsx
import React, { useState, useEffect } from 'react';
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
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CorrespondenceTable } from "@/components/correspondence/CorrespondenceTable";
import { CorrespondenceViewDialog } from "@/components/correspondence/CorrespondenceViewDialog";
import { AddCorrespondenceDialog } from "@/components/correspondence/AddCorrespondenceDialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCorrespondence, Correspondence } from "@/hooks/useCorrespondence";

const IncomingOutgoingMail = () => {
  const [activeTab, setActiveTab] = useState<string>("incoming");
  const [selectedMail, setSelectedMail] = useState<Correspondence | null>(null);
  const [isMailViewOpen, setIsMailViewOpen] = useState(false);
  const [isAddMailOpen, setIsAddMailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const { toast } = useToast();
  
  // استخدام Hook لجلب البيانات
  const { correspondence, attachments, loading, error, hasAttachments } = useCorrespondence(
    activeTab === "search" ? "all" : activeTab,
    { searchQuery, status: statusFilter, dateFilter }
  );

  const handleViewMail = (mail: Correspondence) => {
    setSelectedMail(mail);
    setIsMailViewOpen(true);
  };
  
  const handleAddMail = () => {
    setIsAddMailOpen(true);
  };
  
  const handleDownload = (mail: Correspondence) => {
    toast({
      title: "جاري التنزيل",
      description: `يتم الآن تنزيل المعاملة رقم ${mail.number}`,
    });
  };
  
  // دالة لحساب عدد المعاملات حسب النوع
  const countByType = (type: string) => {
    return correspondence.filter(item => item.type === type).length;
  };
  
  // تحديث طريقة عرض المعاملات في كل تبويب
  const getTabContent = (tabType: string, label: string) => (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>{label}</CardTitle>
          <Badge>{countByType(tabType)} معاملة</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>حدث خطأ: {error}</p>
          </div>
        ) : correspondence.length > 0 ? (
          <CorrespondenceTable 
            mails={correspondence.map(item => ({
              ...item,
              hasAttachments: hasAttachments(item.id)
            }))}
            onView={handleViewMail}
            onDownload={handleDownload}
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
  );
  
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
            <TabsTrigger value="letter" className="flex gap-2 items-center">
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
              <Button variant="outline">
                <Filter className="h-4 w-4 ml-1" />
                <span>فلترة متقدمة</span>
              </Button>
            </div>
          </div>
          
          <TabsContent value="incoming" className="space-y-4">
            {getTabContent("incoming", "المعاملات الواردة")}
          </TabsContent>
          
          <TabsContent value="outgoing" className="space-y-4">
            {getTabContent("outgoing", "المعاملات الصادرة")}
          </TabsContent>
          
          <TabsContent value="letter" className="space-y-4">
            {getTabContent("letter", "الخطابات")}
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

            {/* عرض نتائج البحث */}
            {!loading && correspondence.length > 0 && (
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>نتائج البحث</CardTitle>
                    <Badge>{correspondence.length} معاملة</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CorrespondenceTable 
                    mails={correspondence.map(item => ({
                      ...item,
                      hasAttachments: hasAttachments(item.id)
                    }))}
                    onView={handleViewMail}
                    onDownload={handleDownload}
                  />
                </CardContent>
              </Card>
            )}
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
      
      <Footer />
    </div>
  );
};

export default IncomingOutgoingMail;
