import { Button } from "@/components/ui/button";
import { ShareButton } from "../events/ShareButton";
import { Edit2, Eye, EyeOff, Trash2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectTitleProps {
  title: string;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  projectId: string;
  isVisible?: boolean;
}

export const ProjectTitle = ({
  title,
  isAdmin,
  onEdit,
  onDelete,
  projectId,
  isVisible = true,
}: ProjectTitleProps) => {
  const [visibility, setVisibility] = useState(isVisible);

  const toggleVisibility = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_visible: !visibility })
        .eq('id', projectId);

      if (error) throw error;

      setVisibility(!visibility);
      toast.success(visibility ? 'تم إخفاء المشروع' : 'تم إظهار المشروع');
    } catch (error) {
      console.error('Error toggling project visibility:', error);
      toast.error('حدث خطأ أثناء تحديث حالة المشروع');
    }
  };

  console.log('ProjectTitle - isAdmin:', isAdmin);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 md:px-8 py-6 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 gap-4" dir="rtl">
      <h1 className="text-2xl md:text-[32px] leading-tight font-semibold text-[#1A1F2C] order-1">{title}</h1>
      <div className="flex gap-2 order-2 flex-wrap">
        {isAdmin && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleVisibility}
              className="w-8 h-8"
              title={visibility ? 'إخفاء المشروع' : 'إظهار المشروع'}
            >
              {visibility ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={onEdit}
              className="w-8 h-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={onDelete}
              className="w-8 h-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        <ShareButton url={window.location.href} title={title} />
      </div>
    </div>
  );
};