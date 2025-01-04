interface TemplateListProps {
  templates: any[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (template: any) => void;
  onDelete: (template: any) => void;
}

export const TemplateList = ({
  templates,
  isLoading,
  error,
  onEdit,
  onDelete
}: TemplateListProps) => {
  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  if (error) {
    return <div>حدث خطأ: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      {templates?.map((template) => (
        <div 
          key={template.id}
          className="flex justify-between items-center p-4 border rounded-lg"
        >
          <div>
            <h3 className="font-semibold">{template.name}</h3>
            <p className="text-sm text-gray-600">{template.content}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(template)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              تعديل
            </button>
            <button
              onClick={() => onDelete(template)}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              حذف
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};