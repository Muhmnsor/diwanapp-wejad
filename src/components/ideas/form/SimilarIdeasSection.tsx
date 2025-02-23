
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimilarIdea } from "../types";

interface SimilarIdeasSectionProps {
  similarIdeas: SimilarIdea[];
  onSimilarIdeaChange: (index: number, field: keyof SimilarIdea, value: string) => void;
  onAddSimilarIdea: () => void;
}

export const SimilarIdeasSection = ({
  similarIdeas,
  onSimilarIdeaChange,
  onAddSimilarIdea,
}: SimilarIdeasSectionProps) => {
  return (
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
              onChange={(e) => onSimilarIdeaChange(index, 'title', e.target.value)}
              className="text-right"
              placeholder="عنوان الفكرة"
            />
            <Input
              value={idea.link}
              onChange={(e) => onSimilarIdeaChange(index, 'link', e.target.value)}
              className="text-right"
              placeholder="رابط الفكرة"
            />
          </div>
        ))}
        {similarIdeas.length < 10 && (
          <Button
            type="button"
            variant="outline"
            onClick={onAddSimilarIdea}
            className="w-full"
          >
            إضافة فكرة مشابهة
          </Button>
        )}
      </div>
    </div>
  );
};
