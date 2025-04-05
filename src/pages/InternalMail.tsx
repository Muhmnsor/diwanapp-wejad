
import React, { useEffect, useState } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { InternalMailApp } from "@/components/mail/InternalMailApp";
import { ComposeDialog } from "@/components/mail/ComposeDialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LabelsManager } from "@/components/mail/LabelsManager";

const InternalMail = () => {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'mail' | 'labels'>('mail');
  const [composeInitialData, setComposeInitialData] = useState<any>(undefined);
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // التحقق من وجود مستخدم
    const checkAuthentication = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        setIsAuthenticated(!!data.user);
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();

    // الاستماع إلى حدث إنشاء رسالة جديدة
    const handler = (e: any) => {
      setComposeInitialData(e.detail || undefined);
      setIsComposeOpen(true);
    };
    window.addEventListener('compose-new-mail', handler);
    return () => window.removeEventListener('compose-new-mail', handler);
  }, []);

  const handleComposeNew = () => {
    setComposeInitialData(undefined);
    setIsComposeOpen(true);
  };

  // إذا لم يتم المصادقة على المستخدم، عرض رسالة مناسبة
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">جاري التحميل...</h2>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md w-full text-center">
            <svg className="h-16 w-16 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-2xl font-bold mb-3">يجب تسجيل الدخول</h2>
            <p className="text-muted-foreground mb-6">يرجى تسجيل الدخول للوصول إلى نظام البريد الداخلي</p>
            <button 
              className="btn bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
              onClick={() => {/* إضافة منطق تسجيل الدخول */}}
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow" dir="rtl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">البريد الداخلي</h1>
          <div className="flex gap-2">
            <Button onClick={handleComposeNew}>
              <Plus className="h-4 w-4 ml-2" />
              إنشاء رسالة جديدة
            </Button>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'mail' | 'labels')}>
              <TabsList>
                <TabsTrigger value="mail">البريد</TabsTrigger>
                <TabsTrigger value="labels">التصنيفات</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {activeTab === 'mail' ? (
          <div className="bg-white rounded-lg overflow-hidden shadow-sm border h-[calc(100vh-250px)]">
            <InternalMailApp />
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden shadow-sm border p-6 h-[calc(100vh-250px)]">
            <LabelsManager />
          </div>
        )}
      </div>
      
      <ComposeDialog
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        initialData={composeInitialData}
      />
      
      <Footer />
    </div>
  );
};

export default InternalMail;
