
import { useState } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeveloperToolbar } from "@/components/developer/DeveloperToolbar";
import { Calendar, Info, Users } from "lucide-react";

const AdminMeetings = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">إدارة الاجتماعات</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>الاجتماعات القادمة</span>
              </CardTitle>
              <CardDescription>الاجتماعات المقررة في الأيام القادمة</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-4">
                لا توجد اجتماعات قادمة حالياً
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>المشاركون</span>
              </CardTitle>
              <CardDescription>إحصائيات المشاركة في الاجتماعات</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-4">
                لم يتم تسجيل أي مشاركين حتى الآن
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <span>ملخص</span>
              </CardTitle>
              <CardDescription>ملخص نشاط الاجتماعات</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-4">
                لم يتم عقد أي اجتماعات حتى الآن
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
      <DeveloperToolbar />
    </div>
  );
};

export default AdminMeetings;
