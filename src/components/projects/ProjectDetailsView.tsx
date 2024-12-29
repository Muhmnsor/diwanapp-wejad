import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProjectContent } from "./ProjectContent";
import { ProjectTitle } from "./ProjectTitle";
import { ProjectImage } from "./ProjectImage";
import { ProjectInfo } from "./ProjectInfo";
import { ProjectDescription } from "./ProjectDescription";
import { Eye, EyeOff, Pencil, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectDetailsViewProps {
  project: any;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  id?: string;
}

export const ProjectDetailsView = ({ 
  project, 
  isAdmin = false, 
  onEdit, 
  onDelete,
  id 
}: ProjectDetailsViewProps) => {
  const [isVisible, setIsVisible] = useState(project.is_visible);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleVisibilityToggle = async () => {
    if (!id) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_visible: !isVisible })
        .eq('id', id);

      if (error) throw error;

      setIsVisible(!isVisible);
      toast.success(isVisible ? 'تم إخفاء المشروع' : 'تم إظهار المشروع');
    } catch (error) {
      console.error('Error updating project visibility:', error);
      toast.error('حدث خطأ أثناء تحديث حالة المشروع');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="bg-white dark:bg-[#1F2937] rounded-2xl shadow-sm overflow-hidden">
        <ProjectImage imageUrl={project.image_url} title={project.title} />
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <ProjectTitle title={project.title} />
            {isAdmin && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleVisibilityToggle}
                  disabled={isUpdating}
                  title={isVisible ? 'إخفاء المشروع' : 'إظهار المشروع'}
                >
                  {isVisible ? (
                    <Eye className="h-4 w-4 text-primary" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onEdit}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onDelete}
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )}
          </div>

          <ProjectInfo
            startDate={project.start_date}
            endDate={project.end_date}
            eventType={project.event_type}
            price={project.price}
            beneficiaryType={project.beneficiary_type}
            certificateType={project.certificate_type}
            maxAttendees={project.max_attendees}
            eventPath={project.event_path}
            eventCategory={project.event_category}
          />

          {project.description && (
            <ProjectDescription description={project.description} />
          )}

          <ProjectContent project={project} />
        </div>
      </div>
    </div>
  );
};