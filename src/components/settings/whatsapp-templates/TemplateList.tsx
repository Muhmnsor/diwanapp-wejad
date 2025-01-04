import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2, Edit, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TemplateListProps {
  templates: any[];
  onEdit: (template: any) => void;
  onDelete: (template: any) => void;
  isLoading?: boolean;
  error?: any;
}

export const TemplateList = ({
  templates,
  onEdit,
  onDelete,
  isLoading,
  error
}: TemplateListProps) => {
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          حدث خطأ أثناء تحميل القوالب
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-20 bg-secondary/50 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (!templates?.length) {
    return (
      <div className="text-center p-8 bg-secondary/50 rounded-lg">
        <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">لا توجد قوالب حالياً</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <div
          key={template.id}
          className="p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow animate-fade-in"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {template.content}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>النوع: {template.template_type === 'custom' ? 'مخصص' : 'افتراضي'}</span>
                <span>•</span>
                <span>
                  {template.notification_type === 'event_registration'
                    ? 'تسجيل في فعالية'
                    : template.notification_type === 'event_reminder'
                    ? 'تذكير بفعالية'
                    : 'تغذية راجعة'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(template)}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">تعديل</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDelete(template)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">حذف</span>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};