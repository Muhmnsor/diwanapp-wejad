
import { Project } from "@/types/project";
import { ProjectContent } from "./ProjectContent";
import { ProjectImage } from "./ProjectImage";
import { ProjectTitle } from "./ProjectTitle";
import { ProjectAdminTabs } from "./admin/ProjectAdminTabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventDashboard } from "@/components/admin/EventDashboard";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
interface ProjectDetailsViewProps {
  project: Project;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  id: string;
}
export const ProjectDetailsView = ({
  project,
  isAdmin,
  onEdit,
  onDelete,
  id
}: ProjectDetailsViewProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // Get the active tab from URL hash if present
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'dashboard') {
      setActiveTab('dashboard');
    }
  }, []);

  console.log('ProjectDetailsView - User is admin:', isAdmin);
  
  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete();
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    // Update URL hash without full page reload
    if (value === 'details') {
      history.pushState(null, '', window.location.pathname);
    } else {
      history.pushState(null, '', `${window.location.pathname}#${value}`);
    }
  };
  
  return <div className="min-h-screen pb-12 bg-gradient-to-b from-gray-50 via-gray-50/80 to-transparent">
      <ProjectImage imageUrl={project.image_url} title={project.title} />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <ProjectTitle title={project.title} isAdmin={isAdmin} onEdit={onEdit} onDelete={() => setShowDeleteDialog(true)} projectId={id} isVisible={project.is_visible} />

          {isAdmin ? <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList dir="rtl" className="w-full justify-start border-b rounded-none bg-white px-[38px]">
                <TabsTrigger value="details">تفاصيل المشروع</TabsTrigger>
                <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-0">
                <ProjectContent project={project} />
              </TabsContent>

              <TabsContent value="dashboard" className="mt-6 px-4 md:px-8 pb-8">
                <EventDashboard eventId={id} />
              </TabsContent>
            </Tabs> : <ProjectContent project={project} />}

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent className="text-right" dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد من حذف هذا المشروع؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم حذف المشروع وجميع البيانات المرتبطة به بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row-reverse gap-2">
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                  حذف المشروع
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>;
};
