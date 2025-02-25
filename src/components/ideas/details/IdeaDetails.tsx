
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return format(date, "d MMMM yyyy", { locale: ar });
    } catch {
      return dateStr;
    }
  };

  const calculateTotalCost = (costs: { total_cost: number }[]) => {
    return costs.reduce((sum, cost) => sum + (cost.total_cost || 0), 0);
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full space-y-4 text-right bg-white rounded-lg shadow-sm p-6"
    >
      <div className="flex items-center justify-between border-b pb-4">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="hover:bg-purple-50">
            {isOpen ? (
              <>
                <EyeOff className="ml-2 h-4 w-4 text-purple-600" />
                <span className="text-purple-600">إخفاء التفاصيل</span>
              </>
            ) : (
              <>
                <Eye className="ml-2 h-4 w-4 text-purple-600" />
                <span className="text-purple-600">عرض التفاصيل</span>
              </>
            )}
          </Button>
        </CollapsibleTrigger>
        <h2 className="text-2xl font-semibold text-purple-700">تفاصيل الفكرة</h2>
      </div>

      <CollapsibleContent className="space-y-8">
        <section className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-purple-800">نوع الفكرة</h3>
          <p className="text-gray-700">{idea.idea_type}</p>
        </section>

        <section className="bg-white p-6 rounded-lg border border-purple-100">
          <h3 className="text-lg font-semibold mb-3 text-purple-800">وصف الفكرة</h3>
          <p className="text-gray-700 leading-relaxed">{idea.description}</p>
        </section>

        <section className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-purple-800">المشكلة</h3>
          <p className="text-gray-700 leading-relaxed">{idea.problem}</p>
        </section>

        <section className="bg-white p-6 rounded-lg border border-purple-100">
          <h3 className="text-lg font-semibold mb-3 text-purple-800">الفرصة</h3>
          <p className="text-gray-700 leading-relaxed">{idea.opportunity}</p>
        </section>

        <section className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-purple-800">الفوائد المتوقعة</h3>
          <p className="text-gray-700 leading-relaxed">{idea.benefits}</p>
        </section>

        <section className="bg-white p-6 rounded-lg border border-purple-100">
          <h3 className="text-lg font-semibold mb-3 text-purple-800">الموارد المطلوبة</h3>
          <p className="text-gray-700 leading-relaxed">{idea.required_resources}</p>
        </section>

        <section className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-purple-800">التنفيذ المقترح</h3>
          <div className="space-y-3">
            <p className="text-gray-700">
              تاريخ التنفيذ: {formatDate(idea.proposed_execution_date)}
            </p>
            <p className="text-gray-700">
              المدة المتوقعة: {idea.duration}
            </p>
          </div>
        </section>

        {idea.contributing_departments?.length > 0 && (
          <section className="bg-white p-6 rounded-lg border border-purple-100">
            <h3 className="text-lg font-semibold mb-4 text-purple-800">الإدارات المساهمة</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {idea.contributing_departments.map((dept, index) => (
                <div key={index} className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-purple-700">{dept.name}</h4>
                  <p className="text-sm text-gray-600">{dept.contribution}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {idea.expected_costs?.length > 0 && (
          <section className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-purple-800">التكاليف المتوقعة</h3>
            <div className="overflow-x-auto bg-white rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="p-3 text-right text-purple-800">البند</th>
                    <th className="p-3 text-center text-purple-800">الكمية</th>
                    <th className="p-3 text-center text-purple-800">التكلفة الإجمالية</th>
                  </tr>
                </thead>
                <tbody>
                  {idea.expected_costs.map((cost, index) => (
                    <tr key={index} className="border-b border-purple-50 hover:bg-purple-50/50 transition-colors">
                      <td className="p-3 text-gray-700">{cost.item}</td>
                      <td className="p-3 text-center text-gray-700">{cost.quantity}</td>
                      <td className="p-3 text-center text-gray-700">{cost.total_cost} ريال</td>
                    </tr>
                  ))}
                  <tr className="bg-purple-100">
                    <td colSpan={2} className="p-3 font-semibold text-left text-purple-800">المجموع الكلي:</td>
                    <td className="p-3 text-center font-semibold text-purple-800">
                      {calculateTotalCost(idea.expected_costs)} ريال
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {idea.expected_partners?.length > 0 && (
          <section className="bg-white p-6 rounded-lg border border-purple-100">
            <h3 className="text-lg font-semibold mb-4 text-purple-800">الشركاء المتوقعون</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="p-3 text-right text-purple-800 border-b">اسم الشريك</th>
                    <th className="p-3 text-right text-purple-800 border-b">المساهمة</th>
                  </tr>
                </thead>
                <tbody>
                  {idea.expected_partners.map((partner, index) => (
                    <tr key={index} className="border-b border-purple-50 hover:bg-purple-50/50 transition-colors">
                      <td className="p-3 text-gray-700 font-medium">{partner.name}</td>
                      <td className="p-3 text-gray-600">{partner.contribution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {idea.similar_ideas?.length > 0 && (
          <section className="bg-white p-6 rounded-lg border border-purple-100">
            <h3 className="text-lg font-semibold mb-4 text-purple-800">الأفكار المشابهة</h3>
            <div className="overflow-hidden rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="p-3 text-right text-purple-800 border-b">عنوان الفكرة</th>
                    <th className="p-3 text-right text-purple-800 border-b">الرابط</th>
                  </tr>
                </thead>
                <tbody>
                  {idea.similar_ideas.map((similar, index) => (
                    <tr key={index} className="border-b border-purple-50 hover:bg-purple-50/50 transition-colors">
                      <td className="p-3 text-gray-700">{similar.title}</td>
                      <td className="p-3">
                        <a 
                          href={similar.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-700 hover:underline"
                        >
                          عرض الفكرة
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {idea.supporting_files?.length > 0 && (
          <section className="bg-white p-6 rounded-lg border border-purple-100">
            <h3 className="text-lg font-semibold mb-4 text-purple-800">الملفات الداعمة</h3>
            <div className="space-y-3">
              {idea.supporting_files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-purple-50 p-4 rounded-lg">
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <a
                    href={file.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 hover:underline text-sm"
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
