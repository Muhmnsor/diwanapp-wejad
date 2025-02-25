
interface IdeaMetadataProps {
  created_by: string;
  created_at: string;
  status: string;
  title: string;
  discussion_period?: string;
}

export const IdeaMetadata = ({ created_by, created_at, status, title, discussion_period }: IdeaMetadataProps) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'draft':
        return 'مسودة';
      case 'under_review':
        return 'قيد المراجعة';
      case 'approved':
        return 'تمت الموافقة';
      case 'rejected':
        return 'مرفوضة';
      default:
        return 'مؤرشفة';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">{title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>بواسطة: {created_by}</span>
            <span>•</span>
            <span>{new Date(created_at).toLocaleDateString('ar-SA')}</span>
            {discussion_period && (
              <>
                <span>•</span>
                <span>مدة المناقشة: {discussion_period} يوم</span>
              </>
            )}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${getStatusClass(status)}`}>
          {getStatusDisplay(status)}
        </span>
      </div>
    </div>
  );
};
