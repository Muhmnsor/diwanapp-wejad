
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LaunchProjectButtonProps {
  projectId: string;
  onProjectLaunched: () => void;
}

export const LaunchProjectButton = ({ projectId, onProjectLaunched }: LaunchProjectButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunchProject = async () => {
    setIsLaunching(true);
    try {
      // Update project_tasks table, set is_draft to false and launch_date to now()
      const { error } = await supabase
        .from('project_tasks')
        .update({ 
          is_draft: false,
          // launch_date will be set automatically by DB trigger update_launch_date
        })
        .eq('id', projectId);

      if (error) {
        throw error;
      }

      toast.success("تم إطلاق المشروع بنجاح");
      setIsDialogOpen(false);
      onProjectLaunched();
    } catch (error) {
      console.error("Error launching project:", error);
      toast.error("حدث خطأ أثناء إطلاق المشروع");
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <>
      <Button 
        className="gap-2" 
        onClick={() => setIsDialogOpen(true)}
      >
        <Rocket className="h-4 w-4" />
        إطلاق المشروع
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="text-right" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من إطلاق المشروع؟</AlertDialogTitle>
            <AlertDialogDescription>
              بعد إطلاق المشروع، سيتم تفعيل جميع المهام المرتبطة به وإرسال الإشعارات للأشخاص المكلفين بالمهام.
              لن تتمكن من العودة إلى وضع المسودة بعد الإطلاق.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLaunchProject} 
              disabled={isLaunching}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isLaunching ? "جاري الإطلاق..." : "إطلاق المشروع"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
