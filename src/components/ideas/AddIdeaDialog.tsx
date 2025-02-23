import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddIdeaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CostItem {
  item: string;
  quantity: number;
  total_cost: number;
}

interface Department {
  name: string;
  contribution: string;
}

interface Partner {
  name: string;
  contribution: string;
}

interface SimilarIdea {
  title: string;
  link: string;
  file?: File;
}

export const AddIdeaDialog = ({ open, onOpenChange }: AddIdeaDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [opportunity, setOpportunity] = useState("");
  const [problem, setProblem] = useState("");
  const [departments, setDepartments] = useState<Department[]>([{ name: "", contribution: "" }]);
  const [benefits, setBenefits] = useState("");
  const [requiredResources, setRequiredResources] = useState("");
  const [proposedDate, setProposedDate] = useState("");
  const [duration, setDuration] = useState("");
  const [ideaType, setIdeaType] = useState("تطويرية");
  const [similarIdeas, setSimilarIdeas] = useState<SimilarIdea[]>([{ title: "", link: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  const [partners, setPartners] = useState<Partner[]>([{ name: "", contribution: "" }]);
  const [costs, setCosts] = useState<CostItem[]>([{ item: "", quantity: 0, total_cost: 0 }]);

  const queryClient = useQueryClient();

  useEffect(() => {
    const newTotal = costs.reduce((sum, cost) => sum + (cost.total_cost || 0), 0);
    setTotalCost(newTotal);
  }, [costs]);

  const handleDepartmentChange = (index: number, field: keyof Department, value: string) => {
    const newDepartments = [...departments];
    newDepartments[index][field] = value;
    setDepartments(newDepartments);
  };

  const addDepartment = () => {
    setDepartments([...departments, { name: "", contribution: "" }]);
  };

  const handlePartnerChange = (index: number, field: keyof Partner, value: string) => {
    const newPartners = [...partners];
    newPartners[index][field] = value;
    setPartners(newPartners);
  };

  const addPartner = () => {
    setPartners([...partners, { name: "", contribution: "" }]);
  };

  const handleCostChange = (index: number, field: keyof CostItem, value: number | string) => {
    const newCosts = [...costs];
    if (typeof newCosts[index] === 'object') {
      (newCosts[index] as any)[field] = value;
      setCosts(newCosts);
    }
  };

  const addCostItem = () => {
    setCosts([...costs, { item: "", quantity: 0, total_cost: 0 }]);
  };

  const handleSimilarIdeaChange = (index: number, field: keyof SimilarIdea, value: string) => {
    const newIdeas = [...similarIdeas];
    newIdeas[index][field] = value;
    setSimilarIdeas(newIdeas);
  };

  const addSimilarIdea = () => {
    if (similarIdeas.length < 10) {
      setSimilarIdeas([...similarIdeas, { title: "", link: "" }]);
    } else {
      toast.error("لا يمكن إضافة أكثر من 10 أفكار مشابهة");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('ideas')
        .insert([
          {
            title,
            description,
            opportunity,
            problem,
            contributing_departments: departments.filter(d => d.name && d.contribution),
            expected_partners: partners.filter(p => p.name && p.contribution),
            benefits,
            expected_costs: costs.filter(c => c.item && c.quantity > 0),
            required_resources: requiredResources,
            proposed_execution_date: proposedDate,
            duration,
            idea_type: ideaType,
            similar_ideas: similarIdeas.filter(idea => idea.title || idea.link),
            status: 'draft'
          }
        ]);

      if (error) throw error;

      toast.success("تم إضافة الفكرة بنجاح");
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      onOpenChange(false);
      
      // Reset form
      setTitle("");
      setDescription("");
      setOpportunity("");
      setProblem("");
      setDepartments([{ name: "", contribution: "" }]);
      setBenefits("");
      setRequiredResources("");
      setProposedDate("");
      setDuration("");
      setIdeaType("تطويرية");
      setSimilarIdeas([{ title: "", link: "" }]);
      setPartners([{ name: "", contribution: "" }]);
      setCosts([{ item: "", quantity: 0, total_cost: 0 }]);
    } catch (error) {
      console.error('Error adding idea:', error);
      toast.error("حدث خطأ أثناء إضافة الفكرة");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="bg-white rounded-lg border border-border p-6 mt-6">
      <h2 className="text-2xl font-bold mb-6 text-right">إضافة فكرة جديدة</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-right block text-sm font-medium">
              عنوان الفكرة
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-right"
              placeholder="أدخل عنوان الفكرة"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="ideaType" className="text-right block text-sm font-medium">
              نوع الفكرة
            </label>
            <select
              id="ideaType"
              value={ideaType}
              onChange={(e) => setIdeaType(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-right"
              required
            >
              <option value="تطويرية">تطويرية</option>
              <option value="إبداعية">إبداعية</option>
              <option value="ابتكارية">ابتكارية</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-right block text-sm font-medium">
            وصف الفكرة
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-right min-h-[100px]"
            placeholder="اشرح فكرتك بالتفصيل"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="opportunity" className="text-right block text-sm font-medium">
            الفرصة التي تحققها الفكرة
          </label>
          <Textarea
            id="opportunity"
            value={opportunity}
            onChange={(e) => setOpportunity(e.target.value)}
            className="text-right min-h-[100px]"
            placeholder="اشرح الفرصة التي تحققها فكرتك"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="problem" className="text-right block text-sm font-medium">
            الظاهرة التي تعالجها الفكرة
          </label>
          <Textarea
            id="problem"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            className="text-right"
            placeholder="اشرح المشكلة التي تعالجها فكرتك"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="proposedDate" className="text-right block text-sm font-medium">
              تاريخ التنفيذ المقترح
            </label>
            <Input
              type="date"
              id="proposedDate"
              value={proposedDate}
              onChange={(e) => setProposedDate(e.target.value)}
              className="text-right"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="duration" className="text-right block text-sm font-medium">
              المدة المتوقعة للتنفيذ
            </label>
            <Input
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="text-right"
              placeholder="مثال: 3 أشهر"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-right block text-sm font-medium">
            الإدارات والوحدات المساهمة
          </label>
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2 mb-2 font-medium text-right">
              <div>اسم الإدارة/الوحدة</div>
              <div>المساهمة المتوقعة</div>
            </div>
            {departments.map((department, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={department.name}
                  onChange={(e) => handleDepartmentChange(index, 'name', e.target.value)}
                  className="text-right"
                  placeholder="اسم الإدارة/الوحدة"
                />
                <Input
                  value={department.contribution}
                  onChange={(e) => handleDepartmentChange(index, 'contribution', e.target.value)}
                  className="text-right"
                  placeholder="المساهمة المتوقعة"
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addDepartment}
              className="w-full mt-2"
            >
              إضافة إدارة/وحدة
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-right block text-sm font-medium">
            الشركاء المتوقعون ومساهماتهم
          </label>
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2 mb-2 font-medium text-right">
              <div>اسم الشريك</div>
              <div>المساهمة المتوقعة</div>
            </div>
            {partners.map((partner, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={partner.name}
                  onChange={(e) => handlePartnerChange(index, 'name', e.target.value)}
                  className="text-right"
                  placeholder="اسم الشريك"
                />
                <Input
                  value={partner.contribution}
                  onChange={(e) => handlePartnerChange(index, 'contribution', e.target.value)}
                  className="text-right"
                  placeholder="المساهمة المتوقعة"
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addPartner}
              className="w-full mt-2"
            >
              إضافة شريك
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-right block text-sm font-medium">
            جدول تكلفة الفكرة المتوقعة
          </label>
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-2 mb-2 font-medium text-right">
              <div>البند</div>
              <div>العدد</div>
              <div>التكلفة الإجمالية</div>
            </div>
            {costs.map((cost, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={cost.item}
                  onChange={(e) => handleCostChange(index, 'item', e.target.value)}
                  className="text-right"
                  placeholder="البند"
                />
                <Input
                  type="number"
                  value={cost.quantity}
                  onChange={(e) => handleCostChange(index, 'quantity', Number(e.target.value))}
                  className="text-right"
                  placeholder="العدد"
                />
                <Input
                  type="number"
                  value={cost.total_cost}
                  onChange={(e) => handleCostChange(index, 'total_cost', Number(e.target.value))}
                  className="text-right"
                  placeholder="التكلفة الإجمالية"
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addCostItem}
              className="w-full mb-2"
            >
              إضافة بند تكلفة
            </Button>
            <div className="text-left font-medium mt-4 p-2 bg-secondary rounded">
              إجمالي التكلفة: {totalCost.toLocaleString()} ريال
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-right block text-sm font-medium">
            الأفكار المشابهة
          </label>
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2 mb-2 font-medium text-right">
              <div>عنوان الفكرة</div>
              <div>الرابط</div>
            </div>
            {similarIdeas.map((idea, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={idea.title}
                  onChange={(e) => handleSimilarIdeaChange(index, 'title', e.target.value)}
                  className="text-right"
                  placeholder="عنوان الفكرة"
                />
                <Input
                  value={idea.link}
                  onChange={(e) => handleSimilarIdeaChange(index, 'link', e.target.value)}
                  className="text-right"
                  placeholder="رابط الفكرة"
                />
              </div>
            ))}
            {similarIdeas.length < 10 && (
              <Button
                type="button"
                variant="outline"
                onClick={addSimilarIdea}
                className="w-full"
              >
                إضافة فكرة مشابهة
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="benefits" className="text-right block text-sm font-medium">
            العوائد من تنفيذ الفكرة
          </label>
          <Textarea
            id="benefits"
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
            className="text-right"
            placeholder="اذكر العوائد المتوقعة من تنفيذ الفكرة"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="requiredResources" className="text-right block text-sm font-medium">
            الموارد التنفيذية المطلوبة
          </label>
          <Textarea
            id="requiredResources"
            value={requiredResources}
            onChange={(e) => setRequiredResources(e.target.value)}
            className="text-right"
            placeholder="اذكر الموارد المطلوبة لتنفيذ الفكرة"
            required
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "جاري الإضافة..." : "إضافة الفكرة"}
          </Button>
        </div>
      </form>
    </div>
  );
};
