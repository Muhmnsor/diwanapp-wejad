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
  Filter,
  Share,
} from "lucide-react";
import { Archive as ArchiveIcon } from "lucide-react";
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
import { Label } from "@/components/ui/label";
// أضف هذا الاستيراد مع باقي الاستيرادات
import { NotificationsPanel } from "@/components/correspondence/NotificationsPanel";

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
  const { loading, incomingMail, outgoingMail, letters, hasAttachments, downloadAttachment, getAttachments, correspondence } = useCorrespondence();


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
    } else if (activeTab === "search") {
      mails = correspondence || []; // Apply advanced search on all correspondence
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
    if (activeTab === "search" && advancedSearchCriteria) {
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
      {/* أضف مكون NotificationsPanel في الجزء العلوي من الصفحة، مثلاً في عنصر الـ header */}
      <AdminHeader>
        <div className="container mx-auto p-6 flex justify-between items-center">
          <h1 className="text-xl font-bold">نظام الصادر والوارد</h1>
          <div className="flex items-center gap-2">
            <NotificationsPanel />
            {/* يمكنك إضافة أزرار أخرى هنا إذا كانت موجودة في AdminHeader */}
          </div>
        </div>
      </AdminHeader>

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
          <TabsList className="grid grid-cols-6 mb-8">
            <TabsTrigger value="dashboard" className="flex gap-2 items-center">
              <BarChart4 className="h-4 w-4" />
              <span>لوحة المتابعة</span>
            </TabsTrigger>
            <TabsTrigger value="incoming" className="flex gap-2 items-center">
              <Archive className="h-4 w-4" />
              <span>الوارد</span>
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="flex gap-2 items-center">
              <Send className="h-4 w-4" />
              <span>الصادر</span>
            </TabsTrigger>
            <TabsTrigger value="distributed" className="flex gap-2 items-center">
              <Share className="h-4 w-4" />
              <span>المعاملات الموزعة</span>
            </TabsTrigger>
            <TabsTrigger value="archive" className="flex gap-2 items-center">
              <ArchiveIcon className="h-4 w-4" />
              <span>الأرشيف</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex gap-2 items-center">
              <BarChart4 className="h-4 w-4" />
              <span>التقارير</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي المعاملات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{correspondence ? correspondence.length : 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    التوزيع: {incomingMail?.length || 0} وارد, {outgoingMail?.length || 0} صادر, {letters?.length || 0} خطابات
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">المعاملات قيد المعالجة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {correspondence ? correspondence.filter(c => c.status === 'قيد المعالجة').length : 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    تتطلب المتابعة والإنجاز
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">المعاملات المكتملة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {correspondence ? correspondence.filter(c => c.status === 'مكتمل').length : 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    تم إنجازها بنجاح
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">المعاملات المؤرشفة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {correspondence ? correspondence.filter(c => c.status === 'مؤرشف').length : 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    تم حفظها في الأرشيف
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>توزيع أنواع المعاملات</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  {/* ضع هنا رسم بياني دائري */}
                  <div className="w-64 h-64 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-muted-foreground">الرسم البياني</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>معاملات حسب الحالة</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  {/* ضع هنا رسم بياني آخر */}
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                    <span className="text-muted-foreground">الرسم البياني</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>المعاملات الأخيرة</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-muted-foreground">جاري تحميل المعاملات...</p>
                  </div>
                ) : correspondence && correspondence.length > 0 ? (
                  <CorrespondenceTable
                    mails={correspondence.slice(0, 5).map(mail => ({ ...mail, hasAttachments: hasAttachments(mail.id) }))}
                    onView={handleViewMail}
                    onDownload={handleDownload}
                    onDistribute={handleDistribute}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      لا توجد معاملات
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distributed" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>المعاملات الموزعة</CardTitle>
                  <Badge variant="outline">عرض معاملات التوزيع</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-muted-foreground">جاري تحميل المعاملات...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 px-4 text-right">رقم المعاملة</th>
                            <th className="py-2 px-4 text-right">الموضوع</th>
                            <th className="py-2 px-4 text-right">موزع إلى</th>
                            <th className="py-2 px-4 text-right">تاريخ التوزيع</th>
                            <th className="py-2 px-4 text-right">الحالة</th>
                            <th className="py-2 px-4 text-right">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* إضافة بيانات المعاملات الموزعة هنا */}
                          <tr className="border-b">
                            <td className="py-2 px-4">لا توجد بيانات</td>
                            <td className="py-2 px-4"></td>
                            <td className="py-2 px-4"></td>
                            <td className="py-2 px-4"></td>
                            <td className="py-2 px-4"></td>
                            <td className="py-2 px-4"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="archive" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>المعاملات المؤرشفة</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 ml-1" />
                      تصدير الأرشيف
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-muted-foreground">جاري تحميل المعاملات المؤرشفة...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label>البحث بالرقم</Label>
                        <Input placeholder="رقم المعاملة أو رقم الأرشفة" />
                      </div>
                      <div>
                        <Label>تاريخ الأرشفة من</Label>
                        <Input type="date" />
                      </div>
                      <div>
                        <Label>تاريخ الأرشفة إلى</Label>
                        <Input type="date" />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 px-4 text-right">رقم المعاملة</th>
                            <th className="py-2 px-4 text-right">رقم الأرشفة</th>
                            <th className="py-2 px-4 text-right">الموضوع</th>
                            <th className="py-2 px-4 text-right">تاريخ المعاملة</th>
                            <th className="py-2 px-4 text-right">تاريخ الأرشفة</th>
                            <th className="py-2 px-4 text-right">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* عرض المعاملات المؤرشفة هنا */}
                          <tr className="border-b">
                            <td className="py-2 px-4">لا توجد بيانات</td>
                            <td className="py-2 px-4"></td>
                            <td className="py-2 px-4"></td>
                            <td className="py-2 px-4"></td>
                            <td className="py-2 px-4"></td>
                            <td className="py-2 px-4"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>تقارير المعاملات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>نوع التقرير</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع التقرير" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="summary">تقرير ملخص</SelectItem>
                          <SelectItem value="detailed">تقرير تفصيلي</SelectItem>
                          <SelectItem value="status">تقرير حسب الحالة</SelectItem>
                          <SelectItem value="department">تقرير حسب الإدارة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>من تاريخ</Label>
                      <Input type="date" />
                    </div>
                    <div>
                      <Label>إلى تاريخ</Label>
                      <Input type="date" />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 space-x-reverse">
                    <Button>
                      <BarChart4 className="h-4 w-4 ml-1" />
                      إنشاء التقرير
                    </Button>
                  </div>
                </div>
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
                      <Input
                        placeholder="أدخل رقم المعاملة"
                        value={advancedSearchCriteria.number || ""}
                        onChange={(e) => setAdvancedSearchCriteria({ ...advancedSearchCriteria, number: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">الفترة من</label>
                      <Input
                        type="date"
                        value={advancedSearchCriteria.fromDate || ""}
                        onChange={(e) => setAdvancedSearchCriteria({ ...advancedSearchCriteria, fromDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">الفترة إلى</label>
                      <Input
                        type="date"
                        value={advancedSearchCriteria.toDate || ""}
                        onChange={(e) => setAdvancedSearchCriteria({ ...advancedSearchCriteria, toDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">الموضوع</label>
                      <Input
                        placeholder="أدخل موضوع المعاملة"
                        value={advancedSearchCriteria.subject || ""}
                        onChange={(e) => setAdvancedSearchCriteria({ ...advancedSearchCriteria, subject: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">الجهة</label>
                      <Input
                        placeholder="أدخل اسم الجهة"
                        value={advancedSearchCriteria.sender || ""}
                        onChange={(e) => setAdvancedSearchCriteria({ ...advancedSearchCriteria, sender: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">المستلم</label>
                      <Input
                        placeholder="أدخل اسم المستلم"
                        value={advancedSearchCriteria.recipient || ""}
                        onChange={(e) => setAdvancedSearchCriteria({ ...advancedSearchCriteria, recipient: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">النوع</label>
                      <Select
                        value={advancedSearchCriteria.type || ""}
                        onValueChange={(value) => setAdvancedSearchCriteria({ ...advancedSearchCriteria, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع المعاملة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="incoming">وارد</SelectItem>
                          <SelectItem value="outgoing">صادر</SelectItem>
                          <SelectItem value="letter">خطاب</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">الحالة</label>
                      <Select
                        value={advancedSearchCriteria.status || ""}
                        onValueChange={(value) => setAdvancedSearchCriteria({ ...advancedSearchCriteria, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                        <SelectContent>
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
                    <div>
                      <label className="text-sm font-medium mb-1 block">الأولوية</label>
                      <Select
                        value={advancedSearchCriteria.priority || ""}
                        onValueChange={(value) => setAdvancedSearchCriteria({ ...advancedSearchCriteria, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الأولوية" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="عادية">عادية</SelectItem>
                          <SelectItem value="عاجلة">عاجلة</SelectItem>
                          <SelectItem value="هامة">هامة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">السرية</label>
                      <Select
                        value={advancedSearchCriteria.is_confidential !== undefined ? advancedSearchCriteria.is_confidential.toString() : ""}
                        onValueChange={(value) => setAdvancedSearchCriteria({ ...advancedSearchCriteria, is_confidential: value === "true" })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر السرية" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">سري</SelectItem>
                          <SelectItem value="false">غير سري</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">المرفقات</label>
                      <Select
                        value={advancedSearchCriteria.hasAttachments !== undefined ? advancedSearchCriteria.hasAttachments.toString() : ""}
                        onValueChange={(value) => setAdvancedSearchCriteria({ ...advancedSearchCriteria, hasAttachments: value === "true" })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر وجود مرفقات" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">يوجد مرفقات</SelectItem>
                          <SelectItem value="false">لا يوجد مرفقات</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => handleAdvancedSearch(advancedSearchCriteria)}>
                      <Search className="h-4 w-4 ml-1" />
                      بحث
                    </Button>
                  </div>
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
