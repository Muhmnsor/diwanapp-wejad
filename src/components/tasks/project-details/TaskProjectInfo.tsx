
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays, Users, Clock, Edit, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { useState } from "react";
import { ProjectEditDialog } from "./dialogs/ProjectEditDialog";

interface TaskProjectInfoProps {
  project: any;
  onProjectUpdated: () => void;
  completedTasksCount?: number;
  totalTasksCount?: number;
  completionPercentage?: number;
}

export const TaskProjectInfo = ({ 
  project, 
  onProjectUpdated,
  completedTasksCount = 0,
  totalTasksCount = 0,
  completionPercentage = 0
}: TaskProjectInfoProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "غير محدد";
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: arSA });
    } catch (e) {
      return "تاريخ غير صالح";
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center text-sm font-medium text-green-600">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            مكتمل
          </div>
        );
      case 'delayed':
        return (
          <div className="flex items-center text-sm font-medium text-red-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            متأخر
          </div>
        );
      case 'in_progress':
        return (
          <div className="flex items-center text-sm font-medium text-blue-600">
            <Clock className="w-4 h-4 mr-1" />
            قيد التنفيذ
          </div>
        );
      default:
        return (
          <div className="flex items-center text-sm font-medium text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            قيد الإعداد
          </div>
        );
    }
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4" />
            تعديل
          </Button>
          <div className="text-right">
            <h2 className="text-2xl font-bold mb-1">{project.title}</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              {getStatusBadge(project.status)}
              <span className="text-sm mx-1">•</span>
              <div className="text-sm">{project?.priority || "متوسطة"} الأولوية</div>
            </div>
          </div>
        </div>
        
        {project.description && (
          <div className="mb-6 text-right">
            <p className="text-muted-foreground whitespace-pre-line">
              {project.description}
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">مدير المشروع</h4>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground mr-2" />
              <span>
                {project.manager_name || "غير محدد"}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">تاريخ البدء</h4>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
              <span>{formatDate(project.start_date)}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">الموعد النهائي</h4>
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 text-muted-foreground mr-2" />
              <span>{formatDate(project.due_date)}</span>
            </div>
          </div>
        </div>
        
        {/* Project task statistics */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">إحصائيات المهام</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-md p-3 text-center">
              <div className="text-2xl font-bold">{completedTasksCount}/{totalTasksCount}</div>
              <div className="text-xs text-muted-foreground">المهام المكتملة</div>
            </div>
            
            <div className="bg-gray-50 rounded-md p-3 text-center">
              <div className="text-2xl font-bold">{completionPercentage}%</div>
              <div className="text-xs text-muted-foreground">نسبة الإنجاز</div>
            </div>
            
            <div className="bg-gray-50 rounded-md p-3 text-center relative overflow-hidden">
              <div 
                className="absolute bottom-0 left-0 bg-green-100 h-1" 
                style={{ width: `${completionPercentage}%` }} 
              />
              <div className="text-2xl font-bold z-10 relative">
                {completionPercentage === 100 ? (
                  <div className="flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-1" />
                    مكتمل
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-1" />
                    قيد التنفيذ
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">حالة المشروع</div>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Project Edit Dialog */}
      <ProjectEditDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        project={project}
        onProjectUpdated={onProjectUpdated}
      />
    </Card>
  );
};
