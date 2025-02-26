
import { FC } from "react";

interface IdeaBenefitsSectionProps {
  benefits: string;
}

export const IdeaBenefitsSection: FC<IdeaBenefitsSectionProps> = ({ benefits }) => {
  return (
    <section className="bg-purple-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-purple-800">الفوائد المتوقعة</h3>
      <p className="text-gray-700 leading-relaxed">{benefits}</p>
    </section>
  );
};
