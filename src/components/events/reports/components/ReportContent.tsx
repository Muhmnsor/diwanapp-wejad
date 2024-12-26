interface ReportContentProps {
  report: {
    report_text: string;
    detailed_description: string;
    event_duration: string;
    attendees_count: string;
    event_objectives: string;
    impact_on_participants: string;
  };
}

export const ReportContent = ({ report }: ReportContentProps) => {
  return (
    <div className="space-y-6 pt-4">
      <div>
        <h4 className="font-medium mb-2">نص التقرير</h4>
        <p className="text-gray-600 whitespace-pre-wrap">{report.report_text}</p>
      </div>

      <div>
        <h4 className="font-medium mb-2">التفاصيل</h4>
        <p className="text-gray-600 whitespace-pre-wrap">{report.detailed_description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">معلومات الفعالية</h4>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">المدة:</span> {report.event_duration}
            </p>
            <p className="text-sm">
              <span className="font-medium">عدد المشاركين:</span> {report.attendees_count}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">أهداف الفعالية</h4>
        <p className="text-gray-600 whitespace-pre-wrap">{report.event_objectives}</p>
      </div>

      <div>
        <h4 className="font-medium mb-2">الأثر على المشاركين</h4>
        <p className="text-gray-600 whitespace-pre-wrap">{report.impact_on_participants}</p>
      </div>
    </div>
  );
};