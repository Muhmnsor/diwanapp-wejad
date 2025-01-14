import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface PortfolioFormProps {
  onSubmit: (formData: {
    name: string;
    description: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const PortfolioForm = ({ 
  onSubmit, 
  isSubmitting, 
  onCancel 
}: PortfolioFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>اسم المحفظة</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="أدخل اسم المحفظة"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>الوصف</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="أدخل وصف المحفظة"
          className="h-32"
        />
      </div>

      <div className="flex justify-start gap-2 mt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "جاري الإنشاء..." : "إنشاء المحفظة"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
};