interface ReportHeaderProps {
  createdAt: string;
  onDownload: () => void;
  eventTitle?: string;
}

export const ReportHeader = ({ createdAt, onDownload, eventTitle }: ReportHeaderProps) => {
  const formattedDate = new Date(createdAt).toLocaleDateString('ar-SA');
  
  return (
    <div className="flex flex-col gap-1">
      {eventTitle && (
        <h3 className="text-lg font-semibold text-primary">
          {eventTitle}
        </h3>
      )}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          تاريخ التقرير: {formattedDate}
        </span>
        <Button variant="outline" size="sm" onClick={onDownload}>
          تحميل التقرير
        </Button>
      </div>
    </div>
  );
};