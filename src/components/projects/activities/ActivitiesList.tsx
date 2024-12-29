import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarDays, MapPin } from "lucide-react";

interface ActivitiesListProps {
  activities: Array<{
    id: string;
    title: string;
    date: string;
    location: string;
    event_type: "online" | "in-person";
    event_hours?: number;
  }>;
  onEditActivity: (activity: any) => void;
  onDeleteActivity: (activity: any) => void;
}

export const ActivitiesList = ({ 
  activities,
  onEditActivity,
  onDeleteActivity
}: ActivitiesListProps) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        لا توجد أنشطة مضافة لهذا المشروع
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">النشاط</TableHead>
            <TableHead className="text-right">التاريخ</TableHead>
            <TableHead className="text-right">المكان</TableHead>
            <TableHead className="text-right">النوع</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell className="font-medium">{activity.title}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  {activity.date}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {activity.location}
                </div>
              </TableCell>
              <TableCell>
                {activity.event_type === "online" ? "عن بعد" : "حضوري"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditActivity(activity)}
                  >
                    تعديل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteActivity(activity)}
                  >
                    حذف
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};