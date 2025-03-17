
import { useState } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeveloperToolbar } from "@/components/developer/DeveloperToolbar";
import { Calendar, CalendarClock, ClipboardList, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MeetingsNavHeader } from "@/components/meetings/MeetingsNavHeader";

const AdminMeetings = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      <MeetingsNavHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">إدارة الاجتماعات</h1>
          <Button onClick={() => navigate("/admin/meetings/list")}>
            عرض كل الاجتماعات
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-primary" />
                <span>الاجتماعات القادمة</span>
              </CardTitle>
              <CardDescription>الاجتماعات المقررة في الأيام القادمة</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-4">
                لا توجد اجتماعات قادمة حالياً
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/admin/meetings/list")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                عرض جدول الاجتماعات
              </Button>
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
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/admin/meetings/participants")}
              >
                <Users className="h-4 w-4 mr-2" />
                إدارة المشاركين
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                <span>محاضر الاجتماعات</span>
              </CardTitle>
              <CardDescription>إدارة محاضر وقرارات الاجتماعات</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-4">
                لم يتم إنشاء أي محاضر اجتماعات بعد
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/admin/meetings/minutes")}
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                إدارة المحاضر
              </Button>
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
