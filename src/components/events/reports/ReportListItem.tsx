import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Download } from "lucide-react";

interface ReportListItemProps {
  report: {
    id: string;
    event_id: string;
    report_text: string;
    detailed_description: string;
    event_duration: string;
    attendees_count: string;
    event_objectives: string;
    impact_on_participants: string;
    photos: { url: string; description: string }[];
    created_at: string;
  };
}

export const ReportListItem = ({ report }: ReportListItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: feedback } = useQuery({
    queryKey: ['event-feedback', report.event_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_feedback')
        .select('*')
        .eq('event_id', report.event_id);

      if (error) throw error;
      return data;
    },
  });

  const calculateAverage = (ratings: (number | null)[]) => {
    const validRatings = ratings.filter((r): r is number => r !== null);
    if (validRatings.length === 0) return 0;
    return validRatings.reduce((a, b) => a + b, 0) / validRatings.length;
  };

  const averages = feedback ? {
    overall: calculateAverage(feedback.map(f => f.overall_rating)),
    content: calculateAverage(feedback.map(f => f.content_rating)),
    organization: calculateAverage(feedback.map(f => f.organization_rating)),
    presenter: calculateAverage(feedback.map(f => f.presenter_rating)),
  } : null;

  const handleDownloadReport = () => {
    // Create report content
    const reportContent = `
تقرير الفعالية

التاريخ: ${format(new Date(report.created_at), 'PPP', { locale: ar })}

نص التقرير:
${report.report_text}

التفاصيل:
- مدة الفعالية: ${report.event_duration}
- عدد المشاركين: ${report.attendees_count}

الأهداف:
${report.event_objectives}

الأثر على المشاركين:
${report.impact_on_participants}

ملخص التقييمات:
- التقييم العام: ${averages?.overall.toFixed(1) ?? 'لا يوجد'} / 5
- تقييم المحتوى: ${averages?.content.toFixed(1) ?? 'لا يوجد'} / 5
- تقييم التنظيم: ${averages?.organization.toFixed(1) ?? 'لا يوجد'} / 5
- تقييم المقدم: ${averages?.presenter.toFixed(1) ?? 'لا يوجد'} / 5

الصور المرفقة:
${report.photos.map(photo => `- ${photo.description}: ${photo.url}`).join('\n')}
    `;

    // Create blob and download
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير-الفعالية-${format(new Date(report.created_at), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-4 border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon">
                {isOpen ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </CollapsibleTrigger>
            <span className="text-sm text-gray-500">
              {format(new Date(report.created_at), 'PPP', { locale: ar })}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleDownloadReport}
          >
            <Download size={16} />
            تحميل التقرير
          </Button>
        </div>

        <CollapsibleContent>
          <div className="space-y-6 pt-4">
            <div>
              <h4 className="font-medium mb-2">نص التقرير</h4>
              <p className="text-gray-600 whitespace-pre-wrap">{report.report_text}</p>
            </div>

            <Separator />

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

              {averages && (
                <div>
                  <h4 className="font-medium mb-2">ملخص التقييمات</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">
                      <span className="font-medium">التقييم العام:</span>{" "}
                      {averages.overall.toFixed(1)} / 5
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">تقييم المحتوى:</span>{" "}
                      {averages.content.toFixed(1)} / 5
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">تقييم التنظيم:</span>{" "}
                      {averages.organization.toFixed(1)} / 5
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">تقييم المقدم:</span>{" "}
                      {averages.presenter.toFixed(1)} / 5
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">أهداف الفعالية</h4>
              <p className="text-gray-600 whitespace-pre-wrap">{report.event_objectives}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">الأثر على المشاركين</h4>
              <p className="text-gray-600 whitespace-pre-wrap">{report.impact_on_participants}</p>
            </div>

            {report.photos.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">الصور المرفقة</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.photos.map((photo, index) => (
                    <div key={index} className="space-y-2">
                      <img
                        src={photo.url}
                        alt={photo.description}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <p className="text-sm text-gray-600">{photo.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};