
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Application } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApplicationsList } from "./ApplicationsList";
import { ApplicationDialog } from "./ApplicationDialog";
import { Plus, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const ApplicationsManagement = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [applicationToEdit, setApplicationToEdit] = useState<Application | null>(null);
  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null);

  const { data: applications = [], isLoading, error, refetch } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('خطأ في جلب التطبيقات:', error);
        throw error;
      }
      
      return data as Application[];
    }
  });

  const handleAddApplication = () => {
    setApplicationToEdit(null);
    setIsAddDialogOpen(true);
  };

  const handleEditApplication = (application: Application) => {
    setApplicationToEdit(application);
    setIsAddDialogOpen(true);
  };

  const handleDeleteApplication = (application: Application) => {
    setApplicationToDelete(application);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setApplicationToEdit(null);
  };

  const handleApplicationSaved = () => {
    refetch();
    handleDialogClose();
    toast.success(applicationToEdit ? "تم تحديث التطبيق بنجاح" : "تم إضافة التطبيق بنجاح");
  };

  const confirmDeleteApplication = async () => {
    if (!applicationToDelete) return;
    
    try {
      // التحقق من وجود صلاحيات مرتبطة بالتطبيق
      const { data: permissions, error: permError } = await supabase
        .from('permissions')
        .select('id')
        .eq('application_id', applicationToDelete.id);
        
      if (permError) throw permError;
      
      if (permissions && permissions.length > 0) {
        toast.error(`لا يمكن حذف التطبيق لأنه مرتبط بـ ${permissions.length} صلاحيات`);
        setApplicationToDelete(null);
        return;
      }
      
      // حذف التطبيق
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationToDelete.id);
        
      if (error) throw error;
      
      refetch();
      toast.success("تم حذف التطبيق بنجاح");
    } catch (error) {
      console.error('خطأ في حذف التطبيق:', error);
      toast.error("حدث خطأ أثناء حذف التطبيق");
    } finally {
      setApplicationToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          حدث خطأ أثناء تحميل التطبيقات. يرجى المحاولة مرة أخرى.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="shadow-sm" dir="rtl">
      <CardHeader className="pb-2">
        <div className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-xl">إدارة التطبيقات</CardTitle>
            <CardDescription>
              إضافة وتعديل التطبيقات المتاحة في النظام
            </CardDescription>
          </div>
          <Button onClick={handleAddApplication} className="gap-1">
            <Plus className="h-4 w-4" /> إضافة تطبيق
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ApplicationsList 
          applications={applications}
          onEdit={handleEditApplication}
          onDelete={handleDeleteApplication}
        />
      </CardContent>

      <ApplicationDialog 
        isOpen={isAddDialogOpen}
        application={applicationToEdit}
        onClose={handleDialogClose}
        onSave={handleApplicationSaved}
      />
      
      {applicationToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">تأكيد حذف التطبيق</h3>
            <p className="mb-6">
              هل أنت متأكد من حذف التطبيق "{applicationToDelete.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setApplicationToDelete(null)}>
                إلغاء
              </Button>
              <Button variant="destructive" onClick={confirmDeleteApplication}>
                حذف
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
