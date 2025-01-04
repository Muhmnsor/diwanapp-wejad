import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash } from "lucide-react";

interface Template {
  id: string;
  name: string;
  content: string;
  template_type: string;
  notification_type: string;
  target_type: string;
  is_default: boolean;
}

interface TemplatesTableProps {
  templates: Template[];
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
}

export const TemplatesTable = ({
  templates,
  onEdit,
  onDelete,
}: TemplatesTableProps) => {
  const getNotificationTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      event_registration: "تسجيل في فعالية",
      event_reminder: "تذكير بفعالية",
      event_feedback: "تغذية راجعة للفعالية",
      project_registration: "تسجيل في مشروع",
      project_activity: "نشاط مشروع"
    };
    return types[type] || type;
  };

  const getTargetTypeLabel = (type: string) => {
    return type === 'event' ? 'فعالية' : 'مشروع';
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50">
            <TableHead className="text-right font-bold">اسم القالب</TableHead>
            <TableHead className="text-right font-bold">نوع الإشعار</TableHead>
            <TableHead className="text-right font-bold">نوع الهدف</TableHead>
            <TableHead className="text-right font-bold">محتوى الرسالة</TableHead>
            <TableHead className="text-center font-bold w-[120px]">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates?.map((template) => (
            <TableRow key={template.id} className="hover:bg-muted/50 transition-colors">
              <TableCell className="text-right font-medium">
                {template.name}
                {template.is_default && (
                  <Badge variant="secondary" className="mr-2">
                    افتراضي
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="outline">
                  {getNotificationTypeLabel(template.notification_type)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Badge>
                  {getTargetTypeLabel(template.target_type)}
                </Badge>
              </TableCell>
              <TableCell className="text-right max-w-md">
                <div className="line-clamp-2 text-muted-foreground">
                  {template.content}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(template)}
                    className="hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      if (window.confirm("هل أنت متأكد من حذف هذا القالب؟")) {
                        onDelete(template.id);
                      }
                    }}
                    className="hover:bg-destructive/90 transition-colors"
                    disabled={template.is_default}
                  >
                    <Trash className="h-4 w-4" />
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