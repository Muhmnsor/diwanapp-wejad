
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
  BarChart4
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const IncomingOutgoingMail = () => {
  const [activeTab, setActiveTab] = useState<string>("incoming");
  const { toast } = useToast();

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto p-6 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">نظام الصادر والوارد</h1>
          
          <div className="flex gap-2">
            <button
              onClick={() => toast({
                title: "قريباً",
                description: "هذه الميزة قيد التطوير وستكون متاحة قريباً",
              })}
              className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
            >
              <FileText className="h-4 w-4" />
              <span>إضافة معاملة جديدة</span>
            </button>
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
          
          <TabsContent value="incoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>المعاملات الواردة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    لم تتم إضافة أي معاملات واردة بعد. ستظهر جميع المعاملات الواردة هنا.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="outgoing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>المعاملات الصادرة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    لم تتم إضافة أي معاملات صادرة بعد. ستظهر جميع المعاملات الصادرة هنا.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="letters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الخطابات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    لم تتم إضافة أي خطابات بعد. ستظهر جميع الخطابات والمراسلات هنا.
                  </p>
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
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    يمكنك البحث عن المعاملات والخطابات حسب التاريخ أو الرقم أو الموضوع.
                  </p>
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
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    يمكنك استعراض تقارير عن المعاملات الواردة والصادرة حسب الفترة الزمنية أو الجهة.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default IncomingOutgoingMail;
