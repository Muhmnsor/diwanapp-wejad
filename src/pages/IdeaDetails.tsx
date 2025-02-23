
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";

interface Idea {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string | null;
  created_at: string;
  created_by: string;
  discussion_period: string;
  opportunity: string;
  problem: string;
  benefits: string;
  required_resources: string;
  contributing_departments: { name: string; contribution: string }[];
  expected_costs: { item: string; quantity: number; total_cost: number }[];
  proposed_execution_date: string;
}

const IdeaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: idea, isLoading } = useQuery({
    queryKey: ['idea', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching idea:', error);
        throw error;
      }

      return data as Idea;
    }
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">جاري التحميل...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">لم يتم العثور على الفكرة</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <main className="flex-1 container mx-auto px-4 py-8" dir="rtl">
        <div className="max-w-4xl mx-auto">
          {/* رأس الصفحة */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className="mb-4"
              onClick={() => navigate('/ideas')}
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى القائمة
            </Button>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">{idea.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>بواسطة: {idea.created_by}</span>
                  <span>•</span>
                  <span>{new Date(idea.created_at).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusClass(idea.status)}`}>
                {getStatusDisplay(idea.status)}
              </span>
            </div>
          </div>

          <Separator className="my-6" />

          {/* محتوى الفكرة */}
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-3">وصف الفكرة</h2>
              <p className="text-muted-foreground leading-relaxed">{idea.description}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">المشكلة</h2>
              <p className="text-muted-foreground leading-relaxed">{idea.problem}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">الفرصة</h2>
              <p className="text-muted-foreground leading-relaxed">{idea.opportunity}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">الفوائد المتوقعة</h2>
              <p className="text-muted-foreground leading-relaxed">{idea.benefits}</p>
            </section>

            {idea.contributing_departments?.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-3">الإدارات المساهمة</h2>
                <div className="space-y-3">
                  {idea.contributing_departments.map((dept, index) => (
                    <div key={index} className="bg-muted p-4 rounded-lg">
                      <h3 className="font-medium mb-2">{dept.name}</h3>
                      <p className="text-sm text-muted-foreground">{dept.contribution}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {idea.expected_costs?.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-3">التكاليف المتوقعة</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-right p-3">البند</th>
                        <th className="text-center p-3">الكمية</th>
                        <th className="text-center p-3">التكلفة الإجمالية</th>
                      </tr>
                    </thead>
                    <tbody>
                      {idea.expected_costs.map((cost, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3">{cost.item}</td>
                          <td className="text-center p-3">{cost.quantity}</td>
                          <td className="text-center p-3">{cost.total_cost} ريال</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* قسم التصويت والمناقشة */}
            <div className="flex justify-between items-center bg-muted p-4 rounded-lg">
              <div className="flex gap-4">
                <Button variant="outline" size="sm">
                  <ThumbsUp className="ml-2 h-4 w-4" />
                  مؤيد
                </Button>
                <Button variant="outline" size="sm">
                  <ThumbsDown className="ml-2 h-4 w-4" />
                  معارض
                </Button>
              </div>
              <Button>
                <MessageSquare className="ml-2 h-4 w-4" />
                إضافة تعليق
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IdeaDetails;
