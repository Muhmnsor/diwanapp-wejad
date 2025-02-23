
import { useState } from "react";
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

interface Partner {
  name: string;
  contribution: string;
}

export const AddIdeaDialog = ({ open, onOpenChange }: AddIdeaDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [opportunity, setOpportunity] = useState("");
  const [problem, setProblem] = useState("");
  const [departments, setDepartments] = useState("");
  const [benefits, setBenefits] = useState("");
  const [requiredResources, setRequiredResources] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [partners, setPartners] = useState<Partner[]>([{ name: "", contribution: "" }]);
  const [costs, setCosts] = useState<CostItem[]>([{ item: "", quantity: 0, total_cost: 0 }]);

  const queryClient = useQueryClient();

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
            contributing_departments: departments.split(',').map(d => d.trim()).filter(d => d),
            expected_partners: partners.filter(p => p.name && p.contribution),
            benefits,
            expected_costs: costs.filter(c => c.item && c.quantity > 0),
            required_resources: requiredResources,
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
      setDepartments("");
      setBenefits("");
      setRequiredResources("");
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
            المشكلة التي تعالجها الفكرة
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

        <div className="space-y-2">
          <label htmlFor="departments" className="text-right block text-sm font-medium">
            الإدارات والوحدات المساهمة
          </label>
          <Input
            id="departments"
            value={departments}
            onChange={(e) => setDepartments(e.target.value)}
            className="text-right"
            placeholder="أدخل الإدارات مفصولة بفواصل"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-right block text-sm font-medium">
            الشركاء المتوقعون ومساهماتهم
          </label>
          {partners.map((partner, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input
                value={partner.contribution}
                onChange={(e) => handlePartnerChange(index, 'contribution', e.target.value)}
                className="text-right"
                placeholder="المساهمة المتوقعة"
              />
              <Input
                value={partner.name}
                onChange={(e) => handlePartnerChange(index, 'name', e.target.value)}
                className="text-right"
                placeholder="اسم الشريك"
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addPartner}
            className="w-full"
          >
            إضافة شريك
          </Button>
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
          <label className="text-right block text-sm font-medium">
            جدول تكلفة الفكرة المتوقعة
          </label>
          {costs.map((cost, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input
                type="number"
                value={cost.total_cost}
                onChange={(e) => handleCostChange(index, 'total_cost', Number(e.target.value))}
                className="text-right"
                placeholder="التكلفة الإجمالية"
              />
              <Input
                type="number"
                value={cost.quantity}
                onChange={(e) => handleCostChange(index, 'quantity', Number(e.target.value))}
                className="text-right"
                placeholder="العدد"
              />
              <Input
                value={cost.item}
                onChange={(e) => handleCostChange(index, 'item', e.target.value)}
                className="text-right"
                placeholder="البند"
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addCostItem}
            className="w-full"
          >
            إضافة بند تكلفة
          </Button>
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
