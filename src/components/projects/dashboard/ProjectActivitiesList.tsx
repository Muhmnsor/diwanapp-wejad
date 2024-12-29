import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { formatTime12Hour } from "@/utils/dateTimeUtils";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface ProjectActivitiesListProps {
  projectActivities: any[];
  onEdit: (activity: any) => void;
  onDelete: (activity: any) => void;
}

export const ProjectActivitiesList = ({
  projectActivities,
  onEdit,
  onDelete,
}: ProjectActivitiesListProps) => {
  console.log("ProjectActivitiesList - activities:", projectActivities);
  
  if (projectActivities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        لا توجد أنشطة مضافة لهذا المشروع
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>عنوان النشاط</TableHead>
            <TableHead>الوصف</TableHead>
            <TableHead>التاريخ</TableHead>
            <TableHead>الوقت</TableHead>
            <TableHead>المكان</TableHead>
            <TableHead>عدد الساعات</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projectActivities.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell className="font-medium">
                {activity.event.title}
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {activity.event.description}
              </TableCell>
              <TableCell>{activity.event.date}</TableCell>
              <TableCell>{formatTime12Hour(activity.event.time)}</TableCell>
              <TableCell>{activity.event.location}</TableCell>
              <TableCell>{activity.event.event_hours}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(activity)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>تعديل النشاط</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(activity)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>حذف النشاط</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};