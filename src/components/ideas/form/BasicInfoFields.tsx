
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BasicInfoFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  opportunity: string;
  setOpportunity: (value: string) => void;
  problem: string;
  setProblem: (value: string) => void;
  ideaType: string;
  setIdeaType: (value: string) => void;
}

export const BasicInfoFields = ({
  title,
  setTitle,
  description,
  setDescription,
  opportunity,
  setOpportunity,
  problem,
  setProblem,
  ideaType,
  setIdeaType,
}: BasicInfoFieldsProps) => {
  return (
    <>
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
            <option value="برنامج">برنامج</option>
            <option value="مشروع">مشروع</option>
            <option value="استثمار">استثمار</option>
            <option value="شراكة">شراكة</option>
            <option value="زيارة">زيارة</option>
            <option value="تطوير">تطوير</option>
            <option value="توظيف">توظيف</option>
            <option value="شراء">شراء</option>
            <option value="أخرى">أخرى</option>
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
    </>
  );
};
