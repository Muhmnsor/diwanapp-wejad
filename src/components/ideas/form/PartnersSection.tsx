
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Partner } from "../types";

interface PartnersSectionProps {
  partners: Partner[];
  onPartnerChange: (index: number, field: keyof Partner, value: string) => void;
  onAddPartner: () => void;
}

export const PartnersSection = ({
  partners,
  onPartnerChange,
  onAddPartner,
}: PartnersSectionProps) => {
  return (
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
              onChange={(e) => onPartnerChange(index, 'name', e.target.value)}
              className="text-right"
              placeholder="اسم الشريك"
            />
            <Input
              value={partner.contribution}
              onChange={(e) => onPartnerChange(index, 'contribution', e.target.value)}
              className="text-right"
              placeholder="المساهمة المتوقعة"
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={onAddPartner}
          className="w-full mt-2"
        >
          إضافة شريك
        </Button>
      </div>
    </div>
  );
};
