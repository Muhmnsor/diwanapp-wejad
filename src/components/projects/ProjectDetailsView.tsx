import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProjectBadges } from "./badges/ProjectBadges";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { ProjectDeleteDialog } from "./ProjectDeleteDialog";
import { handleProjectDeletion } from "./ProjectDeletionHandler";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProjectDetailsViewProps {
  project: any;
  isAdmin: boolean;
  id: string;
  error?: string | null;
  isLoading?: boolean;
}

export const ProjectDetailsView = ({ 
  project, 
  isAdmin, 
  id, 
  error, 
  isLoading 
}: ProjectDetailsViewProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d MMMM yyyy", { locale: ar });
  };

  const handleDelete = async () => {
    try {
      await handleProjectDeletion({
        projectId: id,
        onSuccess: () => navigate("/")
      });
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            لم يتم العثور على المشروع
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 space-y-8">
      <Card className="overflow-hidden">
        <div className="relative h-64 md:h-96">
          <img
            src={project.image_url || "/placeholder.svg"}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-right">{project.title}</h1>
            <p className="text-gray-600 text-right whitespace-pre-wrap">
              {project.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-end">
            <ProjectBadges
              eventType={project.event_type}
              price={project.price}
              beneficiaryType={project.beneficiary_type}
              certificateType={project.certificate_type}
              eventHours={project.event_hours}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-right">
              <h3 className="font-semibold">تاريخ البداية</h3>
              <p>{formatDate(project.start_date)}</p>
            </div>
            <div className="space-y-2 text-right">
              <h3 className="font-semibold">تاريخ النهاية</h3>
              <p>{formatDate(project.end_date)}</p>
            </div>
            {project.registration_start_date && (
              <div className="space-y-2 text-right">
                <h3 className="font-semibold">بداية التسجيل</h3>
                <p>{formatDate(project.registration_start_date)}</p>
              </div>
            )}
            {project.registration_end_date && (
              <div className="space-y-2 text-right">
                <h3 className="font-semibold">نهاية التسجيل</h3>
                <p>{formatDate(project.registration_end_date)}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline">التسجيل في المشروع</Button>
            {isAdmin && (
              <>
                <Button variant="outline">تعديل</Button>
                <Button 
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  حذف
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      <ProjectDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
      />
    </div>
  );
};