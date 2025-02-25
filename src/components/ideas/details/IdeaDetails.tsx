import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { ar } from "date-fns/locale";

interface IdeaDetailsProps {
  idea: {
    description: string;
    opportunity: string;
    problem: string;
    benefits: string;
    required_resources: string;
    contributing_departments: { name: string; contribution: string }[];
    expected_costs: { item: string; quantity: number; total_cost: number }[];
    expected_partners: { name: string; contribution: string }[];
    discussion_period: string;
    similar_ideas: { title: string; link: string }[];
    supporting_files: { name: string; file_path: string }[];
    proposed_execution_date: string;
    duration: string;
    idea_type: string;
    created_at: string;
  };
}

export const IdeaDetails = ({ idea }: IdeaDetailsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        const discussionDays = parseInt(idea.discussion_period);
        if (isNaN(discussionDays)) return;

        const createdDate = new Date(idea.created_at);
        const discussionEndDate = new Date(createdDate);
        discussionEndDate.setDate(discussionEndDate.getDate() + discussionDays);
        
        const now = new Date().getTime();
        const endTime = discussionEndDate.getTime();
        const distance = endTime - now;

        if (distance > 0) {
          const duration = intervalToDuration({ start: now, end: endTime });
          setCountdown({
            days: duration.days || 0,
            hours: duration.hours || 0,
            minutes: duration.minutes || 0,
            seconds: duration.seconds || 0
          });
        } else {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      } catch (error) {
        console.error('Error calculating time left:', error);
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [idea.discussion_period, idea.created_at]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return format(date, "d MMMM yyyy", { locale: ar });
    } catch {
      return dateStr;
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full space-y-2 text-right"
    >
      <p className="text-muted-foreground text-sm mb-2">مدة المناقشة: {idea.discussion_period} يوم</p>
      <div className="flex items-start justify-between flex-row-reverse">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            {isOpen ? (
              <>
                <EyeOff className="ml-2 h-4 w-4" />
                إخفاء التفاصيل
              </>
            ) : (
              <>
                <Eye className="ml-2 h-4 w-4" />
                عرض التفاصيل
              </>
            )}
          </Button>
        </CollapsibleTrigger>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">تفاصيل الفكرة</h2>
          <div className="text-sm mt-1">
            {countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0 ? (
              <p className="text-destructive">انتهت فترة المناقشة</p>
            ) : (
              <p className="text-primary">
                متبقي: {countdown.days} يوم {countdown.hours} ساعة {countdown.minutes} دقيقة {countdown.seconds} ثانية
              </p>
            )}
          </div>
        </div>
      </div>

      <CollapsibleContent className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold mb-2">نوع الفكرة</h3>
          <p className="text-muted-foreground">{idea.idea_type}</p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">وصف الفكرة</h3>
          <p className="text-muted-foreground">{idea.description}</p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">المشكلة</h3>
          <p className="text-muted-foreground">{idea.problem}</p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">الفرصة</h3>
          <p className="text-muted-foreground">{idea.opportunity}</p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">الفوائد المتوقعة</h3>
          <p className="text-muted-foreground">{idea.benefits}</p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">الموارد المطلوبة</h3>
          <p className="text-muted-foreground">{idea.required_resources}</p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">التنفيذ المقترح</h3>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              تاريخ التنفيذ: {formatDate(idea.proposed_execution_date)}
            </p>
            <p className="text-muted-foreground">
              المدة المتوقعة: {idea.duration}
            </p>
          </div>
        </section>

        {idea.contributing_departments?.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-2">الإدارات المساهمة</h3>
            <div className="space-y-3">
              {idea.contributing_departments.map((dept, index) => (
                <div key={index} className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{dept.name}</h4>
                  <p className="text-sm text-muted-foreground">{dept.contribution}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {idea.expected_costs?.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-2">التكاليف المتوقعة</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 text-right">البند</th>
                    <th className="p-2 text-center">الكمية</th>
                    <th className="p-2 text-center">التكلفة الإجمالية</th>
                  </tr>
                </thead>
                <tbody>
                  {idea.expected_costs.map((cost, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{cost.item}</td>
                      <td className="p-2 text-center">{cost.quantity}</td>
                      <td className="p-2 text-center">{cost.total_cost} ريال</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {idea.expected_partners?.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-2">الشركاء المتوقعون</h3>
            <div className="space-y-3">
              {idea.expected_partners.map((partner, index) => (
                <div key={index} className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{partner.name}</h4>
                  <p className="text-sm text-muted-foreground">{partner.contribution}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {idea.similar_ideas?.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-2">الأفكار المشابهة</h3>
            <div className="space-y-3">
              {idea.similar_ideas.map((similar, index) => (
                <div key={index} className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{similar.title}</h4>
                  <a 
                    href={similar.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    رابط الفكرة
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {idea.supporting_files?.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-2">الملفات الداعمة</h3>
            <div className="space-y-2">
              {idea.supporting_files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                  <span className="text-sm">{file.name}</span>
                  <a
                    href={file.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    تحميل الملف
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
