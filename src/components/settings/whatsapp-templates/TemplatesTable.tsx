import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash } from "lucide-react";

interface Template {
  id: string;
  name: string;
  content: string;
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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-right">اسم القالب</TableHead>
          <TableHead className="text-right">محتوى الرسالة</TableHead>
          <TableHead className="text-right">الإجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates?.map((template) => (
          <TableRow key={template.id}>
            <TableCell className="text-right">{template.name}</TableCell>
            <TableCell className="text-right max-w-md truncate">
              {template.content}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex space-x-2 justify-end">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(template)}
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
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};