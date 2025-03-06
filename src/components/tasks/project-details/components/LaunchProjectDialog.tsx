
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
import { useLaunchProject } from "../hooks/useLaunchProject";
import { Task } from "../types/task";
import { Loader2 } from "lucide-react";

interface LaunchProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  tasks: Task[];
  onLaunchSuccess: () => void;
}

export const LaunchProjectDialog = ({
  isOpen,
  onOpenChange,
  projectId,
  projectName,
  tasks,
  onLaunchSuccess
}: LaunchProjectDialogProps) => {
  const { launchProject, isLaunching } = useLaunchProject();

  // Group tasks by assigned user for the summary
  const tasksByUser: Record<string, { name: string; count: number }> = {};
  
  tasks.forEach(task => {
    if (task.assigned_to) {
      if (!tasksByUser[task.assigned_to]) {
        tasksByUser[task.assigned_to] = { 
          name: task.assigned_user_name || task.assigned_to, 
          count: 0 
        };
      }
      tasksByUser[task.assigned_to].count++;
    }
  });

  const handleLaunch = async () => {
    const success = await launchProject(projectId, projectName);
    if (success) {
      onLaunchSuccess();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!isLaunching) {
        onOpenChange(open);
      }
    }}>
      <AlertDialogContent className="font-kufi" dir="rtl">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle className="text-right">
            إطلاق المشروع: {projectName}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            عند إطلاق المشروع، سيتم تفعيل المهام وإشعار أعضاء الفريق المعينين. هل أنت متأكد؟
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 bg-muted p-4 rounded-md">
          <h4 className="font-medium mb-2">ملخص المهام:</h4>
          <ul className="space-y-2">
            <li>إجمالي المهام: {tasks.length}</li>
            {Object.entries(tasksByUser).map(([userId, info]) => (
              <li key={userId}>
                {info.name}: {info.count} مهمة
              </li>
            ))}
          </ul>
        </div>

        <AlertDialogFooter className="flex flex-row-reverse sm:space-x-reverse space-x-reverse gap-2">
          <AlertDialogCancel disabled={isLaunching}>إلغاء</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleLaunch}
            disabled={isLaunching}
            className="bg-primary hover:bg-primary/90"
          >
            {isLaunching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري الإطلاق...
              </>
            ) : (
              'إطلاق المشروع'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
